import express from "express";
import { Request, Response } from "express";
import { db } from "../db/index.js";
import { servicePackages, packageTiers, pricingSuggestions, categories, freelancerProfiles } from "../db/schema.js";
import { eq, and, avg, min, max, count, desc, asc } from "drizzle-orm";
import { requireAuth } from "./auth.js";

const router = express.Router();

// Create/Update service with flexible pricing
router.post("/services", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      title,
      description,
      shortDescription,
      categoryId,
      priceType, // 'fixed', 'hourly', 'daily', 'per_m2', 'per_unit', 'negotiable'
      basePrice,
      priceUnit,
      minimumBudget,
      maximumBudget,
      deliveryTime,
      deliveryTimeUnit,
      sla,
      revisions,
      features,
      requirements,
      extras,
      policies,
      faqs,
      images,
      videoUrl,
      tags,
      keywords,
      serviceAreas,
      tiers
    } = req.body;

    // Validate required fields
    if (!title || !description || !priceType) {
      return res.status(400).json({ 
        error: "Title, description, and price type are required" 
      });
    }

    // Validate price type
    const validPriceTypes = ['fixed', 'hourly', 'daily', 'per_m2', 'per_unit', 'negotiable', 'quote_based'];
    if (!validPriceTypes.includes(priceType)) {
      return res.status(400).json({ error: "Invalid price type" });
    }

    // For non-negotiable pricing, base price is required
    if (priceType !== 'negotiable' && priceType !== 'quote_based' && !basePrice) {
      return res.status(400).json({ 
        error: "Base price is required for this pricing type" 
      });
    }

    // Get freelancer profile
    const [freelancerProfile] = await db
      .select({ id: freelancerProfiles.id })
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.userId, userId))
      .limit(1);

    if (!freelancerProfile) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }

    // Generate slug
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Create service package
    const [servicePackage] = await db
      .insert(servicePackages)
      .values({
        freelancerId: freelancerProfile.id,
        categoryId,
        title,
        slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
        description,
        shortDescription,
        priceType,
        price: basePrice || 0,
        priceUnit,
        minimumBudget,
        deliveryTime: deliveryTime || 1,
        deliveryTimeUnit: deliveryTimeUnit || 'days',
        sla,
        revisions: revisions || 0,
        features: features || [],
        requirements: requirements || [],
        extras: extras || [],
        policies: policies || {},
        faqs: faqs || [],
        images: images || [],
        videoUrl,
        tags: tags || [],
        keywords: keywords || [],
        serviceAreas,
        status: 'draft',
        moderationStatus: 'pending'
      })
      .returning();

    // Create tiers if provided
    if (tiers && tiers.length > 0) {
      const tierInserts = tiers.map((tier: any, index: number) => ({
        packageId: servicePackage.id,
        name: tier.name || ['basic', 'standard', 'premium'][index],
        title: tier.title,
        description: tier.description,
        price: tier.price,
        deliveryTime: tier.deliveryTime,
        revisions: tier.revisions || 0,
        features: tier.features || {},
        orderIndex: index
      }));

      await db.insert(packageTiers).values(tierInserts);
    }

    res.status(201).json({
      message: "Service created successfully",
      service: {
        id: servicePackage.id,
        title: servicePackage.title,
        slug: servicePackage.slug,
        priceType: servicePackage.priceType,
        price: servicePackage.price,
        status: servicePackage.status
      }
    });

  } catch (error: any) {
    console.error("Create service error:", error);
    res.status(500).json({ error: "Failed to create service" });
  }
});

// Get pricing suggestions based on category and location
router.get("/suggestions", requireAuth, async (req: Request, res: Response) => {
  try {
    const { categoryId, location, experienceLevel, serviceType } = req.query;

    if (!categoryId) {
      return res.status(400).json({ error: "Category ID is required" });
    }

    // Get existing pricing data from similar services
    const existingServices = await db
      .select({
        price: servicePackages.price,
        priceType: servicePackages.priceType,
        deliveryTime: servicePackages.deliveryTime,
        orderCount: servicePackages.orderCount
      })
      .from(servicePackages)
      .leftJoin(freelancerProfiles, eq(servicePackages.freelancerId, freelancerProfiles.id))
      .where(
        and(
          eq(servicePackages.categoryId, categoryId as string),
          eq(servicePackages.status, 'active')
        )
      );

    // Filter by location if provided
    let locationFilteredServices = existingServices;
    if (location) {
      locationFilteredServices = existingServices.filter(service => {
        // In a real implementation, you'd check the freelancer's coverage areas
        return true; // Simplified for now
      });
    }

    // Calculate statistics
    const prices = locationFilteredServices
      .filter(s => s.price > 0)
      .map(s => Number(s.price));

    if (prices.length === 0) {
      return res.json({
        suggestions: {
          avgPrice: null,
          minPrice: null,
          maxPrice: null,
          recommendedRange: null,
          sampleSize: 0,
          message: "Not enough data for pricing suggestions"
        }
      });
    }

    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Calculate percentiles for better recommendations
    const sortedPrices = prices.sort((a, b) => a - b);
    const p25 = sortedPrices[Math.floor(sortedPrices.length * 0.25)];
    const p75 = sortedPrices[Math.floor(sortedPrices.length * 0.75)];
    const median = sortedPrices[Math.floor(sortedPrices.length * 0.5)];

    // Adjust recommendations based on experience level
    let multiplier = 1;
    switch (experienceLevel) {
      case 'entry':
        multiplier = 0.7;
        break;
      case 'intermediate':
        multiplier = 1;
        break;
      case 'expert':
        multiplier = 1.3;
        break;
    }

    const recommendedMin = Math.round(p25 * multiplier);
    const recommendedMax = Math.round(p75 * multiplier);
    const recommendedOptimal = Math.round(median * multiplier);

    // Store suggestion in database for future reference
    await db
      .insert(pricingSuggestions)
      .values({
        categoryId: categoryId as string,
        serviceType: serviceType as string || 'general',
        location: location as string || 'general',
        experienceLevel: experienceLevel as string || 'intermediate',
        avgPrice: avgPrice.toString(),
        minPrice: minPrice.toString(),
        maxPrice: maxPrice.toString(),
        priceFactors: {
          median,
          p25,
          p75,
          multiplier,
          recommendedRange: { min: recommendedMin, max: recommendedMax, optimal: recommendedOptimal }
        },
        sampleSize: prices.length
      })
      .onConflictDoNothing();

    res.json({
      suggestions: {
        avgPrice: Math.round(avgPrice),
        minPrice,
        maxPrice,
        median: Math.round(median),
        recommendedRange: {
          min: recommendedMin,
          max: recommendedMax,
          optimal: recommendedOptimal
        },
        sampleSize: prices.length,
        factors: {
          experienceLevel,
          location,
          categoryTrend: prices.length > 5 ? 'stable' : 'limited_data'
        },
        insights: generatePricingInsights(prices, avgPrice, experienceLevel as string)
      }
    });

  } catch (error: any) {
    console.error("Get pricing suggestions error:", error);
    res.status(500).json({ error: "Failed to get pricing suggestions" });
  }
});

// Update service pricing
router.patch("/services/:serviceId/pricing", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { serviceId } = req.params;
    const {
      priceType,
      price,
      priceUnit,
      minimumBudget,
      maximumBudget,
      tiers
    } = req.body;

    // Verify service ownership
    const [service] = await db
      .select({ freelancerId: servicePackages.freelancerId })
      .from(servicePackages)
      .leftJoin(freelancerProfiles, eq(servicePackages.freelancerId, freelancerProfiles.id))
      .where(
        and(
          eq(servicePackages.id, serviceId),
          eq(freelancerProfiles.userId, userId)
        )
      )
      .limit(1);

    if (!service) {
      return res.status(404).json({ error: "Service not found or access denied" });
    }

    // Update service pricing
    const updateData: any = {};
    if (priceType) updateData.priceType = priceType;
    if (price !== undefined) updateData.price = price;
    if (priceUnit) updateData.priceUnit = priceUnit;
    if (minimumBudget !== undefined) updateData.minimumBudget = minimumBudget;
    if (maximumBudget !== undefined) updateData.maximumBudget = maximumBudget;

    await db
      .update(servicePackages)
      .set(updateData)
      .where(eq(servicePackages.id, serviceId));

    // Update tiers if provided
    if (tiers) {
      // Delete existing tiers
      await db
        .delete(packageTiers)
        .where(eq(packageTiers.packageId, serviceId));

      // Insert new tiers
      if (tiers.length > 0) {
        const tierInserts = tiers.map((tier: any, index: number) => ({
          packageId: serviceId,
          name: tier.name || ['basic', 'standard', 'premium'][index],
          title: tier.title,
          description: tier.description,
          price: tier.price,
          deliveryTime: tier.deliveryTime,
          revisions: tier.revisions || 0,
          features: tier.features || {},
          orderIndex: index
        }));

        await db.insert(packageTiers).values(tierInserts);
      }
    }

    res.json({
      message: "Service pricing updated successfully",
      serviceId
    });

  } catch (error: any) {
    console.error("Update service pricing error:", error);
    res.status(500).json({ error: "Failed to update service pricing" });
  }
});

// Get market analytics for pricing optimization
router.get("/analytics/:categoryId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { timeframe = '30d' } = req.query;

    // Get category information
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Get pricing analytics
    const services = await db
      .select({
        price: servicePackages.price,
        priceType: servicePackages.priceType,
        orderCount: servicePackages.orderCount,
        viewCount: servicePackages.viewCount,
        conversionRate: servicePackages.conversionRate,
        averageRating: freelancerProfiles.averageRating,
        isPro: freelancerProfiles.isPro
      })
      .from(servicePackages)
      .leftJoin(freelancerProfiles, eq(servicePackages.freelancerId, freelancerProfiles.id))
      .where(
        and(
          eq(servicePackages.categoryId, categoryId),
          eq(servicePackages.status, 'active')
        )
      );

    // Analyze pricing by service type
    const pricingByType = services.reduce((acc: any, service) => {
      const type = service.priceType;
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          prices: [],
          avgConversion: 0,
          avgRating: 0
        };
      }
      
      acc[type].count++;
      if (service.price > 0) {
        acc[type].prices.push(Number(service.price));
      }
      acc[type].avgConversion += Number(service.conversionRate || 0);
      acc[type].avgRating += Number(service.averageRating || 0);
      
      return acc;
    }, {});

    // Calculate averages
    Object.keys(pricingByType).forEach(type => {
      const data = pricingByType[type];
      data.avgPrice = data.prices.length > 0 
        ? data.prices.reduce((a: number, b: number) => a + b, 0) / data.prices.length 
        : 0;
      data.avgConversion = data.avgConversion / data.count;
      data.avgRating = data.avgRating / data.count;
    });

    // Performance insights
    const topPerformers = services
      .filter(s => s.orderCount > 5)
      .sort((a, b) => (b.conversionRate || 0) - (a.conversionRate || 0))
      .slice(0, 10);

    const insights = {
      totalServices: services.length,
      averagePrice: services.reduce((sum, s) => sum + Number(s.price), 0) / services.length,
      pricingDistribution: pricingByType,
      marketTrends: {
        popularPriceType: Object.keys(pricingByType).reduce((a, b) => 
          pricingByType[a].count > pricingByType[b].count ? a : b
        ),
        avgConversionRate: services.reduce((sum, s) => sum + Number(s.conversionRate || 0), 0) / services.length,
        proVsRegular: {
          pro: services.filter(s => s.isPro).length,
          regular: services.filter(s => !s.isPro).length
        }
      },
      recommendations: generateMarketRecommendations(pricingByType, topPerformers)
    };

    res.json({
      category: {
        id: category.id,
        name: category.name
      },
      analytics: insights,
      timeframe
    });

  } catch (error: any) {
    console.error("Get pricing analytics error:", error);
    res.status(500).json({ error: "Failed to get pricing analytics" });
  }
});

// Helper functions
function generatePricingInsights(prices: number[], avgPrice: number, experienceLevel: string): string[] {
  const insights = [];
  
  if (prices.length < 5) {
    insights.push("Limited market data available - consider researching competitor pricing");
  }
  
  if (experienceLevel === 'expert') {
    insights.push("As an expert, you can charge 20-30% above average market rates");
  }
  
  const priceVariation = (Math.max(...prices) - Math.min(...prices)) / avgPrice;
  if (priceVariation > 2) {
    insights.push("High price variation in this category - consider unique value propositions");
  }
  
  insights.push("Consider offering package tiers to appeal to different budget ranges");
  
  return insights;
}

function generateMarketRecommendations(pricingByType: any, topPerformers: any[]): string[] {
  const recommendations = [];
  
  // Find most successful pricing type
  const bestType = Object.keys(pricingByType).reduce((best, current) => {
    return pricingByType[current].avgConversion > pricingByType[best].avgConversion ? current : best;
  });
  
  recommendations.push(`${bestType} pricing shows highest conversion rates in this category`);
  
  if (topPerformers.length > 0) {
    const avgTopPrice = topPerformers.reduce((sum, p) => sum + Number(p.price), 0) / topPerformers.length;
    recommendations.push(`Top performers average R$ ${Math.round(avgTopPrice)} in pricing`);
  }
  
  recommendations.push("Consider seasonal pricing adjustments based on demand patterns");
  
  return recommendations;
}

export { router as pricingRouter };