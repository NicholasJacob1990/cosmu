import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users, insertUserSchema, subscriptions, featureUsage } from '../db/schema-sqlite.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const authRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'galaxia-jwt-secret';

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Register schema  
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  userType: z.enum(['client', 'freelancer', 'professional']).default('client'),
  professionalType: z.string().optional(),
  plan: z.string().default('free'),
});

// Register endpoint
authRouter.post('/register', async (req, res) => {
  try {
    // Validate input
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, validatedData.email)).limit(1);
    
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    // Create user
    const newUser = await db.insert(users).values({
      ...validatedData,
      password: hashedPassword,
    }).returning();
    
    // Create default subscription for professionals
    if (validatedData.userType === 'professional' || validatedData.userType === 'freelancer') {
      await db.insert(subscriptions).values({
        userId: newUser[0].id,
        plan: validatedData.plan || 'free',
        status: 'active',
        startDate: new Date(),
        features: { 
          planFeatures: ['basic_chat', 'basic_dashboard', 'email_support'],
          professionalType: validatedData.professionalType 
        },
        metadata: {}
      });

      // Initialize feature usage for free plan
      const currentMonth = new Date().toISOString().slice(0, 7);
      await db.insert(featureUsage).values([
        {
          userId: newUser[0].id,
          feature: 'services',
          period: currentMonth,
          used: 0,
          limit: 3
        },
        {
          userId: newUser[0].id,
          feature: 'proposals',
          period: currentMonth,
          used: 0,
          limit: 5
        }
      ]);
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser[0].id, email: newUser[0].email, userType: newUser[0].userType },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set session
    (req.session as any).userId = newUser[0].id;
    
    res.status(201).json({
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        firstName: newUser[0].firstName,
        lastName: newUser[0].lastName,
        userType: newUser[0].userType,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login endpoint
authRouter.post('/login', async (req, res) => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body);
    
    // Find user
    const userResult = await db.select().from(users).where(eq(users.email, validatedData.email)).limit(1);
    
    if (userResult.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = userResult[0];
    
    // Check password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.userType },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set session
    (req.session as any).userId = user.id;
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        profileImageUrl: user.profileImageUrl,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Logout endpoint
authRouter.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
authRouter.get('/me', async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult[0];
    
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      profileImageUrl: user.profileImageUrl,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// Middleware to check authentication
export function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const userId = (req.session as any).userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  (req as any).userId = userId;
  next();
}

// Middleware to check if user is a freelancer
export async function requireFreelancer(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const userId = (req as any).userId;
    
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (userResult.length === 0 || userResult[0].userType !== 'freelancer') {
      return res.status(403).json({ error: 'Freelancer access required' });
    }
    
    next();
  } catch (error) {
    console.error('Freelancer check error:', error);
    res.status(500).json({ error: 'Failed to verify freelancer status' });
  }
}