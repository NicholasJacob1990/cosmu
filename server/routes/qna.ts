import express from "express";
import { Request, Response } from "express";
import { db } from "../db/index.js";
import { serviceQuestions, servicePackages, freelancerProfiles, users } from "../db/schema.js";
import { eq, and, desc, asc, isNull, isNotNull, like, or, sql } from "drizzle-orm";
import { requireAuth } from "./auth.js";

const router = express.Router();

// Ask a question about a service
router.post("/services/:serviceId/questions", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { serviceId } = req.params;
    const { question, isPublic = true } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: "Question is required" });
    }

    if (question.length > 1000) {
      return res.status(400).json({ error: "Question must be less than 1000 characters" });
    }

    // Verify service exists
    const [service] = await db
      .select({
        id: servicePackages.id,
        freelancerId: servicePackages.freelancerId,
        title: servicePackages.title
      })
      .from(servicePackages)
      .where(
        and(
          eq(servicePackages.id, serviceId),
          eq(servicePackages.status, 'active')
        )
      )
      .limit(1);

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Check if user is asking about their own service
    const [freelancerProfile] = await db
      .select({ id: freelancerProfiles.id })
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.userId, userId))
      .limit(1);

    const isOwnService = freelancerProfile && freelancerProfile.id === service.freelancerId;

    if (isOwnService) {
      return res.status(400).json({ 
        error: "You cannot ask questions about your own service" 
      });
    }

    // Create the question
    const [newQuestion] = await db
      .insert(serviceQuestions)
      .values({
        serviceId,
        userId,
        question: question.trim(),
        isPublic: Boolean(isPublic)
      })
      .returning();

    // Get question with user details
    const [questionWithDetails] = await db
      .select({
        id: serviceQuestions.id,
        question: serviceQuestions.question,
        answer: serviceQuestions.answer,
        isPublic: serviceQuestions.isPublic,
        upvotes: serviceQuestions.upvotes,
        createdAt: serviceQuestions.createdAt,
        answeredAt: serviceQuestions.answeredAt,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userAvatar: users.profileImageUrl
      })
      .from(serviceQuestions)
      .leftJoin(users, eq(serviceQuestions.userId, users.id))
      .where(eq(serviceQuestions.id, newQuestion.id))
      .limit(1);

    res.status(201).json({
      message: "Question submitted successfully",
      question: questionWithDetails
    });

  } catch (error: any) {
    console.error("Submit question error:", error);
    res.status(500).json({ error: "Failed to submit question" });
  }
});

// Answer a question (service owner only)
router.patch("/questions/:questionId/answer", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { questionId } = req.params;
    const { answer } = req.body;

    if (!answer || answer.trim().length === 0) {
      return res.status(400).json({ error: "Answer is required" });
    }

    if (answer.length > 2000) {
      return res.status(400).json({ error: "Answer must be less than 2000 characters" });
    }

    // Get question and verify ownership
    const [question] = await db
      .select({
        id: serviceQuestions.id,
        serviceId: serviceQuestions.serviceId,
        freelancerId: servicePackages.freelancerId
      })
      .from(serviceQuestions)
      .leftJoin(servicePackages, eq(serviceQuestions.serviceId, servicePackages.id))
      .where(eq(serviceQuestions.id, questionId))
      .limit(1);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Verify user owns the service
    const [freelancerProfile] = await db
      .select({ id: freelancerProfiles.id })
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.userId, userId))
      .limit(1);

    if (!freelancerProfile || freelancerProfile.id !== question.freelancerId) {
      return res.status(403).json({ 
        error: "You can only answer questions about your own services" 
      });
    }

    // Update the question with answer
    const [updatedQuestion] = await db
      .update(serviceQuestions)
      .set({
        answer: answer.trim(),
        answeredBy: userId,
        answeredAt: new Date()
      })
      .where(eq(serviceQuestions.id, questionId))
      .returning();

    res.json({
      message: "Question answered successfully",
      question: updatedQuestion
    });

  } catch (error: any) {
    console.error("Answer question error:", error);
    res.status(500).json({ error: "Failed to answer question" });
  }
});

// Get questions for a service
router.get("/services/:serviceId/questions", async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    const { 
      includeUnanswered = false, 
      sortBy = 'recent', // 'recent', 'popular', 'oldest'
      page = 1, 
      limit = 20 
    } = req.query;

    // Verify service exists
    const [service] = await db
      .select({ id: servicePackages.id })
      .from(servicePackages)
      .where(eq(servicePackages.id, serviceId))
      .limit(1);

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Build query
    let questionsQuery = db
      .select({
        id: serviceQuestions.id,
        question: serviceQuestions.question,
        answer: serviceQuestions.answer,
        isPublic: serviceQuestions.isPublic,
        upvotes: serviceQuestions.upvotes,
        createdAt: serviceQuestions.createdAt,
        answeredAt: serviceQuestions.answeredAt,
        
        // Question author
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userAvatar: users.profileImageUrl,
        
        // Answer author (freelancer)
        answererFirstName: sql`answerer.first_name`,
        answererLastName: sql`answerer.last_name`,
        answererAvatar: sql`answerer.profile_image_url`
      })
      .from(serviceQuestions)
      .leftJoin(users, eq(serviceQuestions.userId, users.id))
      .leftJoin(
        sql`${users} as answerer`, 
        eq(serviceQuestions.answeredBy, sql`answerer.id`)
      )
      .where(
        and(
          eq(serviceQuestions.serviceId, serviceId),
          eq(serviceQuestions.isPublic, true)
        )
      );

    // Filter by answered status
    if (includeUnanswered === 'false') {
      questionsQuery = questionsQuery.where(isNotNull(serviceQuestions.answer));
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        questionsQuery = questionsQuery.orderBy(
          desc(serviceQuestions.upvotes),
          desc(serviceQuestions.createdAt)
        );
        break;
      case 'oldest':
        questionsQuery = questionsQuery.orderBy(asc(serviceQuestions.createdAt));
        break;
      default: // recent
        questionsQuery = questionsQuery.orderBy(desc(serviceQuestions.createdAt));
    }

    const allQuestions = await questionsQuery;

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    const paginatedQuestions = allQuestions.slice(offset, offset + Number(limit));

    // Calculate statistics
    const stats = {
      total: allQuestions.length,
      answered: allQuestions.filter(q => q.answer).length,
      unanswered: allQuestions.filter(q => !q.answer).length,
      averageUpvotes: allQuestions.length > 0 
        ? allQuestions.reduce((sum, q) => sum + (q.upvotes || 0), 0) / allQuestions.length 
        : 0
    };

    res.json({
      questions: paginatedQuestions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: allQuestions.length,
        totalPages: Math.ceil(allQuestions.length / Number(limit))
      },
      stats,
      filters: { includeUnanswered, sortBy }
    });

  } catch (error: any) {
    console.error("Get service questions error:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// Get questions by freelancer (for their dashboard)
router.get("/freelancer/questions", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { 
      status = 'all', // 'all', 'answered', 'unanswered'
      sortBy = 'recent',
      page = 1,
      limit = 20 
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

    // Build query for questions on freelancer's services
    let questionsQuery = db
      .select({
        id: serviceQuestions.id,
        question: serviceQuestions.question,
        answer: serviceQuestions.answer,
        isPublic: serviceQuestions.isPublic,
        upvotes: serviceQuestions.upvotes,
        createdAt: serviceQuestions.createdAt,
        answeredAt: serviceQuestions.answeredAt,
        
        // Service info
        serviceTitle: servicePackages.title,
        serviceSlug: servicePackages.slug,
        
        // Question author
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userAvatar: users.profileImageUrl
      })
      .from(serviceQuestions)
      .leftJoin(servicePackages, eq(serviceQuestions.serviceId, servicePackages.id))
      .leftJoin(users, eq(serviceQuestions.userId, users.id))
      .where(eq(servicePackages.freelancerId, freelancerProfile.id));

    // Filter by status
    switch (status) {
      case 'answered':
        questionsQuery = questionsQuery.where(isNotNull(serviceQuestions.answer));
        break;
      case 'unanswered':
        questionsQuery = questionsQuery.where(isNull(serviceQuestions.answer));
        break;
      // 'all' - no additional filter
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        questionsQuery = questionsQuery.orderBy(
          desc(serviceQuestions.upvotes),
          desc(serviceQuestions.createdAt)
        );
        break;
      case 'oldest':
        questionsQuery = questionsQuery.orderBy(asc(serviceQuestions.createdAt));
        break;
      default: // recent
        questionsQuery = questionsQuery.orderBy(desc(serviceQuestions.createdAt));
    }

    const allQuestions = await questionsQuery;

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    const paginatedQuestions = allQuestions.slice(offset, offset + Number(limit));

    res.json({
      questions: paginatedQuestions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: allQuestions.length,
        totalPages: Math.ceil(allQuestions.length / Number(limit))
      },
      stats: {
        total: allQuestions.length,
        answered: allQuestions.filter(q => q.answer).length,
        unanswered: allQuestions.filter(q => !q.answer).length
      }
    });

  } catch (error: any) {
    console.error("Get freelancer questions error:", error);
    res.status(500).json({ error: "Failed to fetch freelancer questions" });
  }
});

// Upvote a question
router.post("/questions/:questionId/upvote", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { questionId } = req.params;

    // Check if question exists
    const [question] = await db
      .select({
        id: serviceQuestions.id,
        upvotes: serviceQuestions.upvotes,
        userId: serviceQuestions.userId
      })
      .from(serviceQuestions)
      .where(eq(serviceQuestions.id, questionId))
      .limit(1);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Prevent users from upvoting their own questions
    if (question.userId === userId) {
      return res.status(400).json({ 
        error: "You cannot upvote your own question" 
      });
    }

    // For simplicity, we'll just increment the upvote count
    // In a production system, you'd want to track individual votes
    // to prevent duplicate voting
    const [updatedQuestion] = await db
      .update(serviceQuestions)
      .set({
        upvotes: (question.upvotes || 0) + 1
      })
      .where(eq(serviceQuestions.id, questionId))
      .returning({
        id: serviceQuestions.id,
        upvotes: serviceQuestions.upvotes
      });

    res.json({
      message: "Question upvoted successfully",
      question: updatedQuestion
    });

  } catch (error: any) {
    console.error("Upvote question error:", error);
    res.status(500).json({ error: "Failed to upvote question" });
  }
});

// Delete a question (author or service owner only)
router.delete("/questions/:questionId", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { questionId } = req.params;

    // Get question details
    const [question] = await db
      .select({
        id: serviceQuestions.id,
        userId: serviceQuestions.userId,
        serviceId: serviceQuestions.serviceId,
        freelancerId: servicePackages.freelancerId
      })
      .from(serviceQuestions)
      .leftJoin(servicePackages, eq(serviceQuestions.serviceId, servicePackages.id))
      .where(eq(serviceQuestions.id, questionId))
      .limit(1);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Check if user is question author or service owner
    let canDelete = question.userId === userId;

    if (!canDelete) {
      // Check if user owns the service
      const [freelancerProfile] = await db
        .select({ id: freelancerProfiles.id })
        .from(freelancerProfiles)
        .where(eq(freelancerProfiles.userId, userId))
        .limit(1);

      canDelete = freelancerProfile && freelancerProfile.id === question.freelancerId;
    }

    if (!canDelete) {
      return res.status(403).json({ 
        error: "You can only delete your own questions or questions on your services" 
      });
    }

    // Delete the question
    await db
      .delete(serviceQuestions)
      .where(eq(serviceQuestions.id, questionId));

    res.json({ message: "Question deleted successfully" });

  } catch (error: any) {
    console.error("Delete question error:", error);
    res.status(500).json({ error: "Failed to delete question" });
  }
});

export { router as qnaRouter };