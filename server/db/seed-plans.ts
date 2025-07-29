import dotenv from 'dotenv';
dotenv.config();

import { db } from './index.js';
import { planFeatures } from './schema-sqlite.js';
import { eq } from 'drizzle-orm';

const PLAN_FEATURES_DATA = [
  {
    plan: 'free',
    maxServices: 3,
    maxProposals: 5,
    commissionRate: 15.0,
    maxProjectValue: 1000.0,
    features: {
      basic_chat: true,
      basic_dashboard: true,
      email_support: true,
      identity_verification: false,
      search_boost: false,
      basic_analytics: false,
      proposal_templates: false,
      priority_support: false,
      push_notifications: false,
      kyc_included: false,
      premium_search: false,
      advanced_analytics: false,
      social_media_basic: false,
      basic_api: false,
      account_manager: false,
      phone_support: false,
      corporate_projects: false,
      digital_certificate: false,
      elite_badge: false,
      top_search_results: false,
      ai_analytics: false,
      social_media_complete: false,
      unified_inbox: false,
      auto_posting: false,
      complete_api: false,
      white_label: false,
      vip_support: false,
      co_marketing: false
    },
    priority: 0,
    badge: 'Novo no GalaxIA',
    badgeColor: 'gray'
  },
  {
    plan: 'professional',
    maxServices: 10,
    maxProposals: 30,
    commissionRate: 12.0,
    maxProjectValue: 5000.0,
    features: {
      basic_chat: true,
      basic_dashboard: true,
      email_support: true,
      identity_verification: true,
      search_boost: true,
      basic_analytics: true,
      proposal_templates: true,
      priority_support: true,
      push_notifications: true,
      kyc_included: false,
      premium_search: false,
      advanced_analytics: false,
      social_media_basic: false,
      basic_api: false,
      account_manager: false,
      phone_support: false,
      corporate_projects: false,
      digital_certificate: false,
      elite_badge: false,
      top_search_results: false,
      ai_analytics: false,
      social_media_complete: false,
      unified_inbox: false,
      auto_posting: false,
      complete_api: false,
      white_label: false,
      vip_support: false,
      co_marketing: false
    },
    priority: 1,
    badge: 'Profissional Verificado',
    badgeColor: 'blue'
  },
  {
    plan: 'business',
    maxServices: -1, // unlimited
    maxProposals: 100,
    commissionRate: 10.0,
    maxProjectValue: 25000.0,
    features: {
      basic_chat: true,
      basic_dashboard: true,
      email_support: true,
      identity_verification: true,
      search_boost: true,
      basic_analytics: true,
      proposal_templates: true,
      priority_support: true,
      push_notifications: true,
      kyc_included: true,
      premium_search: true,
      advanced_analytics: true,
      social_media_basic: true,
      basic_api: true,
      account_manager: true,
      phone_support: true,
      corporate_projects: true,
      digital_certificate: true,
      elite_badge: false,
      top_search_results: false,
      ai_analytics: false,
      social_media_complete: false,
      unified_inbox: false,
      auto_posting: false,
      complete_api: false,
      white_label: false,
      vip_support: false,
      co_marketing: false
    },
    priority: 2,
    badge: 'Business Partner',
    badgeColor: 'purple'
  },
  {
    plan: 'elite',
    maxServices: -1, // unlimited
    maxProposals: -1, // unlimited
    commissionRate: 7.0,
    maxProjectValue: -1.0, // unlimited
    features: {
      basic_chat: true,
      basic_dashboard: true,
      email_support: true,
      identity_verification: true,
      search_boost: true,
      basic_analytics: true,
      proposal_templates: true,
      priority_support: true,
      push_notifications: true,
      kyc_included: true,
      premium_search: true,
      advanced_analytics: true,
      social_media_basic: true,
      basic_api: true,
      account_manager: true,
      phone_support: true,
      corporate_projects: true,
      digital_certificate: true,
      elite_badge: true,
      top_search_results: true,
      ai_analytics: true,
      social_media_complete: true,
      unified_inbox: true,
      auto_posting: true,
      complete_api: true,
      white_label: true,
      vip_support: true,
      co_marketing: true
    },
    priority: 3,
    badge: 'GalaxIA Elite',
    badgeColor: 'yellow'
  }
];

export async function seedPlanFeatures() {
  console.log('🌱 Seeding plan features...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  try {
    for (const planData of PLAN_FEATURES_DATA) {
      // Check if plan already exists
      const existingPlan = await db.query.planFeatures.findFirst({
        where: eq(planFeatures.plan, planData.plan)
      });

      if (existingPlan) {
        // Update existing plan
        await db.update(planFeatures)
          .set({
            maxServices: planData.maxServices,
            maxProposals: planData.maxProposals,
            commissionRate: planData.commissionRate.toString(),
            maxProjectValue: planData.maxProjectValue !== -1 ? planData.maxProjectValue.toString() : null,
            features: planData.features,
            priority: planData.priority,
            badge: planData.badge,
            badgeColor: planData.badgeColor
          })
          .where(eq(planFeatures.plan, planData.plan));
        
        console.log(`✅ Updated plan: ${planData.plan}`);
      } else {
        // Insert new plan
        await db.insert(planFeatures).values({
          plan: planData.plan,
          maxServices: planData.maxServices,
          maxProposals: planData.maxProposals,
          commissionRate: planData.commissionRate.toString(),
          maxProjectValue: planData.maxProjectValue !== -1 ? planData.maxProjectValue.toString() : null,
          features: planData.features,
          priority: planData.priority,
          badge: planData.badge,
          badgeColor: planData.badgeColor
        });
        
        console.log(`✅ Created plan: ${planData.plan}`);
      }
    }
    
    console.log('🎉 Plan features seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding plan features:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedPlanFeatures()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}