import express from "express";
import { Request, Response } from "express";
import { db } from "../db/index.js";
import { categories, servicePackages, skills } from "../db/schema.js";
import { eq, and, asc, desc, like, or, sql } from 'drizzle-orm';
import { requireAuth } from './auth.js';

const router = express.Router();

// Get all categories with hierarchy
router.get("/", async (req: Request, res: Response) => {
  try {
    const { includeStats = false } = req.query;

    let categoriesQuery = db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        icon: categories.icon,
        parentId: categories.parentId,
        level: categories.level,
        path: categories.path,
        orderIndex: categories.orderIndex,
        isActive: categories.isActive,
        metadata: categories.metadata
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.level), asc(categories.orderIndex), asc(categories.name));

    const allCategories = await categoriesQuery;

    // If stats are requested, get service counts for each category
    let categoryStats: any = {};
    if (includeStats === 'true') {
      const statsQuery = await db
        .select({
          categoryId: servicePackages.categoryId,
          serviceCount: count(servicePackages.id)
        })
        .from(servicePackages)
        .where(eq(servicePackages.status, 'active'))
        .groupBy(servicePackages.categoryId);

      categoryStats = statsQuery.reduce((acc, stat) => {
        acc[stat.categoryId] = stat.serviceCount;
        return acc;
      }, {} as Record<string, number>);
    }

    // Build hierarchical structure
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // First pass: create all category objects
    allCategories.forEach(cat => {
      const category = {
        ...cat,
        children: [],
        serviceCount: categoryStats[cat.id] || 0
      };
      categoryMap.set(cat.id, category);

      if (!cat.parentId) {
        rootCategories.push(category);
      }
    });

    // Second pass: build parent-child relationships
    allCategories.forEach(cat => {
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        const child = categoryMap.get(cat.id);
        if (parent && child) {
          parent.children.push(child);
        }
      }
    });

    res.json({
      categories: rootCategories,
      totalCategories: allCategories.length,
      includeStats: includeStats === 'true'
    });

  } catch (error: any) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Get category by ID with full details
router.get("/:categoryId", async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { includeServices = false, includeSkills = false } = req.query;

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const result: any = { category };

    // Get subcategories
    const subcategories = await db
      .select()
      .from(categories)
      .where(eq(categories.parentId, categoryId))
      .orderBy(asc(categories.orderIndex), asc(categories.name));

    result.subcategories = subcategories;

    // Get parent category if exists
    if (category.parentId) {
      const [parent] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, category.parentId))
        .limit(1);
      result.parent = parent;
    }

    // Get services count
    const [serviceStats] = await db
      .select({ count: count(servicePackages.id) })
      .from(servicePackages)
      .where(eq(servicePackages.categoryId, categoryId));

    result.serviceCount = serviceStats.count;

    // Include related services if requested
    if (includeServices === 'true') {
      const services = await db
        .select({
          id: servicePackages.id,
          title: servicePackages.title,
          slug: servicePackages.slug,
          shortDescription: servicePackages.shortDescription,
          price: servicePackages.price,
          priceType: servicePackages.priceType,
          averageRating: sql`COALESCE(${servicePackages.orderCount}, 0)`,
          orderCount: servicePackages.orderCount,
          isFeatured: servicePackages.isFeatured
        })
        .from(servicePackages)
        .where(eq(servicePackages.categoryId, categoryId))
        .orderBy(desc(servicePackages.isFeatured), desc(servicePackages.orderCount))
        .limit(20);

      result.featuredServices = services;
    }

    // Include related skills if requested
    if (includeSkills === 'true') {
      const categorySkills = await db
        .select()
        .from(skills)
        .where(eq(skills.categoryId, categoryId))
        .orderBy(desc(skills.usageCount), asc(skills.name))
        .limit(50);

      result.skills = categorySkills;
    }

    res.json(result);

  } catch (error: any) {
    console.error("Get category details error:", error);
    res.status(500).json({ error: "Failed to fetch category details" });
  }
});

// Search categories
router.get("/search/:query", async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const searchTerm = `%${query.toLowerCase()}%`;

    const matchingCategories = await db
      .select()
      .from(categories)
      .where(
        sql`LOWER(${categories.name}) LIKE ${searchTerm} OR LOWER(${categories.description}) LIKE ${searchTerm}`
      )
      .orderBy(asc(categories.level), asc(categories.name))
      .limit(20);

    res.json({
      query,
      categories: matchingCategories,
      count: matchingCategories.length
    });

  } catch (error: any) {
    console.error("Search categories error:", error);
    res.status(500).json({ error: "Failed to search categories" });
  }
});

// Create new category (admin only)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    // TODO: Add admin role check
    const {
      name,
      slug,
      description,
      icon,
      parentId,
      orderIndex = 0,
      metadata = {}
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: "Name and slug are required" });
    }

    // Validate parent category exists if provided
    let level = 0;
    let path = `/${slug}`;
    
    if (parentId) {
      const [parent] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, parentId))
        .limit(1);

      if (!parent) {
        return res.status(400).json({ error: "Parent category not found" });
      }

      level = parent.level + 1;
      path = `${parent.path}/${slug}`;

      // Validate hierarchy depth (max 3 levels: root > category > subcategory)
      if (level > 2) {
        return res.status(400).json({ 
          error: "Maximum category depth exceeded (3 levels)" 
        });
      }
    }

    const [category] = await db
      .insert(categories)
      .values({
        name,
        slug,
        description,
        icon,
        parentId,
        level,
        path,
        orderIndex,
        metadata,
        isActive: true
      })
      .returning();

    res.status(201).json({
      message: "Category created successfully",
      category
    });

  } catch (error: any) {
    console.error("Create category error:", error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: "Category slug already exists" });
    }
    
    res.status(500).json({ error: "Failed to create category" });
  }
});

// Update category (admin only)
router.patch("/:categoryId", requireAuth, async (req: Request, res: Response) => {
  try {
    // TODO: Add admin role check
    const { categoryId } = req.params;
    const {
      name,
      description,
      icon,
      orderIndex,
      metadata,
      isActive
    } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (icon) updateData.icon = icon;
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex;
    if (metadata) updateData.metadata = metadata;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updatedCategory] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, categoryId))
      .returning();

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({
      message: "Category updated successfully",
      category: updatedCategory
    });

  } catch (error: any) {
    console.error("Update category error:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
});

// Delete category (admin only)
router.delete("/:categoryId", requireAuth, async (req: Request, res: Response) => {
  try {
    // TODO: Add admin role check
    const { categoryId } = req.params;

    // Check if category has services
    const [serviceCount] = await db
      .select({ count: count(servicePackages.id) })
      .from(servicePackages)
      .where(eq(servicePackages.categoryId, categoryId));

    if (serviceCount.count > 0) {
      return res.status(400).json({ 
        error: "Cannot delete category with existing services" 
      });
    }

    // Check if category has subcategories
    const [subcategoryCount] = await db
      .select({ count: count(categories.id) })
      .from(categories)
      .where(eq(categories.parentId, categoryId));

    if (subcategoryCount.count > 0) {
      return res.status(400).json({ 
        error: "Cannot delete category with subcategories" 
      });
    }

    await db
      .delete(categories)
      .where(eq(categories.id, categoryId));

    res.json({ message: "Category deleted successfully" });

  } catch (error: any) {
    console.error("Delete category error:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// Get popular categories based on service activity
router.get("/popular/trending", async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const popularCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        icon: categories.icon,
        serviceCount: count(servicePackages.id),
        avgRating: sql`AVG(CAST(COALESCE(${servicePackages.orderCount}, 0) AS DECIMAL))`,
        totalOrders: sql`SUM(COALESCE(${servicePackages.orderCount}, 0))`
      })
      .from(categories)
      .leftJoin(servicePackages, eq(categories.id, servicePackages.categoryId))
      .where(eq(categories.isActive, true))
      .groupBy(categories.id, categories.name, categories.slug, categories.description, categories.icon)
      .orderBy(desc(sql`COUNT(${servicePackages.id})`), desc(sql`SUM(COALESCE(${servicePackages.orderCount}, 0))`))
      .limit(Number(limit));

    res.json({
      popularCategories,
      limit: Number(limit)
    });

  } catch (error: any) {
    console.error("Get popular categories error:", error);
    res.status(500).json({ error: "Failed to fetch popular categories" });
  }
});

export { router as categoriesRouter };