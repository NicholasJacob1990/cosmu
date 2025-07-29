import dotenv from 'dotenv';
dotenv.config();

import { db } from './db/index.js';
import { planFeatures } from './db/schema-sqlite.js';

async function simpleTest() {
  console.log('🧪 Simple Database Test');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  try {
    // Test database connection
    const plans = await db.select().from(planFeatures);
    console.log(`✅ Found ${plans.length} plan features in database`);
    
    if (plans.length === 0) {
      console.log('💡 Adding basic free plan...');
      await db.insert(planFeatures).values({
        plan: 'free',
        maxServices: 3,
        maxProposals: 5,
        commissionRate: 15.0,
        maxProjectValue: 1000.0,
        features: {
          basic_chat: true,
          basic_dashboard: true,
          email_support: true
        },
        priority: 0,
        badge: 'Novo no GalaxIA',
        badgeColor: 'gray'
      });
      console.log('✅ Free plan added!');
    } else {
      plans.forEach(plan => {
        console.log(`📋 Plan: ${plan.plan} - ${plan.maxServices} services, ${plan.maxProposals} proposals`);
      });
    }
    
    console.log('🎉 Database is working correctly!');
  } catch (error) {
    console.error('❌ Database error:', error);
  }
}

simpleTest().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});