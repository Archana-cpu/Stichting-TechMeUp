-- Add new enums for content approval system
CREATE TYPE "ApprovalStatus" AS ENUM('NONE', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED');--> statement-breakpoint
CREATE TYPE "AppealStatus" AS ENUM('PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'DENIED');--> statement-breakpoint
CREATE TYPE "ModerationActionType" AS ENUM('CONTENT_APPROVED', 'CONTENT_REJECTED', 'CONTENT_REVISION_REQUESTED', 'USER_WARNED', 'USER_SUSPENDED', 'USER_BANNED', 'USER_UNBANNED', 'REPORT_RESOLVED', 'REPORT_DISMISSED', 'APPEAL_ACCEPTED', 'APPEAL_DENIED', 'CONTENT_REMOVED', 'CONTENT_RESTORED', 'BULK_ACTION');--> statement-breakpoint

-- Add new notification types to existing enum
ALTER TYPE "NotificationType" ADD VALUE 'CONTENT_PENDING_APPROVAL';--> statement-breakpoint
ALTER TYPE "NotificationType" ADD VALUE 'CONTENT_APPROVED';--> statement-breakpoint
ALTER TYPE "NotificationType" ADD VALUE 'CONTENT_REJECTED';--> statement-breakpoint
ALTER TYPE "NotificationType" ADD VALUE 'CONTENT_REVISION_REQUESTED';--> statement-breakpoint
ALTER TYPE "NotificationType" ADD VALUE 'APPEAL_SUBMITTED';--> statement-breakpoint
ALTER TYPE "NotificationType" ADD VALUE 'APPEAL_ACCEPTED';--> statement-breakpoint
ALTER TYPE "NotificationType" ADD VALUE 'APPEAL_DENIED';--> statement-breakpoint
ALTER TYPE "NotificationType" ADD VALUE 'MODERATOR_ASSIGNED_APPROVAL';--> statement-breakpoint
ALTER TYPE "NotificationType" ADD VALUE 'MODERATOR_ASSIGNED_APPEAL';--> statement-breakpoint

-- Create content_approvals table
CREATE TABLE IF NOT EXISTS "content_approvals" (
	"id" text PRIMARY KEY NOT NULL,
	"contentType" "ContentType" NOT NULL,
	"contentId" text NOT NULL,
	"status" "ApprovalStatus" DEFAULT 'PENDING_APPROVAL' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"submittedById" text NOT NULL,
	"submittedAt" timestamp DEFAULT now() NOT NULL,
	"reviewerId" text,
	"reviewedAt" timestamp,
	"decisionNotes" varchar(2000),
	"rejectionReason" varchar(500),
	"revisionInstructions" varchar(2000),
	"autoApproved" boolean DEFAULT false NOT NULL,
	"autoApprovalReason" varchar(200),
	"metadata" json DEFAULT '{}'::json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

-- Create appeals table
CREATE TABLE IF NOT EXISTS "appeals" (
	"id" text PRIMARY KEY NOT NULL,
	"appealerId" text NOT NULL,
	"moderationDecisionType" varchar(50) NOT NULL,
	"moderationDecisionId" text NOT NULL,
	"contentType" "ContentType",
	"contentId" text,
	"status" "AppealStatus" DEFAULT 'PENDING' NOT NULL,
	"reason" varchar(2000) NOT NULL,
	"evidence" json DEFAULT '[]'::json NOT NULL,
	"priority" "ReportPriority" DEFAULT 'NORMAL' NOT NULL,
	"assignedTo" text,
	"assignedAt" timestamp,
	"reviewerId" text,
	"reviewedAt" timestamp,
	"decision" varchar(500),
	"decisionNotes" varchar(2000),
	"actionsTaken" json DEFAULT '[]'::json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

-- Create auto_approval_rules table
CREATE TABLE IF NOT EXISTS "auto_approval_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text,
	"name" varchar(100) NOT NULL,
	"description" varchar(500),
	"contentType" "ContentType",
	"minTrustScore" double precision,
	"requiresVerification" boolean DEFAULT false NOT NULL,
	"minAccountAgeDays" integer,
	"maxPendingReports" integer,
	"conditions" json DEFAULT '{}'::json NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"createdBy" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

-- Add approval columns to polls table
ALTER TABLE "polls" ADD COLUMN "approvalStatus" "ApprovalStatus" DEFAULT 'NONE' NOT NULL;--> statement-breakpoint
ALTER TABLE "polls" ADD COLUMN "requiresApproval" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "polls" ADD COLUMN "currentApprovalId" text;--> statement-breakpoint

-- Add approval columns to surveys table
ALTER TABLE "surveys" ADD COLUMN "approvalStatus" "ApprovalStatus" DEFAULT 'NONE' NOT NULL;--> statement-breakpoint
ALTER TABLE "surveys" ADD COLUMN "requiresApproval" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "surveys" ADD COLUMN "currentApprovalId" text;--> statement-breakpoint

-- Add approval columns to tests table
ALTER TABLE "tests" ADD COLUMN "approvalStatus" "ApprovalStatus" DEFAULT 'NONE' NOT NULL;--> statement-breakpoint
ALTER TABLE "tests" ADD COLUMN "requiresApproval" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tests" ADD COLUMN "currentApprovalId" text;--> statement-breakpoint

-- Add content approval settings to organizations table
ALTER TABLE "organizations" ADD COLUMN "contentApprovalEnabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "contentApprovalSettings" json DEFAULT '{}'::json NOT NULL;--> statement-breakpoint

-- Add foreign key constraints
ALTER TABLE "content_approvals" ADD CONSTRAINT "content_approvals_submittedById_users_id_fk" FOREIGN KEY ("submittedById") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_approvals" ADD CONSTRAINT "content_approvals_reviewerId_users_id_fk" FOREIGN KEY ("reviewerId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appeals" ADD CONSTRAINT "appeals_appealerId_users_id_fk" FOREIGN KEY ("appealerId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appeals" ADD CONSTRAINT "appeals_assignedTo_users_id_fk" FOREIGN KEY ("assignedTo") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appeals" ADD CONSTRAINT "appeals_reviewerId_users_id_fk" FOREIGN KEY ("reviewerId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_approval_rules" ADD CONSTRAINT "auto_approval_rules_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_approval_rules" ADD CONSTRAINT "auto_approval_rules_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "content_approvals_contentType_contentId_version_idx" ON "content_approvals" USING btree ("contentType","contentId","version");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_approvals_status_createdAt_idx" ON "content_approvals" USING btree ("status","createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_approvals_submittedById_status_idx" ON "content_approvals" USING btree ("submittedById","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_approvals_reviewerId_status_idx" ON "content_approvals" USING btree ("reviewerId","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_approvals_contentType_status_idx" ON "content_approvals" USING btree ("contentType","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appeals_appealerId_status_idx" ON "appeals" USING btree ("appealerId","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appeals_status_priority_createdAt_idx" ON "appeals" USING btree ("status","priority","createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appeals_assignedTo_status_idx" ON "appeals" USING btree ("assignedTo","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appeals_moderationDecisionType_moderationDecisionId_idx" ON "appeals" USING btree ("moderationDecisionType","moderationDecisionId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auto_approval_rules_organizationId_isActive_idx" ON "auto_approval_rules" USING btree ("organizationId","isActive");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auto_approval_rules_contentType_isActive_priority_idx" ON "auto_approval_rules" USING btree ("contentType","isActive","priority");
