import express from 'express';
import { db } from '../db/index.js';
import { freelancerProfiles, users, servicePackages } from '../db/schema-sqlite.js';
import { eq, desc, sql, and, or, ilike } from 'drizzle-orm';
import { requireAuth, requireFreelancer } from './auth.js';
import { z } from 'zod';

export const freelancersRouter = express.Router();

// Create/Update freelancer profile schema
const freelancerProfileSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(50).optional(),
  bio: z.string().min(100).optional(),
  hourlyRate: z.string().transform(val => parseFloat(val)).optional(),
  skills: z.array(z.string()).min(1).max(20),
  experience: z.number().min(0).max(50).optional(),
  availability: z.enum(['full-time', 'part-time', 'contract']).optional(),
  location: z.string().optional(),
  languages: z.array(z.string()).optional(),
  portfolio: z.array(z.object({
    title: z.string(),
    description: z.string(),
    imageUrl: z.string().url(),
    link: z.string().url().optional(),
  })).optional(),
});

// Search freelancers
freelancersRouter.get('/search', async (req, res) => {
  try {
    const {
      q,
      skills,
      minRate,
      maxRate,
      availability,
      location,
      page = '1',
      limit = '12'
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    let query = db
      .select({
        freelancer: freelancerProfiles,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
        avgRating: sql<number>`4.5`,
        reviewCount: sql<number>`0`,
      })
      .from(freelancerProfiles)
      .innerJoin(users, eq(freelancerProfiles.userId, users.id))
      // .leftJoin(reviews, eq(reviews.revieweeId, users.id)) // TODO: Implement reviews table
      .groupBy(freelancerProfiles.id, users.id);
    
    // Apply filters
    const conditions = [];
    
    if (q) {
      conditions.push(
        or(
          ilike(freelancerProfiles.title, `%${q}%`),
          ilike(freelancerProfiles.description, `%${q}%`),
        )
      );
    }
    
    if (skills && typeof skills === 'string') {
      const skillsArray = skills.split(',');
      conditions.push(
        sql`${freelancerProfiles.skills} && ARRAY[${sql.raw(skillsArray.map(s => `'${s}'`).join(','))}]`
      );
    }
    
    if (minRate) {
      conditions.push(sql`${freelancerProfiles.hourlyRate} >= ${parseFloat(minRate as string)}`);
    }
    
    if (maxRate) {
      conditions.push(sql`${freelancerProfiles.hourlyRate} <= ${parseFloat(maxRate as string)}`);
    }
    
    if (availability) {
      conditions.push(eq(freelancerProfiles.availability, availability as any));
    }
    
    if (location) {
      conditions.push(ilike(freelancerProfiles.location, `%${location}%`));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Get total count
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(freelancerProfiles)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const totalCount = Number(countResult[0].count);
    
    // Get paginated results
    const results = await query
      .orderBy(desc(freelancerProfiles.createdAt))
      .limit(limitNum)
      .offset(offset);
    
    res.json({
      freelancers: results,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    console.error('Search freelancers error:', error);
    res.status(500).json({ error: 'Failed to search freelancers' });
  }
});

// Get freelancer profile by ID
freelancersRouter.get('/:id', async (req, res) => {
  try {
    const freelancerId = req.params.id;
    
    const result = await db
      .select({
        freelancer: freelancerProfiles,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          email: users.email,
        },
        avgRating: sql<number>`4.5`,
        reviewCount: sql<number>`0`,
        serviceCount: sql<number>`COUNT(DISTINCT ${servicePackages.id})`,
      })
      .from(freelancerProfiles)
      .innerJoin(users, eq(freelancerProfiles.userId, users.id))
      // .leftJoin(reviews, eq(reviews.revieweeId, users.id)) // TODO: Implement reviews table
      .leftJoin(servicePackages, eq(servicePackages.freelancerId, freelancerProfiles.id))
      .where(eq(freelancerProfiles.id, freelancerId))
      .groupBy(freelancerProfiles.id, users.id);
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }
    
    // Increment profile views
    await db
      .update(freelancerProfiles)
      .set({ profileViews: sql`${freelancerProfiles.profileViews} + 1` })
      .where(eq(freelancerProfiles.id, freelancerId));
    
    res.json(result[0]);
  } catch (error) {
    console.error('Get freelancer error:', error);
    res.status(500).json({ error: 'Failed to get freelancer profile' });
  }
});

// Create or update freelancer profile
freelancersRouter.post('/profile', requireAuth, requireFreelancer, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const validatedData = freelancerProfileSchema.parse(req.body);
    
    // Check if profile already exists
    const existingProfile = await db
      .select()
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.userId, userId))
      .limit(1);
    
    let profile;
    
    if (existingProfile.length > 0) {
      // Update existing profile
      profile = await db
        .update(freelancerProfiles)
        .set({
          ...validatedData,
          hourlyRate: validatedData.hourlyRate?.toString(),
          updatedAt: new Date(),
        })
        .where(eq(freelancerProfiles.userId, userId))
        .returning();
    } else {
      // Create new profile
      profile = await db
        .insert(freelancerProfiles)
        .values({
          userId,
          ...validatedData,
          hourlyRate: validatedData.hourlyRate?.toString(),
        })
        .returning();
    }
    
    res.json(profile[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Create/update freelancer profile error:', error);
    res.status(500).json({ error: 'Failed to save freelancer profile' });
  }
});

// Get freelancer's services
freelancersRouter.get('/:id/services', async (req, res) => {
  try {
    const freelancerId = req.params.id;
    const { page = '1', limit = '12' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    const services = await db
      .select()
      .from(servicePackages)
      .where(and(
        eq(servicePackages.freelancerId, freelancerId),
        eq(servicePackages.isActive, true)
      ))
      .orderBy(desc(servicePackages.createdAt))
      .limit(limitNum)
      .offset(offset);
    
    const totalCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(servicePackages)
      .where(and(
        eq(servicePackages.freelancerId, freelancerId),
        eq(servicePackages.isActive, true)
      ));
    
    res.json({
      services,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(totalCount[0].count),
        pages: Math.ceil(Number(totalCount[0].count) / limitNum),
      },
    });
  } catch (error) {
    console.error('Get freelancer services error:', error);
    res.status(500).json({ error: 'Failed to get freelancer services' });
  }
});

// Get freelancer's reviews - TODO: Implement reviews table
/*
freelancersRouter.get('/:id/reviews', async (req, res) => {
  try {
    const freelancerId = req.params.id;
    const { page = '1', limit = '10' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    // First get the user ID for this freelancer
    const freelancerResult = await db
      .select({ userId: freelancerProfiles.userId })
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.id, freelancerId))
      .limit(1);
    
    if (freelancerResult.length === 0) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }
    
    const userId = freelancerResult[0].userId;
    
    const reviewsResult = await db
      .select({
        review: reviews,
        reviewer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.reviewerId, users.id))
      .where(eq(reviews.revieweeId, userId))
      .orderBy(desc(reviews.createdAt))
      .limit(limitNum)
      .offset(offset);
    
    const totalCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(reviews)
      .where(eq(reviews.revieweeId, userId));
    
    res.json({
      reviews: reviewsResult,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(totalCount[0].count),
        pages: Math.ceil(Number(totalCount[0].count) / limitNum),
      },
    });
  } catch (error) {
    console.error('Get freelancer reviews error:', error);
    res.status(500).json({ error: 'Failed to get freelancer reviews' });
  }
});
*/