import { Request, Response, NextFunction } from 'express';
import { db } from '../db/index.js';
import { subscriptions, planFeatures, featureUsage } from '../db/schema-sqlite.js';
import { eq, and } from 'drizzle-orm';

interface AuthenticatedRequest extends Request {
  userId?: string;
  subscription?: any;
  planFeatures?: any;
}

// Middleware to check if user has access to a feature
export const requireFeature = (featureName: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId || (req.session as any)?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get user's subscription
      const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, userId)
      });

      if (!subscription) {
        return res.status(403).json({ 
          error: 'No subscription found',
          code: 'NO_SUBSCRIPTION',
          requiredFeature: featureName
        });
      }

      // Get plan features
      const plan = await db.query.planFeatures.findFirst({
        where: eq(planFeatures.plan, subscription.plan)
      });

      if (!plan) {
        return res.status(403).json({ 
          error: 'Invalid plan configuration',
          code: 'INVALID_PLAN' 
        });
      }

      // Check if plan includes the feature
      const hasFeature = plan.features && plan.features[featureName] === true;
      
      if (!hasFeature) {
        return res.status(403).json({
          error: `Feature '${featureName}' not available in your plan`,
          code: 'FEATURE_NOT_AVAILABLE',
          currentPlan: subscription.plan,
          requiredFeature: featureName
        });
      }

      // Attach subscription info to request for use in route handlers
      req.subscription = subscription;
      req.planFeatures = plan;
      
      next();
    } catch (error) {
      console.error('Feature check error:', error);
      res.status(500).json({ error: 'Failed to verify feature access' });
    }
  };
};

// Middleware to check usage limits
export const checkUsageLimit = (featureName: string, increment: number = 1) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId || (req.session as any)?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get subscription and plan info
      const subscription = req.subscription || await db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, userId)
      });

      const plan = req.planFeatures || await db.query.planFeatures.findFirst({
        where: eq(planFeatures.plan, subscription?.plan || 'free')
      });

      if (!subscription || !plan) {
        return res.status(403).json({ error: 'Subscription not found' });
      }

      // Check if feature has unlimited usage (-1)
      const featureLimit = plan[`max${featureName.charAt(0).toUpperCase() + featureName.slice(1)}`];
      
      if (featureLimit === -1) {
        // Unlimited usage
        next();
        return;
      }

      // Get current usage for this month
      const currentMonth = new Date().toISOString().slice(0, 7);
      const usage = await db.query.featureUsage.findFirst({
        where: and(
          eq(featureUsage.userId, userId),
          eq(featureUsage.feature, featureName),
          eq(featureUsage.period, currentMonth)
        )
      });

      const currentUsage = usage?.used || 0;
      const limit = usage?.limit || featureLimit;

      if (currentUsage + increment > limit) {
        return res.status(403).json({
          error: `Usage limit exceeded for ${featureName}`,
          code: 'USAGE_LIMIT_EXCEEDED',
          currentUsage,
          limit,
          featureName,
          currentPlan: subscription.plan
        });
      }

      next();
    } catch (error) {
      console.error('Usage limit check error:', error);
      res.status(500).json({ error: 'Failed to check usage limit' });
    }
  };
};

// Middleware to track feature usage after successful operation
export const trackUsage = (featureName: string, increment: number = 1) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Store original send function
    const originalSend = res.json;
    
    // Override res.json to track usage on successful responses
    res.json = function(body: any) {
      // Only track if response is successful (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        trackFeatureUsage(req.userId || (req.session as any)?.userId, featureName, increment)
          .catch(error => console.error('Error tracking usage:', error));
      }
      
      // Call original send function
      return originalSend.call(this, body);
    };
    
    next();
  };
};

// Helper function to track usage
export async function trackFeatureUsage(userId: string, featureName: string, increment: number = 1) {
  try {
    if (!userId) return;

    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const existingUsage = await db.query.featureUsage.findFirst({
      where: and(
        eq(featureUsage.userId, userId),
        eq(featureUsage.feature, featureName),
        eq(featureUsage.period, currentMonth)
      )
    });

    if (existingUsage) {
      await db.update(featureUsage)
        .set({
          used: existingUsage.used + increment,
          updatedAt: new Date()
        })
        .where(eq(featureUsage.id, existingUsage.id));
    } else {
      // Get user's plan to set the correct limit
      const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, userId)
      });

      if (subscription) {
        const plan = await db.query.planFeatures.findFirst({
          where: eq(planFeatures.plan, subscription.plan)
        });

        if (plan) {
          const featureLimit = plan[`max${featureName.charAt(0).toUpperCase() + featureName.slice(1)}`] || 0;
          
          await db.insert(featureUsage).values({
            userId,
            feature: featureName,
            period: currentMonth,
            used: increment,
            limit: featureLimit === -1 ? 999999 : featureLimit // Use large number for unlimited
          });
        }
      }
    }
  } catch (error) {
    console.error('Error tracking feature usage:', error);
  }
}

// Middleware to check subscription status
export const requireActiveSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId || (req.session as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId)
    });

    if (!subscription) {
      return res.status(403).json({ 
        error: 'No active subscription', 
        code: 'NO_SUBSCRIPTION' 
      });
    }

    if (subscription.status !== 'active' && subscription.status !== 'trial') {
      return res.status(403).json({ 
        error: 'Subscription is not active', 
        code: 'INACTIVE_SUBSCRIPTION',
        status: subscription.status 
      });
    }

    // Check if trial has expired
    if (subscription.status === 'trial' && subscription.trialEndsAt) {
      const now = new Date();
      const trialEnd = new Date(subscription.trialEndsAt);
      
      if (now > trialEnd) {
        // Update subscription status to expired
        await db.update(subscriptions)
          .set({ status: 'expired', updatedAt: new Date() })
          .where(eq(subscriptions.userId, userId));
        
        return res.status(403).json({ 
          error: 'Trial subscription has expired', 
          code: 'TRIAL_EXPIRED' 
        });
      }
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ error: 'Failed to verify subscription' });
  }
};

// Middleware to check plan level
export const requirePlan = (minPlan: string) => {
  const planHierarchy = { free: 0, professional: 1, business: 2, elite: 3 };
  
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const subscription = req.subscription;
      
      if (!subscription) {
        return res.status(403).json({ 
          error: 'No subscription found', 
          code: 'NO_SUBSCRIPTION' 
        });
      }

      const currentPlanLevel = planHierarchy[subscription.plan as keyof typeof planHierarchy] || 0;
      const requiredPlanLevel = planHierarchy[minPlan as keyof typeof planHierarchy] || 0;

      if (currentPlanLevel < requiredPlanLevel) {
        return res.status(403).json({
          error: `This feature requires ${minPlan} plan or higher`,
          code: 'INSUFFICIENT_PLAN',
          currentPlan: subscription.plan,
          requiredPlan: minPlan
        });
      }

      next();
    } catch (error) {
      console.error('Plan check error:', error);
      res.status(500).json({ error: 'Failed to verify plan level' });
    }
  };
};