import express from 'express';
import { db } from '../db/index.js';
import { projects, proposals, users, freelancerProfiles } from '../db/schema-sqlite.js';
import { eq, desc, and, or, ilike, gte, lte } from 'drizzle-orm';
import { requireAuth } from './auth.js';
import { z } from 'zod';
import { nanoid } from 'nanoid';

export const projectsRouter = express.Router();

// Create project schema
const createProjectSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(100),
  requirements: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  budget: z.string().transform(val => parseFloat(val)).optional(),
  budgetType: z.enum(['fixed', 'hourly']).optional(),
  duration: z.string().optional(),
  experienceLevel: z.enum(['entry', 'intermediate', 'expert']).optional(),
  deadline: z.string().datetime().optional(),
  skillsRequired: z.array(z.string()).min(1).max(10),
  attachments: z.array(z.string()).optional(),
  visibility: z.enum(['public', 'private', 'invite-only']).default('public'),
});

// Search projects
projectsRouter.get('/search', async (req, res) => {
  try {
    const {
      q,
      categoryId,
      minBudget,
      maxBudget,
      budgetType,
      experienceLevel,
      skills,
      status = 'open',
      page = '1',
      limit = '12'
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    let query = db
      .select({
        project: projects,
        client: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
        // category: categories, // TODO: Implement categories table
      })
      .from(projects)
      .innerJoin(users, eq(projects.clientId, users.id))
      // .leftJoin(categories, eq(projects.categoryId, categories.id)) // TODO: Implement categories table;
    
    // Apply filters
    const conditions = [eq(projects.status, status as any)];
    
    if (q) {
      conditions.push(
        or(
          ilike(projects.title, `%${q}%`),
          ilike(projects.description, `%${q}%`),
        )
      );
    }
    
    if (categoryId) {
      conditions.push(eq(projects.categoryId, categoryId as string));
    }
    
    if (minBudget) {
      conditions.push(gte(projects.budget, parseFloat(minBudget as string).toString()));
    }
    
    if (maxBudget) {
      conditions.push(lte(projects.budget, parseFloat(maxBudget as string).toString()));
    }
    
    if (budgetType) {
      conditions.push(eq(projects.budgetType, budgetType as any));
    }
    
    if (experienceLevel) {
      conditions.push(eq(projects.experienceLevel, experienceLevel as any));
    }
    
    query = query.where(and(...conditions));
    
    // Get total count
    const countResult = await db
      .select({ count: db.count() })
      .from(projects)
      .where(and(...conditions));
    
    const totalCount = Number(countResult[0].count);
    
    // Get paginated results
    const results = await query
      .orderBy(desc(projects.createdAt))
      .limit(limitNum)
      .offset(offset);
    
    res.json({
      projects: results,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    console.error('Search projects error:', error);
    res.status(500).json({ error: 'Failed to search projects' });
  }
});

// Get project by ID
projectsRouter.get('/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    const result = await db
      .select({
        project: projects,
        client: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
        // category: categories, // TODO: Implement categories table
      })
      .from(projects)
      .innerJoin(users, eq(projects.clientId, users.id))
      // .leftJoin(categories, eq(projects.categoryId, categories.id)) // TODO: Implement categories table
      .where(eq(projects.id, projectId))
      .limit(1);
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Increment view count
    await db
      .update(projects)
      .set({ viewCount: db.sql`${projects.viewCount} + 1` })
      .where(eq(projects.id, projectId));
    
    // Get proposals count
    const proposalCount = await db
      .select({ count: db.count() })
      .from(proposals)
      .where(eq(proposals.projectId, projectId));
    
    res.json({
      ...result[0],
      proposalCount: Number(proposalCount[0].count),
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// Create project
projectsRouter.post('/', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const validatedData = createProjectSchema.parse(req.body);
    
    const slug = `${validatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${nanoid(6)}`;
    
    const newProject = await db
      .insert(projects)
      .values({
        ...validatedData,
        clientId: userId,
        slug,
        budget: validatedData.budget?.toString(),
      })
      .returning();
    
    res.status(201).json(newProject[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
projectsRouter.put('/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const projectId = req.params.id;
    
    // Check if user owns the project
    const projectResult = await db
      .select()
      .from(projects)
      .where(and(
        eq(projects.id, projectId),
        eq(projects.clientId, userId)
      ))
      .limit(1);
    
    if (projectResult.length === 0) {
      return res.status(403).json({ error: 'Not authorized to update this project' });
    }
    
    const validatedData = createProjectSchema.partial().parse(req.body);
    
    const updatedProject = await db
      .update(projects)
      .set({
        ...validatedData,
        budget: validatedData.budget?.toString(),
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning();
    
    res.json(updatedProject[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Get project proposals
projectsRouter.get('/:id/proposals', async (req, res) => {
  try {
    const projectId = req.params.id;
    const { page = '1', limit = '10' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    const proposalsResult = await db
      .select({
        proposal: proposals,
        freelancer: freelancerProfiles,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(proposals)
      .innerJoin(freelancerProfiles, eq(proposals.freelancerId, freelancerProfiles.id))
      .innerJoin(users, eq(freelancerProfiles.userId, users.id))
      .where(eq(proposals.projectId, projectId))
      .orderBy(desc(proposals.createdAt))
      .limit(limitNum)
      .offset(offset);
    
    const totalCount = await db
      .select({ count: db.count() })
      .from(proposals)
      .where(eq(proposals.projectId, projectId));
    
    res.json({
      proposals: proposalsResult,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(totalCount[0].count),
        pages: Math.ceil(Number(totalCount[0].count) / limitNum),
      },
    });
  } catch (error) {
    console.error('Get project proposals error:', error);
    res.status(500).json({ error: 'Failed to get project proposals' });
  }
});