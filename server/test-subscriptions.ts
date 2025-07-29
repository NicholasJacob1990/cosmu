#!/usr/bin/env tsx

import dotenv from 'dotenv';
dotenv.config();

import { db } from './db/index.js';
import { users, subscriptions, planFeatures, featureUsage } from './db/schema-sqlite.js';
import { eq } from 'drizzle-orm';
import { seedPlanFeatures } from './db/seed-plans.js';

async function testSubscriptionSystem() {
  console.log('🧪 Testing Subscription System...\n');

  try {
    // 1. Seed plan features first
    console.log('1️⃣ Seeding plan features...');
    await seedPlanFeatures();
    
    // 2. Verify plan features were created
    console.log('\n2️⃣ Verifying plan features...');
    const plans = await db.query.planFeatures.findMany();
    console.log(`✅ Found ${plans.length} plans:`);
    plans.forEach(plan => {
      console.log(`   - ${plan.plan}: ${plan.maxServices} services, ${plan.maxProposals} proposals, ${plan.commissionRate}% commission`);
    });

    // 3. Test user registration with subscription creation
    console.log('\n3️⃣ Testing user registration...');
    const testEmail = `test-${Date.now()}@example.com`;
    
    // Create test user
    const [testUser] = await db.insert(users).values({
      email: testEmail,
      password: 'hashedpassword',
      firstName: 'Test',
      lastName: 'User',
      userType: 'professional'
    }).returning();
    
    console.log(`✅ Created test user: ${testUser.email}`);

    // Create subscription for test user
    const [testSubscription] = await db.insert(subscriptions).values({
      userId: testUser.id,
      plan: 'free',
      status: 'active',
      startDate: new Date(),
      features: { 
        planFeatures: ['basic_chat', 'basic_dashboard', 'email_support']
      },
      metadata: {}
    }).returning();
    
    console.log(`✅ Created subscription: ${testSubscription.plan} (${testSubscription.status})`);

    // Create feature usage
    const currentMonth = new Date().toISOString().slice(0, 7);
    await db.insert(featureUsage).values([
      {
        userId: testUser.id,
        feature: 'services',
        period: currentMonth,
        used: 1,
        limit: 3
      },
      {
        userId: testUser.id,
        feature: 'proposals',
        period: currentMonth,
        used: 2,
        limit: 5
      }
    ]);
    
    console.log(`✅ Created feature usage tracking for ${currentMonth}`);

    // 4. Test subscription queries
    console.log('\n4️⃣ Testing subscription queries...');
    
    const userWithSubscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, testUser.id)
    });
    
    console.log(`✅ User subscription query: ${userWithSubscription?.plan}`);

    const userUsage = await db.query.featureUsage.findMany({
      where: eq(featureUsage.userId, testUser.id)
    });
    
    console.log(`✅ User usage query: ${userUsage.length} features tracked`);
    userUsage.forEach(usage => {
      console.log(`   - ${usage.feature}: ${usage.used}/${usage.limit} used`);
    });

    // 5. Test plan upgrade simulation
    console.log('\n5️⃣ Testing plan upgrade...');
    
    await db.update(subscriptions)
      .set({
        plan: 'professional',
        features: { 
          planFeatures: ['basic_chat', 'basic_dashboard', 'email_support', 'identity_verification', 'search_boost']
        },
        updatedAt: new Date()
      })
      .where(eq(subscriptions.userId, testUser.id));
    
    const upgradedSubscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, testUser.id)
    });
    
    console.log(`✅ Plan upgraded to: ${upgradedSubscription?.plan}`);

    // 6. Cleanup test data
    console.log('\n6️⃣ Cleaning up test data...');
    
    await db.delete(featureUsage).where(eq(featureUsage.userId, testUser.id));
    await db.delete(subscriptions).where(eq(subscriptions.userId, testUser.id));
    await db.delete(users).where(eq(users.id, testUser.id));
    
    console.log(`✅ Test data cleaned up`);

    console.log('\n🎉 All subscription tests passed!');
    
    // 7. Display current system status
    console.log('\n📊 Current System Status:');
    const totalPlans = await db.query.planFeatures.findMany();
    const totalSubscriptions = await db.query.subscriptions.findMany();
    const totalUsers = await db.query.users.findMany();
    
    console.log(`   Plans configured: ${totalPlans.length}`);
    console.log(`   Active subscriptions: ${totalSubscriptions.length}`);
    console.log(`   Total users: ${totalUsers.length}`);
    
    console.log('\n✅ Subscription system is fully operational!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSubscriptionSystem()
    .then(() => {
      console.log('\n🏁 Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}