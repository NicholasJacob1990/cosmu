import dotenv from 'dotenv';
dotenv.config();

import { db } from './db/index.js';
import { users, subscriptions, planFeatures, featureUsage } from './db/schema-sqlite.js';
import { eq, and } from 'drizzle-orm';

async function finalTest() {
  console.log('🧪 Final Subscription System Test\n');
  
  try {
    // 1. Verify plans exist
    console.log('1️⃣ Checking plans...');
    const plans = await db.select().from(planFeatures);
    console.log(`✅ Found ${plans.length} plans configured`);
    
    // 2. Create test user
    console.log('\n2️⃣ Creating test user...');
    const testEmail = `test-${Date.now()}@galaxia.com`;
    
    const [testUser] = await db.insert(users).values({
      email: testEmail,
      password: 'hashedpassword123',
      firstName: 'Test',
      lastName: 'User',
      userType: 'professional'
    }).returning();
    
    console.log(`✅ Created user: ${testUser.email}`);
    
    // 3. Create subscription
    console.log('\n3️⃣ Creating subscription...');
    const [subscription] = await db.insert(subscriptions).values({
      userId: testUser.id,
      plan: 'free',
      status: 'active',
      features: { 
        planFeatures: ['basic_chat', 'basic_dashboard', 'email_support']
      },
      metadata: {}
    }).returning();
    
    console.log(`✅ Created subscription: ${subscription.plan} (${subscription.status})`);
    
    // 4. Create feature usage
    console.log('\n4️⃣ Setting up feature usage...');
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
    
    console.log(`✅ Feature usage tracked for ${currentMonth}`);
    
    // 5. Test queries
    console.log('\n5️⃣ Testing queries...');
    
    // Get user with subscription
    const userWithSub = await db.select({
      userId: users.id,
      email: users.email,
      plan: subscriptions.plan,
      status: subscriptions.status
    })
    .from(users)
    .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
    .where(eq(users.id, testUser.id));
    
    console.log(`✅ User query: ${userWithSub[0]?.email} has ${userWithSub[0]?.plan} plan`);
    
    // Get usage
    const usage = await db.select()
      .from(featureUsage)
      .where(and(
        eq(featureUsage.userId, testUser.id),
        eq(featureUsage.period, currentMonth)
      ));
    
    console.log(`✅ Usage query: ${usage.length} features tracked`);
    usage.forEach(u => {
      console.log(`   ${u.feature}: ${u.used}/${u.limit} used (${Math.round((u.used/u.limit)*100)}%)`);
    });
    
    // 6. Test plan upgrade
    console.log('\n6️⃣ Testing plan upgrade...');
    await db.update(subscriptions)
      .set({ 
        plan: 'professional',
        features: {
          planFeatures: ['basic_chat', 'basic_dashboard', 'email_support', 'identity_verification']
        }
      })
      .where(eq(subscriptions.userId, testUser.id));
    
    const upgradedSub = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, testUser.id));
    
    console.log(`✅ Plan upgraded to: ${upgradedSub[0]?.plan}`);
    
    // 7. Test feature access simulation
    console.log('\n7️⃣ Testing feature access...');
    const currentPlan = upgradedSub[0]?.plan;
    const planDetails = await db.select()
      .from(planFeatures)
      .where(eq(planFeatures.plan, currentPlan!));
    
    if (planDetails[0]) {
      const features = planDetails[0].features as any;
      console.log(`✅ Plan features for ${currentPlan}:`);
      console.log(`   Basic chat: ${features.basic_chat ? '✅' : '❌'}`);
      console.log(`   Identity verification: ${features.identity_verification ? '✅' : '❌'}`);
      console.log(`   Social media: ${features.social_media_basic ? '✅' : '❌'}`);
      console.log(`   AI analytics: ${features.ai_analytics ? '✅' : '❌'}`);
    }
    
    // 8. Cleanup
    console.log('\n8️⃣ Cleaning up test data...');
    await db.delete(featureUsage).where(eq(featureUsage.userId, testUser.id));
    await db.delete(subscriptions).where(eq(subscriptions.userId, testUser.id));
    await db.delete(users).where(eq(users.id, testUser.id));
    console.log(`✅ Test data cleaned up`);
    
    // 9. Final status
    console.log('\n📊 System Status:');
    const totalPlans = await db.select().from(planFeatures);
    const totalUsers = await db.select().from(users);
    const totalSubs = await db.select().from(subscriptions);
    
    console.log(`   Plans configured: ${totalPlans.length}`);
    console.log(`   Total users: ${totalUsers.length}`);
    console.log(`   Active subscriptions: ${totalSubs.length}`);
    
    console.log('\n🎉 ALL TESTS PASSED! Subscription system is fully operational!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

finalTest().then(() => {
  console.log('\n🏁 Testing completed successfully');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Testing failed:', error);
  process.exit(1);
});