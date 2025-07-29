import express from "express";
import { Request, Response } from "express";
import { db } from "../db/index.js";
import { 
  freelancerProfiles, 
  orders, 
  servicePackages, 
  reviews, 
  transactions,
  users,
  messages,
  proposals,
  projects
} from "../db/schema.js";
import { eq, and, desc, asc, count, sum, avg, sql, gte, lte } from "drizzle-orm";
import { requireAuth } from "./auth.js";

const router = express.Router();

// Get freelancer dashboard overview
router.get("/freelancer/overview", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { period = '30d' } = req.query; // '7d', '30d', '90d', '1y'

    // Get freelancer profile
    const [freelancerProfile] = await db
      .select()
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.userId, userId))
      .limit(1);

    if (!freelancerProfile) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }

    // Calculate date range
    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get key metrics
    const [orderStats] = await db
      .select({
        totalOrders: count(orders.id),
        completedOrders: sql`COUNT(CASE WHEN ${orders.status} = 'completed' THEN 1 END)`,
        activeOrders: sql`COUNT(CASE WHEN ${orders.status} IN ('accepted', 'in_progress') THEN 1 END)`,
        totalEarnings: sql`COALESCE(SUM(CASE WHEN ${orders.status} = 'completed' THEN ${orders.freelancerAmount} END), 0)`,
        avgOrderValue: sql`COALESCE(AVG(CASE WHEN ${orders.status} = 'completed' THEN ${orders.freelancerAmount} END), 0)`
      })
      .from(orders)
      .where(
        and(
          eq(orders.freelancerId, freelancerProfile.id),
          gte(orders.createdAt, startDate)
        )
      );

    // Get recent reviews
    const recentReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        clientName: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        clientAvatar: users.profileImageUrl,
        serviceTitle: servicePackages.title
      })
      .from(reviews)
      .leftJoin(orders, eq(reviews.orderId, orders.id))
      .leftJoin(users, eq(reviews.reviewerId, users.id))
      .leftJoin(servicePackages, eq(orders.servicePackageId, servicePackages.id))
      .where(eq(orders.freelancerId, freelancerProfile.id))
      .orderBy(desc(reviews.createdAt))
      .limit(5);

    // Get active services performance
    const servicesPerformance = await db
      .select({
        id: servicePackages.id,
        title: servicePackages.title,
        viewCount: servicePackages.viewCount,
        orderCount: servicePackages.orderCount,
        conversionRate: servicePackages.conversionRate,
        avgRating: sql`COALESCE(AVG(${reviews.rating}), 0)`,
        totalRevenue: sql`COALESCE(SUM(CASE WHEN ${orders.status} = 'completed' THEN ${orders.freelancerAmount} END), 0)`
      })
      .from(servicePackages)
      .leftJoin(orders, eq(servicePackages.id, orders.servicePackageId))
      .leftJoin(reviews, eq(orders.id, reviews.orderId))
      .where(
        and(
          eq(servicePackages.freelancerId, freelancerProfile.id),
          eq(servicePackages.status, 'active')
        )
      )
      .groupBy(servicePackages.id, servicePackages.title, servicePackages.viewCount, servicePackages.orderCount, servicePackages.conversionRate)
      .orderBy(desc(sql`totalRevenue`))
      .limit(10);

    // Get earnings by month for chart
    const earningsByMonth = await db
      .select({
        month: sql`DATE_TRUNC('month', ${orders.completedAt})`,
        earnings: sql`SUM(${orders.freelancerAmount})`,
        orderCount: count(orders.id)
      })
      .from(orders)
      .where(
        and(
          eq(orders.freelancerId, freelancerProfile.id),
          eq(orders.status, 'completed'),
          gte(orders.completedAt, new Date(new Date().getFullYear(), 0, 1)) // Current year
        )
      )
      .groupBy(sql`DATE_TRUNC('month', ${orders.completedAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${orders.completedAt})`);

    // Get unread messages count
    const [unreadMessages] = await db
      .select({
        count: count(messages.id)
      })
      .from(messages)
      .where(
        and(
          eq(messages.receiverId, userId),
          eq(messages.isRead, false)
        )
      );

    // Get pending proposals count
    const [pendingProposals] = await db
      .select({
        count: count(proposals.id)
      })
      .from(proposals)
      .leftJoin(projects, eq(proposals.projectId, projects.id))
      .where(
        and(
          eq(proposals.freelancerId, freelancerProfile.id),
          eq(proposals.status, 'pending'),
          eq(projects.status, 'open')
        )
      );

    res.json({
      overview: {
        period,
        totalOrders: Number(orderStats.totalOrders),
        completedOrders: Number(orderStats.completedOrders),
        activeOrders: Number(orderStats.activeOrders),
        totalEarnings: Number(orderStats.totalEarnings),
        avgOrderValue: Number(orderStats.avgOrderValue),
        successRate: freelancerProfile.successRate,
        averageRating: freelancerProfile.averageRating,
        totalReviews: freelancerProfile.totalReviews,
        profileViews: freelancerProfile.profileViews,
        responseTime: freelancerProfile.responseTime
      },
      notifications: {
        unreadMessages: Number(unreadMessages.count),
        pendingProposals: Number(pendingProposals.count)
      },
      recentActivity: {
        reviews: recentReviews,
        servicesPerformance,
        earningsTrend: earningsByMonth
      }
    });

  } catch (error: any) {
    console.error("Get freelancer dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// Get freelancer analytics
router.get("/freelancer/analytics", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { 
      period = '30d',
      metric = 'earnings' // 'earnings', 'orders', 'views', 'conversion'
    } = req.query;

    // Get freelancer profile
    const [freelancerProfile] = await db
      .select({ id: freelancerProfiles.id })
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.userId, userId))
      .limit(1);

    if (!freelancerProfile) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }

    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get daily metrics for the period
    const dailyMetrics = await db
      .select({
        date: sql`DATE(${orders.createdAt})`,
        orders: count(orders.id),
        earnings: sql`COALESCE(SUM(CASE WHEN ${orders.status} = 'completed' THEN ${orders.freelancerAmount} END), 0)`,
        avgOrderValue: sql`COALESCE(AVG(CASE WHEN ${orders.status} = 'completed' THEN ${orders.freelancerAmount} END), 0)`
      })
      .from(orders)
      .where(
        and(
          eq(orders.freelancerId, freelancerProfile.id),
          gte(orders.createdAt, startDate)
        )
      )
      .groupBy(sql`DATE(${orders.createdAt})`)
      .orderBy(sql`DATE(${orders.createdAt})`);

    // Get service performance comparison
    const serviceComparison = await db
      .select({
        serviceId: servicePackages.id,
        title: servicePackages.title,
        price: servicePackages.price,
        views: servicePackages.viewCount,
        orders: sql`COUNT(${orders.id})`,
        revenue: sql`COALESCE(SUM(CASE WHEN ${orders.status} = 'completed' THEN ${orders.freelancerAmount} END), 0)`,
        conversionRate: sql`CASE 
          WHEN ${servicePackages.viewCount} > 0 
          THEN ROUND((COUNT(${orders.id})::float / ${servicePackages.viewCount}) * 100, 2)
          ELSE 0 
        END`,
        avgRating: sql`COALESCE(AVG(${reviews.rating}), 0)`,
        reviewCount: sql`COUNT(${reviews.id})`
      })
      .from(servicePackages)
      .leftJoin(orders, 
        and(
          eq(servicePackages.id, orders.servicePackageId),
          gte(orders.createdAt, startDate)
        )
      )
      .leftJoin(reviews, eq(orders.id, reviews.orderId))
      .where(
        and(
          eq(servicePackages.freelancerId, freelancerProfile.id),
          eq(servicePackages.status, 'active')
        )
      )
      .groupBy(
        servicePackages.id, 
        servicePackages.title, 
        servicePackages.price, 
        servicePackages.viewCount
      )
      .orderBy(desc(sql`revenue`));

    // Get client acquisition metrics
    const clientMetrics = await db
      .select({
        newClients: sql`COUNT(DISTINCT CASE WHEN ${orders.createdAt} >= ${startDate} THEN ${orders.clientId} END)`,
        returningClients: sql`COUNT(DISTINCT CASE 
          WHEN ${orders.createdAt} >= ${startDate} 
          AND EXISTS (
            SELECT 1 FROM ${orders} o2 
            WHERE o2.client_id = ${orders.clientId} 
            AND o2.created_at < ${startDate}
            AND o2.freelancer_id = ${freelancerProfile.id}
          )
          THEN ${orders.clientId} 
        END)`,
        totalUniqueClients: sql`COUNT(DISTINCT ${orders.clientId})`
      })
      .from(orders)
      .where(eq(orders.freelancerId, freelancerProfile.id));

    // Calculate growth rates (compare with previous period)
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - periodDays);

    const [prevPeriodStats] = await db
      .select({
        earnings: sql`COALESCE(SUM(CASE WHEN ${orders.status} = 'completed' THEN ${orders.freelancerAmount} END), 0)`,
        orders: count(orders.id)
      })
      .from(orders)
      .where(
        and(
          eq(orders.freelancerId, freelancerProfile.id),
          gte(orders.createdAt, prevStartDate),
          lte(orders.createdAt, startDate)
        )
      );

    const currentEarnings = Number(dailyMetrics.reduce((sum, day) => sum + Number(day.earnings), 0));
    const currentOrders = Number(dailyMetrics.reduce((sum, day) => sum + Number(day.orders), 0));
    const prevEarnings = Number(prevPeriodStats.earnings);
    const prevOrders = Number(prevPeriodStats.orders);

    const earningsGrowth = prevEarnings > 0 ? ((currentEarnings - prevEarnings) / prevEarnings) * 100 : 0;
    const ordersGrowth = prevOrders > 0 ? ((currentOrders - prevOrders) / prevOrders) * 100 : 0;

    res.json({
      period,
      summary: {
        totalEarnings: currentEarnings,
        totalOrders: currentOrders,
        avgOrderValue: currentOrders > 0 ? currentEarnings / currentOrders : 0,
        earningsGrowth: Math.round(earningsGrowth * 100) / 100,
        ordersGrowth: Math.round(ordersGrowth * 100) / 100
      },
      trends: {
        daily: dailyMetrics.map(day => ({
          date: day.date,
          orders: Number(day.orders),
          earnings: Number(day.earnings),
          avgOrderValue: Number(day.avgOrderValue)
        }))
      },
      services: {
        performance: serviceComparison.map(service => ({
          id: service.serviceId,
          title: service.title,
          price: Number(service.price),
          views: Number(service.views),
          orders: Number(service.orders),
          revenue: Number(service.revenue),
          conversionRate: Number(service.conversionRate),
          avgRating: Number(service.avgRating),
          reviewCount: Number(service.reviewCount)
        }))
      },
      clients: {
        new: Number(clientMetrics[0].newClients),
        returning: Number(clientMetrics[0].returningClients),
        total: Number(clientMetrics[0].totalUniqueClients)
      }
    });

  } catch (error: any) {
    console.error("Get freelancer analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

// Get client dashboard overview
router.get("/client/overview", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { period = '30d' } = req.query;

    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get order statistics
    const [orderStats] = await db
      .select({
        totalOrders: count(orders.id),
        completedOrders: sql`COUNT(CASE WHEN ${orders.status} = 'completed' THEN 1 END)`,
        activeOrders: sql`COUNT(CASE WHEN ${orders.status} IN ('accepted', 'in_progress') THEN 1 END)`,
        totalSpent: sql`COALESCE(SUM(CASE WHEN ${orders.status} = 'completed' THEN ${orders.totalAmount} END), 0)`,
        avgOrderValue: sql`COALESCE(AVG(CASE WHEN ${orders.status} = 'completed' THEN ${orders.totalAmount} END), 0)`
      })
      .from(orders)
      .where(
        and(
          eq(orders.clientId, userId),
          gte(orders.createdAt, startDate)
        )
      );

    // Get project statistics
    const [projectStats] = await db
      .select({
        totalProjects: count(projects.id),
        openProjects: sql`COUNT(CASE WHEN ${projects.status} = 'open' THEN 1 END)`,
        completedProjects: sql`COUNT(CASE WHEN ${projects.status} = 'completed' THEN 1 END)`,
        totalProposals: sql`COALESCE(SUM(${projects.proposalCount}), 0)`
      })
      .from(projects)
      .where(
        and(
          eq(projects.clientId, userId),
          gte(projects.createdAt, startDate)
        )
      );

    // Get recent orders
    const recentOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        totalAmount: orders.totalAmount,
        createdAt: orders.createdAt,
        serviceTitle: servicePackages.title,
        freelancerName: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        freelancerAvatar: users.profileImageUrl
      })
      .from(orders)
      .leftJoin(servicePackages, eq(orders.servicePackageId, servicePackages.id))
      .leftJoin(freelancerProfiles, eq(orders.freelancerId, freelancerProfiles.id))
      .leftJoin(users, eq(freelancerProfiles.userId, users.id))
      .where(eq(orders.clientId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(10);

    // Get favorite freelancers (most worked with)
    const favoriteFreelancers = await db
      .select({
        freelancerId: freelancerProfiles.id,
        name: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        avatar: users.profileImageUrl,
        title: freelancerProfiles.title,
        orderCount: count(orders.id),
        totalSpent: sql`SUM(${orders.totalAmount})`,
        avgRating: sql`AVG(${reviews.rating})`
      })
      .from(orders)
      .leftJoin(freelancerProfiles, eq(orders.freelancerId, freelancerProfiles.id))
      .leftJoin(users, eq(freelancerProfiles.userId, users.id))
      .leftJoin(reviews, eq(orders.id, reviews.orderId))
      .where(
        and(
          eq(orders.clientId, userId),
          eq(orders.status, 'completed')
        )
      )
      .groupBy(
        freelancerProfiles.id,
        users.firstName,
        users.lastName,
        users.profileImageUrl,
        freelancerProfiles.title
      )
      .orderBy(desc(count(orders.id)))
      .limit(5);

    // Get spending by month
    const spendingByMonth = await db
      .select({
        month: sql`DATE_TRUNC('month', ${orders.completedAt})`,
        amount: sql`SUM(${orders.totalAmount})`,
        orderCount: count(orders.id)
      })
      .from(orders)
      .where(
        and(
          eq(orders.clientId, userId),
          eq(orders.status, 'completed'),
          gte(orders.completedAt, new Date(new Date().getFullYear(), 0, 1))
        )
      )
      .groupBy(sql`DATE_TRUNC('month', ${orders.completedAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${orders.completedAt})`);

    res.json({
      overview: {
        period,
        totalOrders: Number(orderStats.totalOrders),
        completedOrders: Number(orderStats.completedOrders),
        activeOrders: Number(orderStats.activeOrders),
        totalSpent: Number(orderStats.totalSpent),
        avgOrderValue: Number(orderStats.avgOrderValue),
        totalProjects: Number(projectStats.totalProjects),
        openProjects: Number(projectStats.openProjects),
        completedProjects: Number(projectStats.completedProjects),
        avgProposalsPerProject: Number(projectStats.totalProjects) > 0 
          ? Number(projectStats.totalProposals) / Number(projectStats.totalProjects)
          : 0
      },
      recentActivity: {
        orders: recentOrders.map(order => ({
          ...order,
          totalAmount: Number(order.totalAmount)
        })),
        favoriteFreelancers: favoriteFreelancers.map(freelancer => ({
          ...freelancer,
          orderCount: Number(freelancer.orderCount),
          totalSpent: Number(freelancer.totalSpent),
          avgRating: Number(freelancer.avgRating)
        })),
        spendingTrend: spendingByMonth.map(month => ({
          month: month.month,
          amount: Number(month.amount),
          orderCount: Number(month.orderCount)
        }))
      }
    });

  } catch (error: any) {
    console.error("Get client dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch client dashboard data" });
  }
});

// Get quick stats for header/navigation
router.get("/quick-stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Check if user is a freelancer
    const [freelancerProfile] = await db
      .select({ id: freelancerProfiles.id })
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.userId, userId))
      .limit(1);

    const isFreelancer = !!freelancerProfile;

    // Get unread messages
    const [unreadMessages] = await db
      .select({ count: count(messages.id) })
      .from(messages)
      .where(
        and(
          eq(messages.receiverId, userId),
          eq(messages.isRead, false)
        )
      );

    let stats: any = {
      unreadMessages: Number(unreadMessages.count),
      userType: isFreelancer ? 'freelancer' : 'client'
    };

    if (isFreelancer) {
      // Freelancer stats
      const [freelancerStats] = await db
        .select({
          activeOrders: sql`COUNT(CASE WHEN ${orders.status} IN ('accepted', 'in_progress') THEN 1 END)`,
          pendingQuestions: sql`COUNT(CASE WHEN ${sql`service_questions.answer`} IS NULL THEN 1 END)`
        })
        .from(orders)
        .leftJoin(servicePackages, eq(orders.servicePackageId, servicePackages.id))
        .leftJoin(sql`service_questions`, eq(servicePackages.id, sql`service_questions.service_id`))
        .where(eq(orders.freelancerId, freelancerProfile.id));

      stats.activeOrders = Number(freelancerStats.activeOrders);
      stats.pendingQuestions = Number(freelancerStats.pendingQuestions);
    } else {
      // Client stats
      const [clientStats] = await db
        .select({
          activeOrders: sql`COUNT(CASE WHEN ${orders.status} IN ('accepted', 'in_progress') THEN 1 END)`,
          openProjects: sql`COUNT(CASE WHEN ${projects.status} = 'open' THEN 1 END)`
        })
        .from(orders)
        .leftJoin(projects, eq(projects.clientId, userId))
        .where(eq(orders.clientId, userId));

      stats.activeOrders = Number(clientStats.activeOrders);
      stats.openProjects = Number(clientStats.openProjects);
    }

    res.json(stats);

  } catch (error: any) {
    console.error("Get quick stats error:", error);
    res.status(500).json({ error: "Failed to fetch quick stats" });
  }
});

export { router as dashboardRouter };