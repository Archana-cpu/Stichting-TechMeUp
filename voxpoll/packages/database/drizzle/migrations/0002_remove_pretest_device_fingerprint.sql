-- GAP-012: Privacy Architecture - Remove deviceFingerprint from pretest_attempts
-- Bible: 04-DATA/02-data-privacy.md
-- Replace deviceFingerprint with deviceCategory enum for privacy compliance

-- Remove deviceFingerprint column (contains PII - fingerprints)
ALTER TABLE "pretest_attempts" DROP COLUMN IF EXISTS "deviceFingerprint";--> statement-breakpoint

-- Add deviceCategory enum column (privacy-safe categorization)
ALTER TABLE "pretest_attempts" ADD COLUMN "deviceCategory" "DeviceCategory";--> statement-breakpoint
