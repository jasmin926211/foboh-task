-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "ProfileScope" AS ENUM ('all', 'selected');

-- AlterTable
ALTER TABLE "pricing_profiles" ADD COLUMN     "scope" "ProfileScope" NOT NULL DEFAULT 'selected',
ADD COLUMN     "status" "ProfileStatus" NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- Backfill: existing profiles were live before this feature, set them to published
UPDATE "pricing_profiles" SET "status" = 'published' WHERE "status" = 'draft';
