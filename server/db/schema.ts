import {
  sqliteTable,
  text,
  integer,
  real,
  blob,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  cpfCnpj: varchar("cpf_cnpj", { length: 20 }).unique(),
  phone: varchar("phone", { length: 20 }),
  phoneVerified: boolean("phone_verified").default(false),
  profileImageUrl: text("profile_image_url"),
  userType: varchar("user_type", { length: 20 }).notNull().default("client"), // 'client', 'freelancer', 'admin'
  isActive: boolean("is_active").default(true),
  emailVerified: boolean("email_verified").default(false),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: varchar("two_factor_secret", { length: 255 }),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents table for KYC verification
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'identity', 'address_proof', 'certificate', 'selfie'
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  status: varchar("status", { length: 20 }).default("pending"), // 'pending', 'verified', 'rejected'
  verifiedAt: timestamp("verified_at"),
  verifiedBy: uuid("verified_by").references(() => users.id),
  rejectionReason: text("rejection_reason"),
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata"), // OCR data, verification details
  createdAt: timestamp("created_at").defaultNow(),
});

// Freelancer profiles
export const freelancerProfiles = pgTable("freelancer_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  bio: text("bio"),
  companyName: varchar("company_name", { length: 200 }),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  skills: text("skills").array(),
  portfolio: jsonb("portfolio"),
  experience: integer("experience"), // years
  availability: varchar("availability", { length: 50 }), // 'full-time', 'part-time', 'contract', 'unavailable'
  availabilityHours: jsonb("availability_hours"), // { monday: { start: "09:00", end: "18:00" }, ... }
  location: varchar("location", { length: 100 }),
  coverageAreas: jsonb("coverage_areas"), // { type: 'radius', center: {lat, lng}, radius: 10, areas: ['CEP1', 'CEP2'] }
  languages: text("languages").array(),
  certifications: jsonb("certifications"), // [{name, issuer, date, verified}]
  completedProjects: integer("completed_projects").default(0),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).default("0"),
  responseTime: varchar("response_time", { length: 50 }),
  averageRating: decimal("average_rating", { precision: 2, scale: 1 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  isVerified: boolean("is_verified").default(false),
  verificationLevel: integer("verification_level").default(0), // 0-basic, 1-documents, 2-full KYC
  isPro: boolean("is_pro").default(false),
  profileViews: integer("profile_views").default(0),
  lastActive: timestamp("last_active").defaultNow(),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }),
  instagramHandle: varchar("instagram_handle", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service categories with hierarchy
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  parentId: uuid("parent_id").references(() => categories.id),
  level: integer("level").default(0), // 0-root, 1-category, 2-subcategory
  path: text("path"), // /root/category/subcategory
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"), // SEO, keywords, etc
  createdAt: timestamp("created_at").defaultNow(),
});

// Service packages - Enhanced for marketplace
export const servicePackages = pgTable("service_packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  freelancerId: uuid("freelancer_id").references(() => freelancerProfiles.id).notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).unique().notNull(),
  description: text("description").notNull(),
  shortDescription: varchar("short_description", { length: 500 }),
  priceType: varchar("price_type", { length: 20 }).notNull(), // 'fixed', 'hourly', 'daily', 'per_m2', 'per_unit'
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  priceUnit: varchar("price_unit", { length: 50 }), // 'hour', 'day', 'm2', 'unit', etc
  minimumBudget: decimal("minimum_budget", { precision: 10, scale: 2 }),
  deliveryTime: integer("delivery_time").notNull(), // hours
  deliveryTimeUnit: varchar("delivery_time_unit", { length: 20 }).default("days"), // 'hours', 'days', 'weeks'
  sla: integer("sla_hours"), // Service Level Agreement in hours
  revisions: integer("revisions").default(0),
  features: text("features").array(),
  requirements: text("requirements").array(),
  extras: jsonb("extras"), // [{title, description, price, deliveryTime}]
  policies: jsonb("policies"), // {cancellation, refund, guarantee}
  faqs: jsonb("faqs"), // [{question, answer}]
  images: text("images").array(),
  videoUrl: text("video_url"),
  documentsUrl: text("documents_url").array(), // PDFs, specifications
  tags: text("tags").array(),
  keywords: text("keywords").array(), // For SEO
  serviceAreas: jsonb("service_areas"), // Specific areas for this service
  orderCount: integer("order_count").default(0),
  viewCount: integer("view_count").default(0),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }).default("0"),
  status: varchar("status", { length: 20 }).default("draft"), // 'draft', 'active', 'paused', 'archived'
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  featuredUntil: timestamp("featured_until"),
  moderationStatus: varchar("moderation_status", { length: 20 }).default("pending"), // 'pending', 'approved', 'rejected'
  moderationNotes: text("moderation_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service package tiers (Basic, Standard, Premium)
export const packageTiers = pgTable("package_tiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  packageId: uuid("package_id").references(() => servicePackages.id).notNull(),
  name: varchar("name", { length: 50 }).notNull(), // 'basic', 'standard', 'premium'
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  deliveryTime: integer("delivery_time").notNull(),
  revisions: integer("revisions").default(0),
  features: jsonb("features"), // {feature: boolean}
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Custom projects (Upwork-style)
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => users.id).notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).unique().notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  budgetType: varchar("budget_type", { length: 20 }), // 'fixed', 'hourly'
  duration: varchar("duration", { length: 50 }), // 'less-than-week', '1-4-weeks', '1-3-months', etc.
  experienceLevel: varchar("experience_level", { length: 50 }), // 'entry', 'intermediate', 'expert'
  deadline: timestamp("deadline"),
  skillsRequired: text("skills_required").array(),
  attachments: text("attachments").array(),
  visibility: varchar("visibility", { length: 20 }).default("public"), // 'public', 'private', 'invite-only'
  status: varchar("status", { length: 20 }).default("open"), // 'draft', 'open', 'in_progress', 'completed', 'cancelled'
  proposalCount: integer("proposal_count").default(0),
  viewCount: integer("view_count").default(0),
  selectedFreelancerId: uuid("selected_freelancer_id").references(() => freelancerProfiles.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project proposals
export const proposals = pgTable("proposals", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  freelancerId: uuid("freelancer_id").references(() => freelancerProfiles.id).notNull(),
  coverLetter: text("cover_letter").notNull(),
  proposedPrice: decimal("proposed_price", { precision: 10, scale: 2 }).notNull(),
  proposedDuration: integer("proposed_duration").notNull(), // days
  attachments: text("attachments").array(),
  milestones: jsonb("milestones"), // [{title, description, amount, duration}]
  status: varchar("status", { length: 20 }).default("pending"), // 'pending', 'accepted', 'rejected', 'withdrawn'
  clientViewed: boolean("client_viewed").default(false),
  clientViewedAt: timestamp("client_viewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders/Contracts - Enhanced with escrow
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: varchar("order_number", { length: 20 }).unique().notNull(),
  clientId: uuid("client_id").references(() => users.id).notNull(),
  freelancerId: uuid("freelancer_id").references(() => freelancerProfiles.id).notNull(),
  servicePackageId: uuid("service_package_id").references(() => servicePackages.id),
  packageTierId: uuid("package_tier_id").references(() => packageTiers.id),
  projectId: uuid("project_id").references(() => projects.id),
  proposalId: uuid("proposal_id").references(() => proposals.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  requirements: text("requirements"),
  customRequirements: jsonb("custom_requirements"), // Client specific requirements
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(), // Our commission
  processingFee: decimal("processing_fee", { precision: 10, scale: 2 }).default("0"), // Payment processor fee
  freelancerAmount: decimal("freelancer_amount", { precision: 10, scale: 2 }).notNull(), // What freelancer receives
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(), // What client pays
  escrowStatus: varchar("escrow_status", { length: 20 }).default("pending"), // 'pending', 'held', 'released', 'refunded'
  escrowReleaseDate: timestamp("escrow_release_date"),
  status: varchar("status", { length: 20 }).default("pending"), 
  // 'pending', 'accepted', 'in_progress', 'submitted', 'revision_requested', 'delivered', 'completed', 'cancelled', 'disputed'
  deliveryDate: timestamp("delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  acceptedAt: timestamp("accepted_at"),
  completedAt: timestamp("completed_at"),
  cancellationReason: text("cancellation_reason"),
  cancellationFee: decimal("cancellation_fee", { precision: 10, scale: 2 }),
  disputeReason: text("dispute_reason"),
  disputeResolution: text("dispute_resolution"),
  metadata: jsonb("metadata"), // Additional order data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order deliveries
export const deliveries = pgTable("deliveries", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  message: text("message").notNull(),
  attachments: text("attachments").array(),
  isRevision: boolean("is_revision").default(false),
  revisionNumber: integer("revision_number").default(0),
  status: varchar("status", { length: 20 }).default("pending"), // 'pending', 'accepted', 'rejected'
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").notNull(),
  orderId: uuid("order_id").references(() => orders.id),
  senderId: uuid("sender_id").references(() => users.id).notNull(),
  receiverId: uuid("receiver_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  attachments: text("attachments").array(),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Conversations
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  participant1Id: uuid("participant1_id").references(() => users.id).notNull(),
  participant2Id: uuid("participant2_id").references(() => users.id).notNull(),
  lastMessageId: uuid("last_message_id").references(() => messages.id),
  lastMessageAt: timestamp("last_message_at"),
  unreadCount1: integer("unread_count1").default(0),
  unreadCount2: integer("unread_count2").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews - Enhanced with detailed ratings
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id).notNull().unique(),
  serviceId: uuid("service_id").references(() => servicePackages.id),
  reviewerId: uuid("reviewer_id").references(() => users.id).notNull(),
  revieweeId: uuid("reviewee_id").references(() => users.id).notNull(),
  reviewerType: varchar("reviewer_type", { length: 20 }).notNull(), // 'client' or 'freelancer'
  rating: integer("rating").notNull(), // 1-5
  title: varchar("title", { length: 200 }),
  comment: text("comment"),
  pros: text("pros").array(), // Positive points
  cons: text("cons").array(), // Negative points
  communicationRating: integer("communication_rating"), // 1-5
  qualityRating: integer("quality_rating"), // 1-5
  deliveryRating: integer("delivery_rating"), // 1-5
  professionalismRating: integer("professionalism_rating"), // 1-5
  valueRating: integer("value_rating"), // 1-5 (value for money)
  wouldRecommend: boolean("would_recommend").default(true),
  wouldHireAgain: boolean("would_hire_again").default(true),
  projectBudget: varchar("project_budget", { length: 50 }), // Budget range
  projectDuration: varchar("project_duration", { length: 50 }), // Duration range
  verifiedPurchase: boolean("verified_purchase").default(true),
  helpfulCount: integer("helpful_count").default(0),
  notHelpfulCount: integer("not_helpful_count").default(0),
  isPublic: boolean("is_public").default(true),
  isFeatured: boolean("is_featured").default(false),
  reply: text("reply"), // Freelancer's response
  repliedAt: timestamp("replied_at"),
  images: text("images").array(), // Review images
  moderationStatus: varchar("moderation_status", { length: 20 }).default("approved"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Saved items (favorites)
export const savedItems = pgTable("saved_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  itemType: varchar("item_type", { length: 20 }).notNull(), // 'service', 'freelancer', 'project'
  itemId: uuid("item_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.itemType, table.itemId] }),
}));

// Notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message"),
  data: jsonb("data"),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions (for payment tracking)
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'payment', 'refund', 'withdrawal'
  status: varchar("status", { length: 20 }).notNull(), // 'pending', 'processing', 'completed', 'failed'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  transactionId: varchar("transaction_id", { length: 100 }),
  metadata: jsonb("metadata"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service Q&A
export const serviceQuestions = pgTable("service_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceId: uuid("service_id").references(() => servicePackages.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  question: text("question").notNull(),
  answer: text("answer"),
  answeredBy: uuid("answered_by").references(() => users.id),
  answeredAt: timestamp("answered_at"),
  isPublic: boolean("is_public").default(true),
  upvotes: integer("upvotes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service ads/promotion
export const serviceAds = pgTable("service_ads", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceId: uuid("service_id").references(() => servicePackages.id).notNull(),
  freelancerId: uuid("freelancer_id").references(() => freelancerProfiles.id).notNull(),
  campaignName: varchar("campaign_name", { length: 200 }),
  budgetTotal: decimal("budget_total", { precision: 10, scale: 2 }).notNull(),
  budgetDaily: decimal("budget_daily", { precision: 10, scale: 2 }),
  budgetSpent: decimal("budget_spent", { precision: 10, scale: 2 }).default("0"),
  cpcMax: decimal("cpc_max", { precision: 10, scale: 2 }), // Cost per click
  targetCategories: uuid("target_categories").array(),
  targetKeywords: text("target_keywords").array(),
  targetLocations: jsonb("target_locations"),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  status: varchar("status", { length: 20 }).default("draft"), // 'draft', 'active', 'paused', 'completed'
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  plan: varchar("plan", { length: 20 }).notNull().default("free"), // 'free', 'professional', 'business', 'elite'
  status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'cancelled', 'expired', 'trial'
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  trialEndsAt: timestamp("trial_ends_at"),
  billingCycle: varchar("billing_cycle", { length: 20 }).default("monthly"), // 'monthly', 'annual'
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  features: jsonb("features"), // Custom features/limits for this subscription
  metadata: jsonb("metadata"), // Payment method info, etc
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Plan features and limits
export const planFeatures = pgTable("plan_features", {
  id: uuid("id").primaryKey().defaultRandom(),
  plan: varchar("plan", { length: 20 }).notNull().unique(), // 'free', 'professional', 'business', 'elite'
  maxServices: integer("max_services").notNull(), // Max active services
  maxProposals: integer("max_proposals").notNull(), // Monthly proposal limit
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(), // Platform commission %
  maxProjectValue: decimal("max_project_value", { precision: 10, scale: 2 }), // Max project value limit
  features: jsonb("features").notNull(), // Feature flags
  priority: integer("priority").notNull().default(0), // Search ranking priority
  badge: varchar("badge", { length: 50 }), // Badge name/icon
  badgeColor: varchar("badge_color", { length: 20 }), // Badge color
  createdAt: timestamp("created_at").defaultNow(),
});

// User feature usage tracking
export const featureUsage = pgTable("feature_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  feature: varchar("feature", { length: 50 }).notNull(), // 'proposals', 'services', 'social_posts', etc
  period: varchar("period", { length: 7 }).notNull(), // 'YYYY-MM' for monthly tracking
  used: integer("used").notNull().default(0),
  limit: integer("limit").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.feature, table.period] }),
}));

// Add-on purchases
export const addOns = pgTable("add_ons", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'social_media', 'extra_proposals', 'highlight', etc
  status: varchar("status", { length: 20 }).notNull().default("active"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  configuration: jsonb("configuration"), // Add-on specific config
  createdAt: timestamp("created_at").defaultNow(),
});

// Skills table (for skill management)
export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).unique().notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  isVerified: boolean("is_verified").default(false),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pricing suggestions (AI-powered)
export const pricingSuggestions = pgTable("pricing_suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").references(() => categories.id),
  serviceType: varchar("service_type", { length: 100 }),
  location: varchar("location", { length: 100 }),
  experienceLevel: varchar("experience_level", { length: 50 }),
  avgPrice: decimal("avg_price", { precision: 10, scale: 2 }),
  minPrice: decimal("min_price", { precision: 10, scale: 2 }),
  maxPrice: decimal("max_price", { precision: 10, scale: 2 }),
  priceFactors: jsonb("price_factors"), // Factors affecting price
  sampleSize: integer("sample_size"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Create indexes for better performance
export const usersEmailIdx = index("users_email_idx").on(users.email);
export const usersCpfCnpjIdx = index("users_cpf_cnpj_idx").on(users.cpfCnpj);
export const freelancerUserIdx = index("freelancer_user_idx").on(freelancerProfiles.userId);
export const freelancerLocationIdx = index("freelancer_location_idx").on(freelancerProfiles.location);
export const projectsStatusIdx = index("projects_status_idx").on(projects.status);
export const projectsCategoryIdx = index("projects_category_idx").on(projects.categoryId);
export const servicesFreelancerIdx = index("services_freelancer_idx").on(servicePackages.freelancerId);
export const servicesCategoryIdx = index("services_category_idx").on(servicePackages.categoryId);
export const servicesStatusIdx = index("services_status_idx").on(servicePackages.status);
export const ordersStatusIdx = index("orders_status_idx").on(orders.status);
export const ordersEscrowIdx = index("orders_escrow_idx").on(orders.escrowStatus);
export const messagesConversationIdx = index("messages_conversation_idx").on(messages.conversationId);
export const reviewsServiceIdx = index("reviews_service_idx").on(reviews.serviceId);
export const reviewsRevieweeIdx = index("reviews_reviewee_idx").on(reviews.revieweeId);
export const documentsUserIdx = index("documents_user_idx").on(documents.userId);
export const documentsStatusIdx = index("documents_status_idx").on(documents.status);
export const serviceQuestionsServiceIdx = index("service_questions_service_idx").on(serviceQuestions.serviceId);
export const serviceAdsFreelancerIdx = index("service_ads_freelancer_idx").on(serviceAds.freelancerId);
export const serviceAdsStatusIdx = index("service_ads_status_idx").on(serviceAds.status);
export const categoriesParentIdx = index("categories_parent_idx").on(categories.parentId);
export const categoriesSlugIdx = index("categories_slug_idx").on(categories.slug);
export const skillsCategoryIdx = index("skills_category_idx").on(skills.categoryId);
export const pricingSuggestionsLocationIdx = index("pricing_suggestions_location_idx").on(pricingSuggestions.location, pricingSuggestions.categoryId);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  freelancerProfile: one(freelancerProfiles, {
    fields: [users.id],
    references: [freelancerProfiles.userId],
  }),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
  documents: many(documents),
  clientOrders: many(orders),
  freelancerOrders: many(orders),
  projects: many(projects),
  proposals: many(proposals),
  sentMessages: many(messages),
  receivedMessages: many(messages),
  reviews: many(reviews),
  notifications: many(notifications),
  savedItems: many(savedItems),
  serviceQuestions: many(serviceQuestions),
  featureUsage: many(featureUsage),
  addOns: many(addOns),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  verifiedBy: one(users, {
    fields: [documents.verifiedBy],
    references: [users.id],
  }),
}));

export const freelancerProfilesRelations = relations(freelancerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [freelancerProfiles.userId],
    references: [users.id],
  }),
  servicePackages: many(servicePackages),
  proposals: many(proposals),
  orders: many(orders),
  serviceAds: many(serviceAds),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  servicePackages: many(servicePackages),
  projects: many(projects),
  skills: many(skills),
}));

export const servicePackagesRelations = relations(servicePackages, ({ one, many }) => ({
  freelancer: one(freelancerProfiles, {
    fields: [servicePackages.freelancerId],
    references: [freelancerProfiles.id],
  }),
  category: one(categories, {
    fields: [servicePackages.categoryId],
    references: [categories.id],
  }),
  tiers: many(packageTiers),
  orders: many(orders),
  questions: many(serviceQuestions),
  ads: many(serviceAds),
  reviews: many(reviews),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(users, {
    fields: [projects.clientId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [projects.categoryId],
    references: [categories.id],
  }),
  selectedFreelancer: one(freelancerProfiles, {
    fields: [projects.selectedFreelancerId],
    references: [freelancerProfiles.id],
  }),
  proposals: many(proposals),
  orders: many(orders),
}));

export const proposalsRelations = relations(proposals, ({ one }) => ({
  project: one(projects, {
    fields: [proposals.projectId],
    references: [projects.id],
  }),
  freelancer: one(freelancerProfiles, {
    fields: [proposals.freelancerId],
    references: [freelancerProfiles.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  client: one(users, {
    fields: [orders.clientId],
    references: [users.id],
  }),
  freelancer: one(freelancerProfiles, {
    fields: [orders.freelancerId],
    references: [freelancerProfiles.id],
  }),
  servicePackage: one(servicePackages, {
    fields: [orders.servicePackageId],
    references: [servicePackages.id],
  }),
  packageTier: one(packageTiers, {
    fields: [orders.packageTierId],
    references: [packageTiers.id],
  }),
  project: one(projects, {
    fields: [orders.projectId],
    references: [projects.id],
  }),
  proposal: one(proposals, {
    fields: [orders.proposalId],
    references: [proposals.id],
  }),
  deliveries: many(deliveries),
  transactions: many(transactions),
  reviews: many(reviews),
  messages: many(messages),
}));

export const deliveriesRelations = relations(deliveries, ({ one }) => ({
  order: one(orders, {
    fields: [deliveries.orderId],
    references: [orders.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [messages.orderId],
    references: [orders.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  participant1: one(users, {
    fields: [conversations.participant1Id],
    references: [users.id],
  }),
  participant2: one(users, {
    fields: [conversations.participant2Id],
    references: [users.id],
  }),
  lastMessage: one(messages, {
    fields: [conversations.lastMessageId],
    references: [messages.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
  service: one(servicePackages, {
    fields: [reviews.serviceId],
    references: [servicePackages.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
  reviewee: one(users, {
    fields: [reviews.revieweeId],
    references: [users.id],
  }),
}));

export const savedItemsRelations = relations(savedItems, ({ one }) => ({
  user: one(users, {
    fields: [savedItems.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  order: one(orders, {
    fields: [transactions.orderId],
    references: [orders.id],
  }),
}));

export const serviceQuestionsRelations = relations(serviceQuestions, ({ one }) => ({
  service: one(servicePackages, {
    fields: [serviceQuestions.serviceId],
    references: [servicePackages.id],
  }),
  user: one(users, {
    fields: [serviceQuestions.userId],
    references: [users.id],
  }),
  answeredByUser: one(users, {
    fields: [serviceQuestions.answeredBy],
    references: [users.id],
  }),
}));

export const serviceAdsRelations = relations(serviceAds, ({ one }) => ({
  service: one(servicePackages, {
    fields: [serviceAds.serviceId],
    references: [servicePackages.id],
  }),
  freelancer: one(freelancerProfiles, {
    fields: [serviceAds.freelancerId],
    references: [freelancerProfiles.id],
  }),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
  category: one(categories, {
    fields: [skills.categoryId],
    references: [categories.id],
  }),
}));

export const pricingSuggestionsRelations = relations(pricingSuggestions, ({ one }) => ({
  category: one(categories, {
    fields: [pricingSuggestions.categoryId],
    references: [categories.id],
  }),
}));

export const packageTiersRelations = relations(packageTiers, ({ one, many }) => ({
  package: one(servicePackages, {
    fields: [packageTiers.packageId],
    references: [servicePackages.id],
  }),
  orders: many(orders),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const featureUsageRelations = relations(featureUsage, ({ one }) => ({
  user: one(users, {
    fields: [featureUsage.userId],
    references: [users.id],
  }),
}));

export const addOnsRelations = relations(addOns, ({ one }) => ({
  user: one(users, {
    fields: [addOns.userId],
    references: [users.id],
  }),
}));

// Insert schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertFreelancerProfileSchema = createInsertSchema(freelancerProfiles);
export const insertCategorySchema = createInsertSchema(categories);
export const insertServicePackageSchema = createInsertSchema(servicePackages);
export const insertProjectSchema = createInsertSchema(projects);
export const insertProposalSchema = createInsertSchema(proposals);
export const insertOrderSchema = createInsertSchema(orders);
export const insertMessageSchema = createInsertSchema(messages);
export const insertReviewSchema = createInsertSchema(reviews);
export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const insertPlanFeaturesSchema = createInsertSchema(planFeatures);
export const insertFeatureUsageSchema = createInsertSchema(featureUsage);
export const insertAddOnSchema = createInsertSchema(addOns);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type FreelancerProfile = typeof freelancerProfiles.$inferSelect;
export type InsertFreelancerProfile = z.infer<typeof insertFreelancerProfileSchema>;
export type Category = typeof categories.$inferSelect;
export type ServicePackage = typeof servicePackages.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Proposal = typeof proposals.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type PlanFeatures = typeof planFeatures.$inferSelect;
export type FeatureUsage = typeof featureUsage.$inferSelect;
export type AddOn = typeof addOns.$inferSelect;