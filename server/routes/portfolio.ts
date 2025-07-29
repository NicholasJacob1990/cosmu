import express from "express";
import { Request, Response } from "express";
import { db } from "../db/index.js";
import { freelancerProfiles } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "./auth.js";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const router = express.Router();

// Configure multer for portfolio uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'portfolio');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id;
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    const filename = `portfolio_${userId}_${timestamp}_${randomString}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for portfolio files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and documents (PDF, DOC, DOCX) are allowed.'));
    }
  }
});

// Upload portfolio item
router.post("/upload", requireAuth, upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, description, category, tags, projectUrl, isPrivate = false } = req.body;
    
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Get freelancer profile
    const [freelancerProfile] = await db
      .select()
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.userId, userId))
      .limit(1);

    if (!freelancerProfile) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }

    // Process uploaded files
    const files = req.files as Express.Multer.File[];
    const fileInfo = files.map(file => ({
      type: file.mimetype.startsWith('image/') ? 'image' : 
            file.mimetype.startsWith('video/') ? 'video' : 'document',
      url: `/uploads/portfolio/${file.filename}`,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype
    }));

    // Create portfolio item
    const portfolioItem = {
      id: crypto.randomUUID(),
      title,
      description,
      category,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : [],
      files: fileInfo,
      projectUrl,
      isPrivate: isPrivate === 'true',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Get current portfolio and add new item
    const currentPortfolio = freelancerProfile.portfolio as any[] || [];
    const updatedPortfolio = [...currentPortfolio, portfolioItem];

    // Update freelancer profile
    await db
      .update(freelancerProfiles)
      .set({ portfolio: updatedPortfolio })
      .where(eq(freelancerProfiles.userId, userId));

    res.status(201).json({
      message: "Portfolio item uploaded successfully",
      portfolioItem: {
        id: portfolioItem.id,
        title: portfolioItem.title,
        files: portfolioItem.files,
        createdAt: portfolioItem.createdAt
      }
    });

  } catch (error: any) {
    console.error("Portfolio upload error:", error);
    
    // Clean up uploaded files if database operation fails
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      for (const file of files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error("Failed to clean up uploaded file:", unlinkError);
        }
      }
    }

    res.status(500).json({ 
      error: error.message || "Failed to upload portfolio item" 
    });
  }
});

// Get freelancer portfolio
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { includePrivate = true } = req.query;

    const [freelancerProfile] = await db
      .select({ portfolio: freelancerProfiles.portfolio })
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.userId, userId))
      .limit(1);

    if (!freelancerProfile) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }

    let portfolio = freelancerProfile.portfolio as any[] || [];

    // Filter out private items if requested
    if (includePrivate === 'false') {
      portfolio = portfolio.filter(item => !item.isPrivate);
    }

    // Sort by creation date (newest first)
    portfolio.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      portfolio,
      totalItems: portfolio.length
    });

  } catch (error: any) {
    console.error("Get portfolio error:", error);
    res.status(500).json({ error: "Failed to fetch portfolio" });
  }
});

// Get public portfolio for a freelancer
router.get("/public/:freelancerId", async (req: Request, res: Response) => {
  try {
    const { freelancerId } = req.params;
    const { category, limit = 20 } = req.query;

    const [freelancerProfile] = await db
      .select({ 
        portfolio: freelancerProfiles.portfolio,
        title: freelancerProfiles.title,
        description: freelancerProfiles.description
      })
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.id, freelancerId))
      .limit(1);

    if (!freelancerProfile) {
      return res.status(404).json({ error: "Freelancer not found" });
    }

    let portfolio = freelancerProfile.portfolio as any[] || [];

    // Filter out private items
    portfolio = portfolio.filter(item => !item.isPrivate);

    // Filter by category if specified
    if (category) {
      portfolio = portfolio.filter(item => 
        item.category && item.category.toLowerCase() === (category as string).toLowerCase()
      );
    }

    // Sort by creation date and limit results
    portfolio.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    portfolio = portfolio.slice(0, Number(limit));

    res.json({
      freelancer: {
        id: freelancerId,
        title: freelancerProfile.title,
        description: freelancerProfile.description
      },
      portfolio,
      totalItems: portfolio.length,
      filters: { category, limit: Number(limit) }
    });

  } catch (error: any) {
    console.error("Get public portfolio error:", error);
    res.status(500).json({ error: "Failed to fetch portfolio" });
  }
});

// Update portfolio item
router.patch("/:itemId", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;
    const { title, description, category, tags, projectUrl, isPrivate } = req.body;

    // Get freelancer profile
    const [freelancerProfile] = await db
      .select({ portfolio: freelancerProfiles.portfolio })
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.userId, userId))
      .limit(1);

    if (!freelancerProfile) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }

    const portfolio = freelancerProfile.portfolio as any[] || [];
    const itemIndex = portfolio.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Portfolio item not found" });
    }

    // Update the item
    const updatedItem = {
      ...portfolio[itemIndex],
      updatedAt: new Date().toISOString()
    };

    if (title) updatedItem.title = title;
    if (description !== undefined) updatedItem.description = description;
    if (category) updatedItem.category = category;
    if (tags) updatedItem.tags = Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim());
    if (projectUrl !== undefined) updatedItem.projectUrl = projectUrl;
    if (isPrivate !== undefined) updatedItem.isPrivate = Boolean(isPrivate);

    portfolio[itemIndex] = updatedItem;

    // Update database
    await db
      .update(freelancerProfiles)
      .set({ portfolio })
      .where(eq(freelancerProfiles.userId, userId));

    res.json({
      message: "Portfolio item updated successfully",
      portfolioItem: updatedItem
    });

  } catch (error: any) {
    console.error("Update portfolio item error:", error);
    res.status(500).json({ error: "Failed to update portfolio item" });
  }
});

// Delete portfolio item
router.delete("/:itemId", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;

    // Get freelancer profile
    const [freelancerProfile] = await db
      .select({ portfolio: freelancerProfiles.portfolio })
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.userId, userId))
      .limit(1);

    if (!freelancerProfile) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }

    const portfolio = freelancerProfile.portfolio as any[] || [];
    const itemIndex = portfolio.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Portfolio item not found" });
    }

    const itemToDelete = portfolio[itemIndex];

    // Delete associated files from filesystem
    if (itemToDelete.files && Array.isArray(itemToDelete.files)) {
      for (const file of itemToDelete.files) {
        try {
          const filePath = path.join(process.cwd(), file.url);
          await fs.unlink(filePath);
        } catch (fileError) {
          console.warn("Failed to delete portfolio file:", fileError);
          // Continue with deletion even if file removal fails
        }
      }
    }

    // Remove item from portfolio
    portfolio.splice(itemIndex, 1);

    // Update database
    await db
      .update(freelancerProfiles)
      .set({ portfolio })
      .where(eq(freelancerProfiles.userId, userId));

    res.json({ message: "Portfolio item deleted successfully" });

  } catch (error: any) {
    console.error("Delete portfolio item error:", error);
    res.status(500).json({ error: "Failed to delete portfolio item" });
  }
});

// Reorder portfolio items
router.patch("/reorder", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { itemIds } = req.body; // Array of item IDs in desired order

    if (!Array.isArray(itemIds)) {
      return res.status(400).json({ error: "itemIds must be an array" });
    }

    // Get freelancer profile
    const [freelancerProfile] = await db
      .select({ portfolio: freelancerProfiles.portfolio })
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.userId, userId))
      .limit(1);

    if (!freelancerProfile) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }

    const portfolio = freelancerProfile.portfolio as any[] || [];

    // Create a map for quick lookup
    const portfolioMap = new Map();
    portfolio.forEach(item => portfolioMap.set(item.id, item));

    // Reorder portfolio based on provided IDs
    const reorderedPortfolio = itemIds
      .map(id => portfolioMap.get(id))
      .filter(item => item !== undefined);

    // Add any items not included in the reorder (at the end)
    const reorderedIds = new Set(itemIds);
    portfolio.forEach(item => {
      if (!reorderedIds.has(item.id)) {
        reorderedPortfolio.push(item);
      }
    });

    // Update database
    await db
      .update(freelancerProfiles)
      .set({ portfolio: reorderedPortfolio })
      .where(eq(freelancerProfiles.userId, userId));

    res.json({
      message: "Portfolio reordered successfully",
      totalItems: reorderedPortfolio.length
    });

  } catch (error: any) {
    console.error("Reorder portfolio error:", error);
    res.status(500).json({ error: "Failed to reorder portfolio" });
  }
});

// Get portfolio statistics
router.get("/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [freelancerProfile] = await db
      .select({ portfolio: freelancerProfiles.portfolio })
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.userId, userId))
      .limit(1);

    if (!freelancerProfile) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }

    const portfolio = freelancerProfile.portfolio as any[] || [];

    // Calculate statistics
    const stats = {
      totalItems: portfolio.length,
      publicItems: portfolio.filter(item => !item.isPrivate).length,
      privateItems: portfolio.filter(item => item.isPrivate).length,
      categories: [...new Set(portfolio.map(item => item.category).filter(Boolean))],
      fileTypes: {
        images: 0,
        videos: 0,
        documents: 0
      },
      totalFiles: 0,
      averageFilesPerItem: 0
    };

    // Count file types
    portfolio.forEach(item => {
      if (item.files && Array.isArray(item.files)) {
        stats.totalFiles += item.files.length;
        item.files.forEach((file: any) => {
          if (file.type === 'image') stats.fileTypes.images++;
          else if (file.type === 'video') stats.fileTypes.videos++;
          else if (file.type === 'document') stats.fileTypes.documents++;
        });
      }
    });

    stats.averageFilesPerItem = stats.totalItems > 0 
      ? Math.round((stats.totalFiles / stats.totalItems) * 100) / 100 
      : 0;

    res.json({ stats });

  } catch (error: any) {
    console.error("Get portfolio stats error:", error);
    res.status(500).json({ error: "Failed to fetch portfolio statistics" });
  }
});

export { router as portfolioRouter };