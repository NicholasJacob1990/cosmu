import { useState, useEffect } from 'react';
import { subscriptionApi } from '@/lib/api';

export interface Subscription {
  id: string;
  plan: 'free' | 'professional' | 'business' | 'elite';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  endDate?: string;
  trialEndsAt?: string;
  features: Record<string, any>;
  usage: Record<string, { used: number; limit: number }>;
}

export interface PlanLimits {
  maxServices: number | 'unlimited';
  maxProposals: number | 'unlimited';
  maxProjectValue: number | 'unlimited';
  commissionRate: number;
  features: string[];
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxServices: 3,
    maxProposals: 5,
    maxProjectValue: 1000,
    commissionRate: 15,
    features: ['basic_chat', 'basic_dashboard', 'email_support']
  },
  professional: {
    maxServices: 10,
    maxProposals: 30,
    maxProjectValue: 5000,
    commissionRate: 12,
    features: ['basic_chat', 'basic_dashboard', 'email_support', 'identity_verification', 'search_boost', 'basic_analytics', 'proposal_templates', 'priority_support', 'push_notifications']
  },
  business: {
    maxServices: 'unlimited',
    maxProposals: 100,
    maxProjectValue: 25000,
    commissionRate: 10,
    features: ['basic_chat', 'basic_dashboard', 'email_support', 'identity_verification', 'search_boost', 'basic_analytics', 'proposal_templates', 'priority_support', 'push_notifications', 'kyc_included', 'premium_search', 'advanced_analytics', 'social_media_basic', 'basic_api', 'account_manager', 'phone_support', 'corporate_projects', 'digital_certificate']
  },
  elite: {
    maxServices: 'unlimited',
    maxProposals: 'unlimited',
    maxProjectValue: 'unlimited',
    commissionRate: 7,
    features: ['basic_chat', 'basic_dashboard', 'email_support', 'identity_verification', 'search_boost', 'basic_analytics', 'proposal_templates', 'priority_support', 'push_notifications', 'kyc_included', 'premium_search', 'advanced_analytics', 'social_media_basic', 'basic_api', 'account_manager', 'phone_support', 'corporate_projects', 'digital_certificate', 'elite_badge', 'top_search_results', 'ai_analytics', 'social_media_complete', 'unified_inbox', 'auto_posting', 'complete_api', 'white_label', 'vip_support', 'co_marketing']
  }
};

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const response = await subscriptionApi.getCurrentPlan();
      setSubscription(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading subscription:', err);
      setError('Failed to load subscription');
      // Default to free plan if error
      setSubscription({
        id: 'default',
        plan: 'free',
        status: 'active',
        startDate: new Date().toISOString(),
        features: {},
        usage: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanLimits = (plan?: string): PlanLimits => {
    const currentPlan = plan || subscription?.plan || 'free';
    return PLAN_LIMITS[currentPlan] || PLAN_LIMITS.free;
  };

  const hasFeature = (feature: string): boolean => {
    if (!subscription) return false;
    const limits = getPlanLimits();
    return limits.features.includes(feature);
  };

  const canUseFeature = (feature: string, current?: number): boolean => {
    if (!subscription) return false;
    
    const limits = getPlanLimits();
    const usage = subscription.usage[feature];
    
    if (!usage) return true; // No usage tracking for this feature
    
    if (typeof limits[`max${feature.charAt(0).toUpperCase() + feature.slice(1)}` as keyof PlanLimits] === 'string') {
      return true; // Unlimited
    }
    
    const limit = usage.limit;
    const used = current !== undefined ? current : usage.used;
    
    return used < limit;
  };

  const getUsage = (feature: string) => {
    if (!subscription) return { used: 0, limit: 0, percentage: 0 };
    
    const usage = subscription.usage[feature];
    if (!usage) return { used: 0, limit: 0, percentage: 0 };
    
    const percentage = usage.limit > 0 ? (usage.used / usage.limit) * 100 : 0;
    
    return {
      used: usage.used,
      limit: usage.limit,
      percentage: Math.min(percentage, 100)
    };
  };

  const isTrialActive = (): boolean => {
    if (!subscription?.trialEndsAt) return false;
    return new Date(subscription.trialEndsAt) > new Date();
  };

  const getTrialDaysLeft = (): number => {
    if (!subscription?.trialEndsAt) return 0;
    const trialEnd = new Date(subscription.trialEndsAt);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const upgradePlan = async (planId: string, options?: { billingCycle?: 'monthly' | 'annual' }) => {
    try {
      setLoading(true);
      await subscriptionApi.upgradePlan(planId, options);
      await loadSubscription(); // Reload subscription after upgrade
      return true;
    } catch (err) {
      console.error('Error upgrading plan:', err);
      setError('Failed to upgrade plan');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (reason?: string) => {
    try {
      setLoading(true);
      await subscriptionApi.cancelSubscription(reason);
      await loadSubscription(); // Reload subscription after cancellation
      return true;
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError('Failed to cancel subscription');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkFeatureAccess = async (feature: string): Promise<boolean> => {
    try {
      const response = await subscriptionApi.checkFeatureAccess(feature);
      return response.data.hasAccess;
    } catch (err) {
      console.error('Error checking feature access:', err);
      return false;
    }
  };

  return {
    subscription,
    loading,
    error,
    hasFeature,
    canUseFeature,
    getUsage,
    getPlanLimits,
    isTrialActive,
    getTrialDaysLeft,
    upgradePlan,
    cancelSubscription,
    checkFeatureAccess,
    reload: loadSubscription
  };
}