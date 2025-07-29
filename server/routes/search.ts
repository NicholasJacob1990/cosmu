import express from "express";
import { Request, Response } from "express";
import { db } from "../db/index.js";
import { 
  servicePackages, 
  freelancerProfiles, 
  categories, 
  users,
  projects,
  skills 
} from "../db/schema.js";
import { eq, and, or, ilike, sql, desc, asc, inArray } from "drizzle-orm";

const router = express.Router();

// Advanced search with geolocation
router.post("/services", async (req: Request, res: Response) => {
  try {
    const {
      query = "",
      location,
      coordinates, // { lat, lng }
      maxDistance = 50, // km
      categoryId,
      subcategoryIds = [],
      priceRange = {}, // { min, max }
      priceType,
      deliveryTime, // max days
      freelancerLevel, // 'entry', 'intermediate', 'expert'
      rating, // minimum rating
      availability = [], // ['online', 'verified', 'pro']
      sortBy = 'relevance', // 'relevance', 'price_low', 'price_high', 'rating', 'delivery_time', 'distance'
      page = 1,
      limit = 20,
      includeRemote = true
    } = req.body;

    // Build base query
    let searchQuery = db
      .select({
        // Service fields
        id: servicePackages.id,
        title: servicePackages.title,
        slug: servicePackages.slug,
        shortDescription: servicePackages.shortDescription,
        description: servicePackages.description,
        price: servicePackages.price,
        priceType: servicePackages.priceType,
        minimumBudget: servicePackages.minimumBudget,
        deliveryTime: servicePackages.deliveryTime,
        deliveryTimeUnit: servicePackages.deliveryTimeUnit,
        images: servicePackages.images,
        tags: servicePackages.tags,
        orderCount: servicePackages.orderCount,
        viewCount: servicePackages.viewCount,
        isFeatured: servicePackages.isFeatured,
        serviceAreas: servicePackages.serviceAreas,
        
        // Freelancer fields
        freelancerId: freelancerProfiles.id,
        freelancerName: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        freelancerTitle: freelancerProfiles.title,
        freelancerLocation: freelancerProfiles.location,
        freelancerCoverageAreas: freelancerProfiles.coverageAreas,
        freelancerAvatar: users.profileImageUrl,
        freelancerRating: freelancerProfiles.averageRating,
        freelancerReviews: freelancerProfiles.totalReviews,
        freelancerLevel: sql`CASE 
          WHEN ${freelancerProfiles.completedProjects} >= 100 THEN 'expert'
          WHEN ${freelancerProfiles.completedProjects} >= 20 THEN 'intermediate'
          ELSE 'entry'
        END`,
        isVerified: freelancerProfiles.isVerified,
        isPro: freelancerProfiles.isPro,
        responseTime: freelancerProfiles.responseTime,
        
        // Category fields
        categoryName: categories.name,
        categorySlug: categories.slug
      })
      .from(servicePackages)
      .leftJoin(freelancerProfiles, eq(servicePackages.freelancerId, freelancerProfiles.id))
      .leftJoin(users, eq(freelancerProfiles.userId, users.id))
      .leftJoin(categories, eq(servicePackages.categoryId, categories.id))
      .where(
        and(
          eq(servicePackages.status, 'active'),
          eq(servicePackages.moderationStatus, 'approved'),
          eq(freelancerProfiles.isVerified, true)
        )
      );

    // Apply filters
    const conditions = [];

    // Text search
    if (query.trim()) {
      const searchTerm = `%${query.toLowerCase()}%`;
      conditions.push(
        or(
          ilike(servicePackages.title, searchTerm),
          ilike(servicePackages.description, searchTerm),
          ilike(servicePackages.shortDescription, searchTerm),
          sql`EXISTS (
            SELECT 1 FROM unnest(${servicePackages.tags}) AS tag 
            WHERE LOWER(tag) LIKE ${searchTerm}
          )`,
          sql`EXISTS (
            SELECT 1 FROM unnest(${servicePackages.keywords}) AS keyword 
            WHERE LOWER(keyword) LIKE ${searchTerm}
          )`,
          ilike(freelancerProfiles.title, searchTerm),
          sql`EXISTS (
            SELECT 1 FROM unnest(${freelancerProfiles.skills}) AS skill 
            WHERE LOWER(skill) LIKE ${searchTerm}
          )`
        )
      );
    }

    // Category filter
    if (categoryId) {
      if (subcategoryIds.length > 0) {
        conditions.push(inArray(servicePackages.categoryId, subcategoryIds));
      } else {
        conditions.push(eq(servicePackages.categoryId, categoryId));
      }
    }

    // Price range filter
    if (priceRange.min !== undefined) {
      conditions.push(sql`${servicePackages.price} >= ${priceRange.min}`);
    }
    if (priceRange.max !== undefined) {
      conditions.push(sql`${servicePackages.price} <= ${priceRange.max}`);
    }

    // Price type filter
    if (priceType) {
      conditions.push(eq(servicePackages.priceType, priceType));
    }

    // Delivery time filter
    if (deliveryTime) {
      conditions.push(sql`${servicePackages.deliveryTime} <= ${deliveryTime}`);
    }

    // Freelancer level filter
    if (freelancerLevel) {
      switch (freelancerLevel) {
        case 'entry':
          conditions.push(sql`${freelancerProfiles.completedProjects} < 20`);
          break;
        case 'intermediate':
          conditions.push(sql`${freelancerProfiles.completedProjects} BETWEEN 20 AND 99`);
          break;
        case 'expert':
          conditions.push(sql`${freelancerProfiles.completedProjects} >= 100`);
          break;
      }
    }

    // Rating filter
    if (rating) {
      conditions.push(sql`${freelancerProfiles.averageRating} >= ${rating}`);
    }

    // Availability filters
    if (availability.includes('verified')) {
      conditions.push(eq(freelancerProfiles.isVerified, true));
    }
    if (availability.includes('pro')) {
      conditions.push(eq(freelancerProfiles.isPro, true));
    }

    // Apply all conditions
    if (conditions.length > 0) {
      searchQuery = searchQuery.where(and(...conditions));
    }

    // Execute query
    const services = await searchQuery;

    // Apply geolocation filtering
    let filteredServices = services;
    if (location || coordinates) {
      filteredServices = services.filter(service => {
        return checkLocationMatch(service, location, coordinates, maxDistance, includeRemote);
      });
    }

    // Calculate relevance scores and sort
    const scoredServices = filteredServices.map(service => ({
      ...service,
      relevanceScore: calculateRelevanceScore(service, query, location, coordinates),
      distance: coordinates && service.freelancerCoverageAreas 
        ? calculateDistance(service, coordinates) 
        : null
    }));

    // Sort results
    const sortedServices = sortServices(scoredServices, sortBy);

    // Pagination
    const offset = (page - 1) * limit;
    const paginatedServices = sortedServices.slice(offset, offset + limit);

    // Calculate search statistics
    const stats = calculateSearchStats(filteredServices, query);

    res.json({
      services: paginatedServices,
      pagination: {
        page,
        limit,
        total: filteredServices.length,
        totalPages: Math.ceil(filteredServices.length / limit),
        hasNext: offset + limit < filteredServices.length,
        hasPrev: page > 1
      },
      filters: {
        query,
        location,
        coordinates,
        categoryId,
        priceRange,
        sortBy
      },
      stats
    });

  } catch (error: any) {
    console.error("Search services error:", error);
    res.status(500).json({ error: "Failed to search services" });
  }
});

// Search freelancers with geolocation
router.post("/freelancers", async (req: Request, res: Response) => {
  try {
    const {
      query = "",
      location,
      coordinates,
      maxDistance = 50,
      skills = [],
      hourlyRateRange = {},
      availability,
      rating,
      level,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = req.body;

    // Build freelancer search query
    let freelancerQuery = db
      .select({
        id: freelancerProfiles.id,
        userId: freelancerProfiles.userId,
        title: freelancerProfiles.title,
        description: freelancerProfiles.description,
        bio: freelancerProfiles.bio,
        location: freelancerProfiles.location,
        coverageAreas: freelancerProfiles.coverageAreas,
        hourlyRate: freelancerProfiles.hourlyRate,
        skills: freelancerProfiles.skills,
        experience: freelancerProfiles.experience,
        availability: freelancerProfiles.availability,
        averageRating: freelancerProfiles.averageRating,
        totalReviews: freelancerProfiles.totalReviews,
        completedProjects: freelancerProfiles.completedProjects,
        successRate: freelancerProfiles.successRate,
        responseTime: freelancerProfiles.responseTime,
        isVerified: freelancerProfiles.isVerified,
        isPro: freelancerProfiles.isPro,
        profileViews: freelancerProfiles.profileViews,
        
        // User fields
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        lastLoginAt: users.lastLoginAt
      })
      .from(freelancerProfiles)
      .leftJoin(users, eq(freelancerProfiles.userId, users.id))
      .where(eq(freelancerProfiles.isVerified, true));

    // Apply filters
    const conditions = [];

    // Text search
    if (query.trim()) {
      const searchTerm = `%${query.toLowerCase()}%`;
      conditions.push(
        or(
          ilike(freelancerProfiles.title, searchTerm),
          ilike(freelancerProfiles.description, searchTerm),
          ilike(freelancerProfiles.bio, searchTerm),
          sql`EXISTS (
            SELECT 1 FROM unnest(${freelancerProfiles.skills}) AS skill 
            WHERE LOWER(skill) LIKE ${searchTerm}
          )`
        )
      );
    }

    // Skills filter
    if (skills.length > 0) {
      conditions.push(
        sql`${freelancerProfiles.skills} && ${skills}`
      );
    }

    // Hourly rate filter
    if (hourlyRateRange.min !== undefined) {
      conditions.push(sql`${freelancerProfiles.hourlyRate} >= ${hourlyRateRange.min}`);
    }
    if (hourlyRateRange.max !== undefined) {
      conditions.push(sql`${freelancerProfiles.hourlyRate} <= ${hourlyRateRange.max}`);
    }

    // Rating filter
    if (rating) {
      conditions.push(sql`${freelancerProfiles.averageRating} >= ${rating}`);
    }

    // Apply conditions
    if (conditions.length > 0) {
      freelancerQuery = freelancerQuery.where(and(...conditions));
    }

    const freelancers = await freelancerQuery;

    // Apply geolocation filtering
    let filteredFreelancers = freelancers;
    if (location || coordinates) {
      filteredFreelancers = freelancers.filter(freelancer => {
        return checkFreelancerLocationMatch(freelancer, location, coordinates, maxDistance);
      });
    }

    // Sort and paginate
    const sortedFreelancers = sortFreelancers(filteredFreelancers, sortBy);
    const offset = (page - 1) * limit;
    const paginatedFreelancers = sortedFreelancers.slice(offset, offset + limit);

    res.json({
      freelancers: paginatedFreelancers,
      pagination: {
        page,
        limit,
        total: filteredFreelancers.length,
        totalPages: Math.ceil(filteredFreelancers.length / limit)
      },
      filters: { query, location, skills, hourlyRateRange, sortBy }
    });

  } catch (error: any) {
    console.error("Search freelancers error:", error);
    res.status(500).json({ error: "Failed to search freelancers" });
  }
});

// Search projects
router.post("/projects", async (req: Request, res: Response) => {
  try {
    const {
      query = "",
      category,
      budgetRange = {},
      skills = [],
      experienceLevel,
      location,
      sortBy = 'newest',
      page = 1,
      limit = 20
    } = req.body;

    let projectQuery = db
      .select({
        id: projects.id,
        title: projects.title,
        slug: projects.slug,
        description: projects.description,
        budget: projects.budget,
        budgetType: projects.budgetType,
        duration: projects.duration,
        experienceLevel: projects.experienceLevel,
        deadline: projects.deadline,
        skillsRequired: projects.skillsRequired,
        status: projects.status,
        proposalCount: projects.proposalCount,
        viewCount: projects.viewCount,
        createdAt: projects.createdAt,
        
        // Client info
        clientName: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        clientAvatar: users.profileImageUrl,
        
        // Category info
        categoryName: categories.name
      })
      .from(projects)
      .leftJoin(users, eq(projects.clientId, users.id))
      .leftJoin(categories, eq(projects.categoryId, categories.id))
      .where(eq(projects.status, 'open'));

    // Apply filters similar to services search
    const conditions = [];

    if (query.trim()) {
      const searchTerm = `%${query.toLowerCase()}%`;
      conditions.push(
        or(
          ilike(projects.title, searchTerm),
          ilike(projects.description, searchTerm)
        )
      );
    }

    if (category) {
      conditions.push(eq(projects.categoryId, category));
    }

    if (budgetRange.min) {
      conditions.push(sql`${projects.budget} >= ${budgetRange.min}`);
    }
    if (budgetRange.max) {
      conditions.push(sql`${projects.budget} <= ${budgetRange.max}`);
    }

    if (experienceLevel) {
      conditions.push(eq(projects.experienceLevel, experienceLevel));
    }

    if (conditions.length > 0) {
      projectQuery = projectQuery.where(and(...conditions));
    }

    // Sort
    switch (sortBy) {
      case 'budget_high':
        projectQuery = projectQuery.orderBy(desc(projects.budget));
        break;
      case 'budget_low':
        projectQuery = projectQuery.orderBy(asc(projects.budget));
        break;
      case 'deadline':
        projectQuery = projectQuery.orderBy(asc(projects.deadline));
        break;
      case 'proposals':
        projectQuery = projectQuery.orderBy(desc(projects.proposalCount));
        break;
      default:
        projectQuery = projectQuery.orderBy(desc(projects.createdAt));
    }

    const allProjects = await projectQuery;

    // Pagination
    const offset = (page - 1) * limit;
    const paginatedProjects = allProjects.slice(offset, offset + limit);

    res.json({
      projects: paginatedProjects,
      pagination: {
        page,
        limit,
        total: allProjects.length,
        totalPages: Math.ceil(allProjects.length / limit)
      }
    });

  } catch (error: any) {
    console.error("Search projects error:", error);
    res.status(500).json({ error: "Failed to search projects" });
  }
});

// Get search suggestions
router.get("/suggestions", async (req: Request, res: Response) => {
  try {
    const { query = "", type = 'all' } = req.query;

    if (!query || (query as string).length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchTerm = `%${(query as string).toLowerCase()}%`;
    const suggestions: any[] = [];

    // Service suggestions
    if (type === 'all' || type === 'services') {
      const serviceSuggestions = await db
        .select({
          type: sql`'service'`,
          text: servicePackages.title,
          slug: servicePackages.slug,
          category: categories.name
        })
        .from(servicePackages)
        .leftJoin(categories, eq(servicePackages.categoryId, categories.id))
        .where(
          and(
            ilike(servicePackages.title, searchTerm),
            eq(servicePackages.status, 'active')
          )
        )
        .limit(5);

      suggestions.push(...serviceSuggestions);
    }

    // Category suggestions
    if (type === 'all' || type === 'categories') {
      const categorySuggestions = await db
        .select({
          type: sql`'category'`,
          text: categories.name,
          slug: categories.slug,
          category: sql`NULL`
        })
        .from(categories)
        .where(
          and(
            ilike(categories.name, searchTerm),
            eq(categories.isActive, true)
          )
        )
        .limit(5);

      suggestions.push(...categorySuggestions);
    }

    // Skill suggestions
    if (type === 'all' || type === 'skills') {
      const skillSuggestions = await db
        .select({
          type: sql`'skill'`,
          text: skills.name,
          slug: skills.slug,
          category: categories.name
        })
        .from(skills)
        .leftJoin(categories, eq(skills.categoryId, categories.id))
        .where(ilike(skills.name, searchTerm))
        .orderBy(desc(skills.usageCount))
        .limit(5);

      suggestions.push(...skillSuggestions);
    }

    res.json({ suggestions: suggestions.slice(0, 10) });

  } catch (error: any) {
    console.error("Get search suggestions error:", error);
    res.status(500).json({ error: "Failed to get suggestions" });
  }
});

// Helper functions
function checkLocationMatch(service: any, location: string, coordinates: any, maxDistance: number, includeRemote: boolean): boolean {
  const coverage = service.freelancerCoverageAreas;
  
  if (!coverage || !coverage.type) {
    return includeRemote; // If no coverage defined, include only if remote is allowed
  }

  switch (coverage.type) {
    case 'nationwide':
      return true;
      
    case 'statewide':
      if (!coverage.states || !location) return false;
      return coverage.states.some((state: string) => 
        location.toLowerCase().includes(state.toLowerCase())
      );
      
    case 'citywide':
      if (!coverage.cities || !location) return false;
      return coverage.cities.some((city: string) => 
        location.toLowerCase().includes(city.toLowerCase())
      );
      
    case 'specific_areas':
      if (!coverage.areas || !location) return false;
      return coverage.areas.some((area: string) => 
        location.toLowerCase().includes(area.toLowerCase())
      );
      
    case 'radius':
      if (!coverage.center || !coordinates) return false;
      const distance = calculateDistanceKm(
        coordinates.lat, coordinates.lng,
        coverage.center.lat, coverage.center.lng
      );
      return distance <= Math.min(coverage.radius, maxDistance);
      
    default:
      return includeRemote;
  }
}

function checkFreelancerLocationMatch(freelancer: any, location: string, coordinates: any, maxDistance: number): boolean {
  return checkLocationMatch({ freelancerCoverageAreas: freelancer.coverageAreas }, location, coordinates, maxDistance, true);
}

function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculateDistance(service: any, coordinates: any): number | null {
  const coverage = service.freelancerCoverageAreas;
  if (coverage && coverage.type === 'radius' && coverage.center) {
    return calculateDistanceKm(
      coordinates.lat, coordinates.lng,
      coverage.center.lat, coverage.center.lng
    );
  }
  return null;
}

function calculateRelevanceScore(service: any, query: string, location: string, coordinates: any): number {
  let score = 0;
  
  // Text relevance
  if (query) {
    const queryLower = query.toLowerCase();
    if (service.title.toLowerCase().includes(queryLower)) score += 10;
    if (service.shortDescription?.toLowerCase().includes(queryLower)) score += 5;
    if (service.freelancerTitle?.toLowerCase().includes(queryLower)) score += 3;
  }
  
  // Quality indicators
  if (service.isPro) score += 5;
  if (service.isVerified) score += 3;
  if (service.isFeatured) score += 7;
  
  // Performance metrics
  score += (service.freelancerRating || 0) * 2;
  score += Math.min(service.orderCount || 0, 50) * 0.1;
  
  return score;
}

function sortServices(services: any[], sortBy: string): any[] {
  switch (sortBy) {
    case 'price_low':
      return services.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'price_high':
      return services.sort((a, b) => (b.price || 0) - (a.price || 0));
    case 'rating':
      return services.sort((a, b) => (b.freelancerRating || 0) - (a.freelancerRating || 0));
    case 'delivery_time':
      return services.sort((a, b) => (a.deliveryTime || 0) - (b.deliveryTime || 0));
    case 'distance':
      return services.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    default: // relevance
      return services.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  }
}

function sortFreelancers(freelancers: any[], sortBy: string): any[] {
  switch (sortBy) {
    case 'rate_low':
      return freelancers.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
    case 'rate_high':
      return freelancers.sort((a, b) => (b.hourlyRate || 0) - (a.hourlyRate || 0));
    case 'rating':
      return freelancers.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    case 'experience':
      return freelancers.sort((a, b) => (b.completedProjects || 0) - (a.completedProjects || 0));
    default:
      return freelancers.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
  }
}

function calculateSearchStats(services: any[], query: string) {
  return {
    totalResults: services.length,
    averagePrice: services.length > 0 
      ? services.reduce((sum, s) => sum + (s.price || 0), 0) / services.length 
      : 0,
    priceRange: {
      min: Math.min(...services.map(s => s.price || 0)),
      max: Math.max(...services.map(s => s.price || 0))
    },
    topCategories: getTopCategories(services),
    hasQuery: query.trim().length > 0
  };
}

function getTopCategories(services: any[]) {
  const categoryCount: { [key: string]: number } = {};
  services.forEach(service => {
    if (service.categoryName) {
      categoryCount[service.categoryName] = (categoryCount[service.categoryName] || 0) + 1;
    }
  });
  
  return Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
}

export { router as searchRouter };