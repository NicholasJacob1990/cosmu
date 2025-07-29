import express from "express";
import { Request, Response } from "express";
import { db } from "../db/index.js";
import { orders, transactions, users, freelancerProfiles, servicePackages } from "../db/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "./auth.js";
import crypto from "crypto";

const router = express.Router();

// Payment configuration
const PLATFORM_FEE_RATE = 0.10; // 10% platform fee
const PROCESSING_FEE_RATE = 0.029; // 2.9% + R$0.30 processing fee
const PROCESSING_FEE_FIXED = 0.30;

// Create payment intent for order
router.post("/orders/:orderId/payment-intent", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { orderId } = req.params;
    const { paymentMethod = 'credit_card' } = req.body;

    // Get order details
    const [order] = await db
      .select({
        id: orders.id,
        clientId: orders.clientId,
        freelancerId: orders.freelancerId,
        amount: orders.amount,
        platformFee: orders.platformFee,
        processingFee: orders.processingFee,
        totalAmount: orders.totalAmount,
        status: orders.status,
        escrowStatus: orders.escrowStatus,
        serviceTitle: servicePackages.title
      })
      .from(orders)
      .leftJoin(servicePackages, eq(orders.servicePackageId, servicePackages.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Verify user is the client
    if (order.clientId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if order can be paid
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        error: "Order cannot be paid in its current status" 
      });
    }

    // In a real implementation, integrate with payment processor (Stripe, MercadoPago, etc.)
    const paymentIntentId = `pi_${crypto.randomBytes(12).toString('hex')}`;
    
    // Create transaction record
    const [transaction] = await db
      .insert(transactions)
      .values({
        orderId,
        type: 'payment',
        status: 'pending',
        amount: order.totalAmount,
        currency: 'BRL',
        paymentMethod,
        transactionId: paymentIntentId,
        metadata: {
          paymentIntentId,
          breakdown: {
            serviceAmount: order.amount,
            platformFee: order.platformFee,
            processingFee: order.processingFee,
            total: order.totalAmount
          }
        }
      })
      .returning();

    // Mock payment processor response
    const paymentIntent = {
      id: paymentIntentId,
      amount: Number(order.totalAmount) * 100, // Convert to cents
      currency: 'brl',
      status: 'requires_payment_method',
      client_secret: `${paymentIntentId}_secret_${crypto.randomBytes(16).toString('hex')}`,
      metadata: {
        orderId,
        serviceTitle: order.serviceTitle
      }
    };

    res.json({
      paymentIntent,
      transaction: {
        id: transaction.id,
        status: transaction.status,
        amount: transaction.amount
      },
      breakdown: {
        serviceAmount: order.amount,
        platformFee: order.platformFee,
        processingFee: order.processingFee,
        total: order.totalAmount
      }
    });

  } catch (error: any) {
    console.error("Create payment intent error:", error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

// Confirm payment (webhook simulation)
router.post("/transactions/:transactionId/confirm", requireAuth, async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const { paymentIntentId, status = 'succeeded' } = req.body;

    // Get transaction
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ 
        error: "Transaction already processed" 
      });
    }

    const isSuccessful = status === 'succeeded';
    const newStatus = isSuccessful ? 'completed' : 'failed';

    // Update transaction
    await db
      .update(transactions)
      .set({
        status: newStatus,
        processedAt: new Date(),
        metadata: {
          ...transaction.metadata as any,
          paymentStatus: status,
          processedAt: new Date().toISOString()
        }
      })
      .where(eq(transactions.id, transactionId));

    if (isSuccessful) {
      // Update order status and set funds to escrow
      await db
        .update(orders)
        .set({
          status: 'accepted',
          escrowStatus: 'held',
          acceptedAt: new Date()
        })
        .where(eq(orders.id, transaction.orderId));

      // In a real system, this would trigger notifications to both parties
      console.log(`Payment confirmed for order ${transaction.orderId} - Funds held in escrow`);
    } else {
      // Payment failed - reset order
      await db
        .update(orders)
        .set({
          status: 'pending'
        })
        .where(eq(orders.id, transaction.orderId));
    }

    res.json({
      message: isSuccessful ? "Payment confirmed successfully" : "Payment failed",
      transaction: {
        id: transactionId,
        status: newStatus,
        orderId: transaction.orderId
      }
    });

  } catch (error: any) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ error: "Failed to confirm payment" });
  }
});

// Release escrow funds (when work is delivered and approved)
router.post("/orders/:orderId/release-escrow", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { orderId } = req.params;
    const { releaseAmount, reason = 'work_completed' } = req.body;

    // Get order details
    const [order] = await db
      .select({
        id: orders.id,
        clientId: orders.clientId,
        freelancerId: orders.freelancerId,
        freelancerAmount: orders.freelancerAmount,
        escrowStatus: orders.escrowStatus,
        status: orders.status
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Verify user is the client
    if (order.clientId !== userId) {
      return res.status(403).json({ error: "Only the client can release escrow funds" });
    }

    // Check escrow status
    if (order.escrowStatus !== 'held') {
      return res.status(400).json({ 
        error: "Escrow funds are not currently held" 
      });
    }

    // Validate release amount
    const maxReleaseAmount = Number(order.freelancerAmount);
    const actualReleaseAmount = releaseAmount ? Number(releaseAmount) : maxReleaseAmount;

    if (actualReleaseAmount > maxReleaseAmount) {
      return res.status(400).json({ 
        error: "Release amount cannot exceed freelancer amount" 
      });
    }

    // Create release transaction
    const [releaseTransaction] = await db
      .insert(transactions)
      .values({
        orderId,
        type: 'release',
        status: 'completed',
        amount: actualReleaseAmount.toString(),
        currency: 'BRL',
        transactionId: `rel_${crypto.randomBytes(12).toString('hex')}`,
        processedAt: new Date(),
        metadata: {
          reason,
          releaseType: actualReleaseAmount === maxReleaseAmount ? 'full' : 'partial',
          releasedBy: userId,
          releasedAt: new Date().toISOString()
        }
      })
      .returning();

    // Update order escrow status
    const isFullRelease = actualReleaseAmount === maxReleaseAmount;
    const newEscrowStatus = isFullRelease ? 'released' : 'partially_released';
    const newOrderStatus = isFullRelease ? 'completed' : order.status;

    await db
      .update(orders)
      .set({
        escrowStatus: newEscrowStatus,
        status: newOrderStatus,
        ...(isFullRelease && { completedAt: new Date() })
      })
      .where(eq(orders.id, orderId));

    res.json({
      message: "Escrow funds released successfully",
      release: {
        transactionId: releaseTransaction.id,
        amount: actualReleaseAmount,
        type: isFullRelease ? 'full' : 'partial',
        newEscrowStatus
      }
    });

  } catch (error: any) {
    console.error("Release escrow error:", error);
    res.status(500).json({ error: "Failed to release escrow funds" });
  }
});

// Request refund (if work not delivered or unsatisfactory)
router.post("/orders/:orderId/request-refund", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { orderId } = req.params;
    const { amount, reason, evidence = [] } = req.body;

    // Get order details
    const [order] = await db
      .select({
        id: orders.id,
        clientId: orders.clientId,
        freelancerId: orders.freelancerId,
        totalAmount: orders.totalAmount,
        escrowStatus: orders.escrowStatus,
        status: orders.status
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Verify user is the client
    if (order.clientId !== userId) {
      return res.status(403).json({ error: "Only the client can request refunds" });
    }

    // Check if refund is possible
    if (order.escrowStatus !== 'held') {
      return res.status(400).json({ 
        error: "Refund not possible - funds not in escrow" 
      });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: "Refund reason is required" });
    }

    // Validate refund amount
    const maxRefundAmount = Number(order.totalAmount);
    const refundAmount = amount ? Number(amount) : maxRefundAmount;

    if (refundAmount > maxRefundAmount) {
      return res.status(400).json({ 
        error: "Refund amount cannot exceed total paid amount" 
      });
    }

    // Create refund transaction (pending admin approval)
    const [refundTransaction] = await db
      .insert(transactions)
      .values({
        orderId,
        type: 'refund',
        status: 'pending',
        amount: refundAmount.toString(),
        currency: 'BRL',
        transactionId: `ref_${crypto.randomBytes(12).toString('hex')}`,
        metadata: {
          reason,
          evidence,
          requestedBy: userId,
          requestedAt: new Date().toISOString(),
          requiresApproval: true
        }
      })
      .returning();

    // Update order status to disputed
    await db
      .update(orders)
      .set({
        status: 'disputed',
        disputeReason: reason
      })
      .where(eq(orders.id, orderId));

    res.json({
      message: "Refund request submitted successfully",
      refund: {
        transactionId: refundTransaction.id,
        amount: refundAmount,
        status: 'pending_approval',
        reason
      }
    });

  } catch (error: any) {
    console.error("Request refund error:", error);
    res.status(500).json({ error: "Failed to request refund" });
  }
});

// Get payment history for user
router.get("/transactions", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { 
      type, // 'payment', 'release', 'refund'
      status, // 'pending', 'completed', 'failed'
      page = 1, 
      limit = 20 
    } = req.query;

    // Build query to get user's transactions
    let transactionQuery = db
      .select({
        id: transactions.id,
        type: transactions.type,
        status: transactions.status,
        amount: transactions.amount,
        currency: transactions.currency,
        paymentMethod: transactions.paymentMethod,
        transactionId: transactions.transactionId,
        processedAt: transactions.processedAt,
        createdAt: transactions.createdAt,
        metadata: transactions.metadata,
        
        // Order info
        orderId: orders.id,
        orderNumber: orders.orderNumber,
        orderStatus: orders.status,
        
        // Service info
        serviceTitle: servicePackages.title,
        
        // Other party info (client or freelancer)
        otherPartyName: sql`CASE 
          WHEN ${orders.clientId} = ${userId} THEN CONCAT(freelancer_user.first_name, ' ', freelancer_user.last_name)
          ELSE CONCAT(client_user.first_name, ' ', client_user.last_name)
        END`,
        userRole: sql`CASE 
          WHEN ${orders.clientId} = ${userId} THEN 'client'
          ELSE 'freelancer'
        END`
      })
      .from(transactions)
      .leftJoin(orders, eq(transactions.orderId, orders.id))
      .leftJoin(servicePackages, eq(orders.servicePackageId, servicePackages.id))
      .leftJoin(
        sql`${users} as client_user`,
        eq(orders.clientId, sql`client_user.id`)
      )
      .leftJoin(freelancerProfiles, eq(orders.freelancerId, freelancerProfiles.id))
      .leftJoin(
        sql`${users} as freelancer_user`,
        eq(freelancerProfiles.userId, sql`freelancer_user.id`)
      )
      .where(
        sql`${orders.clientId} = ${userId} OR ${freelancerProfiles.userId} = ${userId}`
      );

    // Apply filters
    const conditions = [];
    
    if (type) {
      conditions.push(eq(transactions.type, type as string));
    }
    
    if (status) {
      conditions.push(eq(transactions.status, status as string));
    }

    if (conditions.length > 0) {
      transactionQuery = transactionQuery.where(and(...conditions));
    }

    // Order by most recent first
    transactionQuery = transactionQuery.orderBy(desc(transactions.createdAt));

    const allTransactions = await transactionQuery;

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    const paginatedTransactions = allTransactions.slice(offset, offset + Number(limit));

    // Calculate summary statistics
    const summary = {
      totalTransactions: allTransactions.length,
      totalPaid: allTransactions
        .filter(t => t.type === 'payment' && t.status === 'completed' && t.userRole === 'client')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      totalEarned: allTransactions
        .filter(t => t.type === 'release' && t.status === 'completed' && t.userRole === 'freelancer')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      pendingEscrow: allTransactions
        .filter(t => t.type === 'payment' && t.status === 'completed' && t.userRole === 'freelancer')
        .reduce((sum, t) => sum + Number(t.amount), 0) -
        allTransactions
        .filter(t => t.type === 'release' && t.status === 'completed' && t.userRole === 'freelancer')
        .reduce((sum, t) => sum + Number(t.amount), 0)
    };

    res.json({
      transactions: paginatedTransactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: allTransactions.length,
        totalPages: Math.ceil(allTransactions.length / Number(limit))
      },
      summary,
      filters: { type, status }
    });

  } catch (error: any) {
    console.error("Get transactions error:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Get escrow balance for freelancer
router.get("/escrow/balance", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get freelancer profile
    const [freelancerProfile] = await db
      .select({ id: freelancerProfiles.id })
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.userId, userId))
      .limit(1);

    if (!freelancerProfile) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }

    // Get orders with funds in escrow
    const escrowOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        freelancerAmount: orders.freelancerAmount,
        escrowStatus: orders.escrowStatus,
        acceptedAt: orders.acceptedAt,
        serviceTitle: servicePackages.title,
        clientName: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`
      })
      .from(orders)
      .leftJoin(servicePackages, eq(orders.servicePackageId, servicePackages.id))
      .leftJoin(users, eq(orders.clientId, users.id))
      .where(
        and(
          eq(orders.freelancerId, freelancerProfile.id),
          sql`${orders.escrowStatus} IN ('held', 'partially_released')`
        )
      )
      .orderBy(desc(orders.acceptedAt));

    // Calculate total escrow balance
    const totalEscrowBalance = escrowOrders.reduce(
      (sum, order) => sum + Number(order.freelancerAmount), 
      0
    );

    res.json({
      escrowBalance: {
        total: totalEscrowBalance,
        currency: 'BRL',
        ordersCount: escrowOrders.length
      },
      escrowOrders,
      lastUpdated: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Get escrow balance error:", error);
    res.status(500).json({ error: "Failed to fetch escrow balance" });
  }
});

// Admin: Process refund (approve/reject)
router.patch("/admin/refunds/:transactionId", requireAuth, async (req: Request, res: Response) => {
  try {
    // TODO: Add admin role check
    const { transactionId } = req.params;
    const { action, adminNotes } = req.body; // 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    // Get refund transaction
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.type, 'refund'),
          eq(transactions.status, 'pending')
        )
      )
      .limit(1);

    if (!transaction) {
      return res.status(404).json({ error: "Pending refund transaction not found" });
    }

    const isApproved = action === 'approve';
    const newStatus = isApproved ? 'completed' : 'failed';

    // Update transaction
    await db
      .update(transactions)
      .set({
        status: newStatus,
        processedAt: new Date(),
        metadata: {
          ...transaction.metadata as any,
          adminAction: action,
          adminNotes,
          adminProcessedAt: new Date().toISOString()
        }
      })
      .where(eq(transactions.id, transactionId));

    // Update order status
    if (isApproved) {
      await db
        .update(orders)
        .set({
          escrowStatus: 'refunded',
          status: 'cancelled',
          disputeResolution: `Refund approved: ${adminNotes || 'No additional notes'}`
        })
        .where(eq(orders.id, transaction.orderId));
    } else {
      await db
        .update(orders)
        .set({
          status: 'in_progress', // Return to normal state
          disputeResolution: `Refund rejected: ${adminNotes || 'No additional notes'}`
        })
        .where(eq(orders.id, transaction.orderId));
    }

    res.json({
      message: `Refund ${action}d successfully`,
      transaction: {
        id: transactionId,
        status: newStatus,
        action
      }
    });

  } catch (error: any) {
    console.error("Process refund error:", error);
    res.status(500).json({ error: "Failed to process refund" });
  }
});

export { router as paymentsRouter };