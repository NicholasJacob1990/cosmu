import dotenv from 'dotenv';
dotenv.config();

import { db } from './db/index.js';
import { planFeatures } from './db/schema-sqlite.js';
import { eq } from 'drizzle-orm';

const ALL_PLANS = [
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
      social_media_basic: false,
      premium_search: false,
      ai_analytics: false
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
      social_media_basic: false,
      premium_search: false,
      ai_analytics: false
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
      social_media_basic: true,
      premium_search: true,
      ai_analytics: false
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
      social_media_basic: true,
      premium_search: true,
      ai_analytics: true,
      elite_badge: true,
      unified_inbox: true,
      auto_posting: true
    },
    priority: 3,
    badge: 'GalaxIA Elite',
    badgeColor: 'yellow'
  }
];

async function addAllPlans() {
  console.log('🚀 Adding all subscription plans...\n');
  
  try {
    for (const planData of ALL_PLANS) {
      // Check if plan exists
      const existing = await db.select().from(planFeatures).where(eq(planFeatures.plan, planData.plan));
      
      if (existing.length > 0) {
        // Update existing
        await db.update(planFeatures)
          .set({
            maxServices: planData.maxServices,
            maxProposals: planData.maxProposals,
            commissionRate: planData.commissionRate,
            maxProjectValue: planData.maxProjectValue,
            features: planData.features,
            priority: planData.priority,
            badge: planData.badge,
            badgeColor: planData.badgeColor
          })
          .where(eq(planFeatures.plan, planData.plan));
        console.log(`✅ Updated ${planData.plan} plan`);
      } else {
        // Insert new
        await db.insert(planFeatures).values(planData);
        console.log(`✅ Created ${planData.plan} plan`);
      }
    }
    
    // Show all plans
    console.log('\n📋 All Plans in Database:');
    const allPlans = await db.select().from(planFeatures);
    allPlans.forEach(plan => {
      const services = plan.maxServices === -1 ? 'unlimited' : plan.maxServices;
      const proposals = plan.maxProposals === -1 ? 'unlimited' : plan.maxProposals;
      console.log(`   ${plan.plan}: ${services} services, ${proposals} proposals, ${plan.commissionRate}% commission`);
    });
    
    console.log('\n🎉 All plans successfully configured!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

addAllPlans().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('💥 Failed:', error);
  process.exit(1);
});