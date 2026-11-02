ALTER TYPE "video_provider" ADD VALUE 'jitsi';--> statement-breakpoint
ALTER TABLE "video_room" ALTER COLUMN "provider" DROP DEFAULT;