import express from 'express';
import { db } from '../db/index.js';
import { users, freelancerProfiles } from '../db/schema-sqlite.js';
import { eq } from 'drizzle-orm';
import { requireAuth } from './auth.js';
import { z } from 'zod';

export const usersRouter = express.Router();

// Update user profile schema
const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  profileImageUrl: z.string().url().optional(),
});

// Get user by ID
usersRouter.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const userResult = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        userType: users.userType,
        createdAt: users.createdAt,
        freelancerProfile: freelancerProfiles,
      })
      .from(users)
      .leftJoin(freelancerProfiles, eq(users.id, freelancerProfiles.userId))
      .where(eq(users.id, userId))
      .limit(1);
    
    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(userResult[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update current user profile
usersRouter.put('/profile', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const validatedData = updateProfileSchema.parse(req.body);
    
    const updatedUser = await db
      .update(users)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (updatedUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: updatedUser[0].id,
      email: updatedUser[0].email,
      firstName: updatedUser[0].firstName,
      lastName: updatedUser[0].lastName,
      profileImageUrl: updatedUser[0].profileImageUrl,
      userType: updatedUser[0].userType,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Switch user type (client <-> freelancer)
usersRouter.post('/switch-type', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentType = userResult[0].userType;
    const newType = currentType === 'client' ? 'freelancer' : 'client';
    
    const updatedUser = await db
      .update(users)
      .set({
        userType: newType,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    res.json({
      message: `Successfully switched to ${newType} account`,
      userType: newType,
    });
  } catch (error) {
    console.error('Switch type error:', error);
    res.status(500).json({ error: 'Failed to switch account type' });
  }
});