import express from "express";
import { Request, Response } from "express";
import { db } from "../db/index.js";
import { documents, users, freelancerProfiles } from "../db/schema.js";
import { eq, and, asc, desc, like, or, sql } from 'drizzle-orm';
import { requireAuth } from "./auth.js";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
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
    const filename = `${userId}_${timestamp}_${randomString}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
    }
  }
});

// Upload document
router.post("/upload", requireAuth, upload.single('document'), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { type, description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!type) {
      return res.status(400).json({ error: "Document type is required" });
    }

    const validTypes = ['identity', 'address_proof', 'certificate', 'selfie', 'business_license', 'tax_document'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid document type" });
    }

    // Check if user already has this type of document pending/verified
    const existingDoc = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          eq(documents.type, type),
          eq(documents.status, 'pending')
        )
      )
      .limit(1);

    if (existingDoc.length > 0) {
      // Delete the uploaded file since we're rejecting it
      await fs.unlink(req.file.path);
      return res.status(400).json({ 
        error: "You already have a pending document of this type" 
      });
    }

    const fileUrl = `/uploads/documents/${req.file.filename}`;
    
    // Calculate expiry date (typically 5 years for identity documents)
    const expiresAt = type === 'identity' ? new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000) : null;

    const [document] = await db
      .insert(documents)
      .values({
        userId,
        type,
        fileName: req.file.originalname,
        fileUrl,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        status: 'pending',
        expiresAt,
        metadata: {
          description,
          uploadedAt: new Date().toISOString(),
          originalName: req.file.originalname
        }
      })
      .returning();

    res.json({
      message: "Document uploaded successfully",
      document: {
        id: document.id,
        type: document.type,
        fileName: document.fileName,
        status: document.status,
        createdAt: document.createdAt
      }
    });

  } catch (error: any) {
    console.error("Document upload error:", error);
    
    // Clean up uploaded file if database insert fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error("Failed to clean up uploaded file:", unlinkError);
      }
    }

    res.status(500).json({ 
      error: error.message || "Failed to upload document" 
    });
  }
});

// Get user's documents
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const userDocuments = await db
      .select({
        id: documents.id,
        type: documents.type,
        fileName: documents.fileName,
        fileUrl: documents.fileUrl,
        status: documents.status,
        verifiedAt: documents.verifiedAt,
        rejectionReason: documents.rejectionReason,
        expiresAt: documents.expiresAt,
        createdAt: documents.createdAt,
        metadata: documents.metadata
      })
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt));

    res.json({ documents: userDocuments });

  } catch (error: any) {
    console.error("Get documents error:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// Get KYC verification status
router.get("/kyc-status", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Get all user documents
    const userDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId));

    // Check verification requirements
    const requiredDocs = ['identity', 'address_proof', 'selfie'];
    const verifiedDocs = userDocuments.filter(doc => doc.status === 'verified');
    const pendingDocs = userDocuments.filter(doc => doc.status === 'pending');
    const rejectedDocs = userDocuments.filter(doc => doc.status === 'rejected');

    const verificationStatus = {
      isFullyVerified: requiredDocs.every(type => 
        verifiedDocs.some(doc => doc.type === type)
      ),
      verificationLevel: 0,
      completedRequirements: verifiedDocs.map(doc => doc.type),
      pendingRequirements: pendingDocs.map(doc => doc.type),
      missingRequirements: requiredDocs.filter(type => 
        !userDocuments.some(doc => doc.type === type && doc.status !== 'rejected')
      ),
      rejectedDocuments: rejectedDocs.map(doc => ({
        type: doc.type,
        reason: doc.rejectionReason,
        rejectedAt: doc.createdAt
      }))
    };

    // Calculate verification level
    if (verificationStatus.completedRequirements.length === 0) {
      verificationStatus.verificationLevel = 0; // No verification
    } else if (verificationStatus.completedRequirements.includes('identity')) {
      verificationStatus.verificationLevel = 1; // Basic verification
    }
    
    if (verificationStatus.isFullyVerified) {
      verificationStatus.verificationLevel = 2; // Full KYC
    }

    // Update freelancer profile verification level
    if (verificationStatus.verificationLevel > 0) {
      await db
        .update(freelancerProfiles)
        .set({
          verificationLevel: verificationStatus.verificationLevel,
          isVerified: verificationStatus.isFullyVerified
        })
        .where(eq(freelancerProfiles.userId, userId));
    }

    res.json({ kycStatus: verificationStatus });

  } catch (error: any) {
    console.error("KYC status error:", error);
    res.status(500).json({ error: "Failed to fetch KYC status" });
  }
});

// Delete document (only if pending or rejected)
router.delete("/:documentId", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { documentId } = req.params;

    // Find the document
    const [document] = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.id, documentId),
          eq(documents.userId, userId)
        )
      )
      .limit(1);

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    if (document.status === 'verified') {
      return res.status(400).json({ 
        error: "Cannot delete verified documents" 
      });
    }

    // Delete the file from filesystem
    try {
      const filePath = path.join(process.cwd(), document.fileUrl);
      await fs.unlink(filePath);
    } catch (fileError) {
      console.warn("Failed to delete document file:", fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await db
      .delete(documents)
      .where(eq(documents.id, documentId));

    res.json({ message: "Document deleted successfully" });

  } catch (error: any) {
    console.error("Delete document error:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

// Admin routes for document verification
router.get("/admin/pending", requireAuth, async (req: Request, res: Response) => {
  try {
    // TODO: Add admin role check
    const pendingDocuments = await db
      .select({
        id: documents.id,
        userId: documents.userId,
        type: documents.type,
        fileName: documents.fileName,
        fileUrl: documents.fileUrl,
        fileSize: documents.fileSize,
        mimeType: documents.mimeType,
        status: documents.status,
        createdAt: documents.createdAt,
        metadata: documents.metadata,
        userEmail: users.email,
        userFirstName: users.firstName,
        userLastName: users.lastName
      })
      .from(documents)
      .leftJoin(users, eq(documents.userId, users.id))
      .where(eq(documents.status, 'pending'))
      .orderBy(desc(documents.createdAt));

    res.json({ documents: pendingDocuments });

  } catch (error: any) {
    console.error("Get pending documents error:", error);
    res.status(500).json({ error: "Failed to fetch pending documents" });
  }
});

// Verify document (admin only)
router.patch("/admin/:documentId/verify", requireAuth, async (req: Request, res: Response) => {
  try {
    // TODO: Add admin role check
    const { documentId } = req.params;
    const { action, reason } = req.body; // action: 'approve' | 'reject'
    const adminId = req.user!.id;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    if (action === 'reject' && !reason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    const updateData: any = {
      verifiedBy: adminId
    };

    if (action === 'approve') {
      updateData.status = 'verified';
      updateData.verifiedAt = new Date();
    } else {
      updateData.status = 'rejected';
      updateData.rejectionReason = reason;
    }

    const [updatedDocument] = await db
      .update(documents)
      .set(updateData)
      .where(eq(documents.id, documentId))
      .returning();

    if (!updatedDocument) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Update user verification status
    if (action === 'approve') {
      // Trigger KYC status recalculation
      const userDocuments = await db
        .select()
        .from(documents)
        .where(eq(documents.userId, updatedDocument.userId));

      const requiredDocs = ['identity', 'address_proof', 'selfie'];
      const verifiedDocs = userDocuments.filter(doc => doc.status === 'verified');
      
      const isFullyVerified = requiredDocs.every(type => 
        verifiedDocs.some(doc => doc.type === type)
      );

      let verificationLevel = 0;
      if (verifiedDocs.some(doc => doc.type === 'identity')) {
        verificationLevel = 1;
      }
      if (isFullyVerified) {
        verificationLevel = 2;
      }

      await db
        .update(freelancerProfiles)
        .set({
          verificationLevel,
          isVerified: isFullyVerified
        })
        .where(eq(freelancerProfiles.userId, updatedDocument.userId));
    }

    res.json({
      message: `Document ${action}d successfully`,
      document: {
        id: updatedDocument.id,
        status: updatedDocument.status,
        verifiedAt: updatedDocument.verifiedAt,
        rejectionReason: updatedDocument.rejectionReason
      }
    });

  } catch (error: any) {
    console.error("Document verification error:", error);
    res.status(500).json({ error: "Failed to verify document" });
  }
});

export { router as documentsRouter };