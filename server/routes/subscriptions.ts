import { Router } from 'express';
import { db } from '../db/index.js';
import { subscriptions, planFeatures, featureUsage, addOns, users } from '../db/schema-sqlite.js';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Plan configurations - these would normally be in a database
const PLAN_CONFIGS = {
  free: {
    name: 'Gratuito',
    price: 0,
    commissionRate: 15,
    maxServices: 3,
    maxProposals: 5,
    maxProjectValue: 1000,
    features: ['basic_chat', 'basic_dashboard', 'email_support']
  },
  professional: {
    name: 'Profissional',
    price: 49,
    commissionRate: 12,
    maxServices: 10,
    maxProposals: 30,
    maxProjectValue: 5000,
    features: ['basic_chat', 'basic_dashboard', 'email_support', 'identity_verification', 'search_boost', 'basic_analytics', 'proposal_templates', 'priority_support', 'push_notifications']
  },
  business: {
    name: 'Business',
    price: 149,
    commissionRate: 10,
    maxServices: -1, // unlimited
    maxProposals: 100,
    maxProjectValue: 25000,
    features: ['basic_chat', 'basic_dashboard', 'email_support', 'identity_verification', 'search_boost', 'basic_analytics', 'proposal_templates', 'priority_support', 'push_notifications', 'kyc_included', 'premium_search', 'advanced_analytics', 'social_media_basic', 'basic_api', 'account_manager', 'phone_support', 'corporate_projects', 'digital_certificate']
  },
  elite: {
    name: 'Elite',
    price: 299,
    commissionRate: 7,
    maxServices: -1, // unlimited
    maxProposals: -1, // unlimited
    maxProjectValue: -1, // unlimited
    features: ['basic_chat', 'basic_dashboard', 'email_support', 'identity_verification', 'search_boost', 'basic_analytics', 'proposal_templates', 'priority_support', 'push_notifications', 'kyc_included', 'premium_search', 'advanced_analytics', 'social_media_basic', 'basic_api', 'account_manager', 'phone_support', 'corporate_projects', 'digital_certificate', 'elite_badge', 'top_search_results', 'ai_analytics', 'social_media_complete', 'unified_inbox', 'auto_posting', 'complete_api', 'white_label', 'vip_support', 'co_marketing']
  }
};

// Middleware to require authentication
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Get current user's subscription
router.get('/current', requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    
    let subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId)
    });

    // If no subscription exists, create a free one
    if (!subscription) {
      const [newSubscription] = await db.insert(subscriptions).values({
        userId,
        plan: 'free',
        status: 'active',
        startDate: new Date(),
        features: {},
        metadata: {}
      }).returning();
      
      subscription = newSubscription;
    }

    // Get current usage
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const usage = await db.query.featureUsage.findMany({
      where: and(
        eq(featureUsage.userId, userId),
        eq(featureUsage.period, currentMonth)
      )
    });

    const usageMap = usage.reduce((acc, item) => {
      acc[item.feature] = {
        used: item.used,
        limit: item.limit
      };
      return acc;
    }, {} as Record<string, { used: number; limit: number }>);

    res.json({
      ...subscription,
      usage: usageMap
    });
  } catch (error) {
    console.error('Error getting current subscription:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

// Get available plans
router.get('/plans', async (req, res) => {
  try {
    const plans = Object.entries(PLAN_CONFIGS).map(([id, config]) => ({
      id,
      ...config
    }));
    
    res.json(plans);
  } catch (error) {
    console.error('Error getting plans:', error);
    res.status(500).json({ error: 'Failed to get plans' });
  }
});

// Upgrade plan
router.post('/upgrade/:planId', requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const { planId } = req.params;
    const { billingCycle = 'monthly' } = req.body;

    if (!PLAN_CONFIGS[planId as keyof typeof PLAN_CONFIGS]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const planConfig = PLAN_CONFIGS[planId as keyof typeof PLAN_CONFIGS];
    
    // Calculate end date based on billing cycle
    const startDate = new Date();
    const endDate = new Date();
    if (billingCycle === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Update or create subscription
    const existingSubscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId)
    });

    if (existingSubscription) {
      await db.update(subscriptions)
        .set({
          plan: planId,
          status: 'active',
          startDate,
          endDate,
          billingCycle,
          price: planConfig.price.toString(),
          features: { planFeatures: planConfig.features },
          updatedAt: new Date()
        })
        .where(eq(subscriptions.userId, userId));
    } else {
      await db.insert(subscriptions).values({
        userId,
        plan: planId,
        status: 'active',
        startDate,
        endDate,
        billingCycle,
        price: planConfig.price.toString(),
        features: { planFeatures: planConfig.features },
        metadata: {}
      });
    }

    // Initialize feature usage for the current month
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Remove existing usage for this month
    await db.delete(featureUsage)
      .where(and(
        eq(featureUsage.userId, userId),
        eq(featureUsage.period, currentMonth)
      ));

    // Add new usage limits
    const usageToInsert = [];
    if (planConfig.maxServices > 0) {
      usageToInsert.push({
        userId,
        feature: 'services',
        period: currentMonth,
        used: 0,
        limit: planConfig.maxServices
      });
    }
    
    if (planConfig.maxProposals > 0) {
      usageToInsert.push({
        userId,
        feature: 'proposals',
        period: currentMonth,
        used: 0,
        limit: planConfig.maxProposals
      });
    }

    if (usageToInsert.length > 0) {
      await db.insert(featureUsage).values(usageToInsert);
    }

    res.json({ success: true, message: 'Plan upgraded successfully' });
  } catch (error) {
    console.error('Error upgrading plan:', error);
    res.status(500).json({ error: 'Failed to upgrade plan' });
  }
});

// Cancel subscription
router.patch('/cancel', requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const { reason } = req.body;

    await db.update(subscriptions)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: reason,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.userId, userId));

    res.json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Get feature usage
router.get('/usage', requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const usage = await db.query.featureUsage.findMany({
      where: and(
        eq(featureUsage.userId, userId),
        eq(featureUsage.period, currentMonth)
      )
    });

    const usageMap = usage.reduce((acc, item) => {
      acc[item.feature] = {
        used: item.used,
        limit: item.limit,
        percentage: item.limit > 0 ? (item.used / item.limit) * 100 : 0
      };
      return acc;
    }, {} as Record<string, any>);

    res.json(usageMap);
  } catch (error) {
    console.error('Error getting usage:', error);
    res.status(500).json({ error: 'Failed to get usage' });
  }
});

// Check feature access
router.get('/access/:feature', requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const { feature } = req.params;

    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId)
    });

    if (!subscription) {
      return res.json({ hasAccess: false, reason: 'No subscription found' });
    }

    const planConfig = PLAN_CONFIGS[subscription.plan as keyof typeof PLAN_CONFIGS];
    const hasFeature = planConfig.features.includes(feature);

    res.json({ hasAccess: hasFeature });
  } catch (error) {
    console.error('Error checking feature access:', error);
    res.status(500).json({ error: 'Failed to check feature access' });
  }
});

// Get billing history (placeholder)
router.get('/billing', requireAuth, async (req: any, res) => {
  try {
    // This would typically integrate with a payment processor
    // For now, return mock data
    res.json([]);
  } catch (error) {
    console.error('Error getting billing history:', error);
    res.status(500).json({ error: 'Failed to get billing history' });
  }
});

// Add-ons endpoints
router.get('/addons', async (req, res) => {
  try {
    const availableAddOns = [
      {
        id: 'social_messaging',
        name: 'Mensageria Unificada',
        description: 'Inbox unificado para Instagram DM, WhatsApp, LinkedIn',
        price: 49,
        period: 'month'
      },
      {
        id: 'social_posting_starter',
        name: 'Publicação Automática - Starter',
        description: '10 posts por mês com agendamento',
        price: 29,
        period: 'month'
      },
      {
        id: 'social_posting_pro',
        name: 'Publicação Automática - Pro',
        description: '50 posts por mês com analytics',
        price: 79,
        period: 'month'
      },
      {
        id: 'kyc_basic',
        name: 'KYC Básico',
        description: 'Verificação de identidade uma vez',
        price: 29,
        period: 'once'
      }
    ];

    res.json(availableAddOns);
  } catch (error) {
    console.error('Error getting add-ons:', error);
    res.status(500).json({ error: 'Failed to get add-ons' });
  }
});

// Purchase add-on
router.post('/addons/:addonId', requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const { addonId } = req.params;
    
    // This would integrate with payment processing
    // For now, just create the add-on record
    
    const addOnData = {
      userId,
      type: addonId,
      status: 'active',
      startDate: new Date(),
      price: '49.00', // This would come from the add-on configuration
      currency: 'BRL',
      configuration: {}
    };

    await db.insert(addOns).values(addOnData);

    res.json({ success: true, message: 'Add-on purchased successfully' });
  } catch (error) {
    console.error('Error purchasing add-on:', error);
    res.status(500).json({ error: 'Failed to purchase add-on' });
  }
});

// Start trial
router.post('/trial/:planId', requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const { planId } = req.params;

    if (!PLAN_CONFIGS[planId as keyof typeof PLAN_CONFIGS]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

    await db.update(subscriptions)
      .set({
        plan: planId,
        status: 'trial',
        trialEndsAt: trialEndDate,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.userId, userId));

    res.json({ success: true, message: 'Trial started successfully' });
  } catch (error) {
    console.error('Error starting trial:', error);
    res.status(500).json({ error: 'Failed to start trial' });
  }
});

// Apply promo code
router.post('/promo', requireAuth, async (req: any, res) => {
  try {
    const { code } = req.body;
    
    // This would check against a promo codes database
    // For now, return a mock response
    
    res.json({ success: false, message: 'Invalid promo code' });
  } catch (error) {
    console.error('Error applying promo code:', error);
    res.status(500).json({ error: 'Failed to apply promo code' });
  }
});

// Helper function to track feature usage
export const trackFeatureUsage = async (userId: string, feature: string, increment: number = 1) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const existingUsage = await db.query.featureUsage.findFirst({
      where: and(
        eq(featureUsage.userId, userId),
        eq(featureUsage.feature, feature),
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
    }
  } catch (error) {
    console.error('Error tracking feature usage:', error);
  }
};

// Helper function to check if user can use a feature
export const canUseFeature = async (userId: string, feature: string): Promise<boolean> => {
  try {
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId)
    });

    if (!subscription) return false;

    const planConfig = PLAN_CONFIGS[subscription.plan as keyof typeof PLAN_CONFIGS];
    if (!planConfig) return false;

    // Check if plan includes this feature
    if (!planConfig.features.includes(feature)) return false;

    // Check usage limits
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usage = await db.query.featureUsage.findFirst({
      where: and(
        eq(featureUsage.userId, userId),
        eq(featureUsage.feature, feature),
        eq(featureUsage.period, currentMonth)
      )
    });

    if (!usage) return true; // No usage tracking means unlimited
    
    return usage.used < usage.limit;
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
};

export { router as subscriptionsRouter };