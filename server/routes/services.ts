import express from 'express';
import { requireAuth } from './auth.js';
import { 
  requireFeature, 
  checkUsageLimit, 
  trackUsage, 
  requireActiveSubscription,
  requirePlan 
} from '../middleware/subscription.js';

export const servicesRouter = express.Router();

// Get all services (public endpoint)
servicesRouter.get('/', (req, res) => {
  res.json({ message: 'Public services listing - implementation pending' });
});

// Create a new service (requires subscription and usage tracking)
servicesRouter.post('/', 
  requireAuth,
  requireActiveSubscription,
  checkUsageLimit('services'),
  trackUsage('services'),
  (req, res) => {
    // Service creation logic would go here
    res.json({ 
      message: 'Service created successfully',
      note: 'This endpoint is protected by subscription limits'
    });
  }
);

// Premium service features (requires Business plan or higher)
servicesRouter.post('/:serviceId/promote',
  requireAuth,
  requireActiveSubscription,
  requirePlan('business'),
  requireFeature('premium_search'),
  (req, res) => {
    res.json({ 
      message: 'Service promoted successfully',
      note: 'This feature requires Business plan or higher'
    });
  }
);

// Social media posting (requires specific feature)
servicesRouter.post('/:serviceId/social-post',
  requireAuth,
  requireActiveSubscription,
  requireFeature('social_media_basic'),
  checkUsageLimit('posts'),
  trackUsage('posts'),
  (req, res) => {
    res.json({ 
      message: 'Social media post created',
      note: 'This feature requires Business plan with social media features'
    });
  }
);

// Elite-only features (requires Elite plan)
servicesRouter.post('/:serviceId/ai-optimize',
  requireAuth,
  requireActiveSubscription,
  requirePlan('elite'),
  requireFeature('ai_analytics'),
  (req, res) => {
    res.json({ 
      message: 'AI optimization applied',
      note: 'This feature is exclusive to Elite plan'
    });
  }
);