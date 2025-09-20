-- DropIndex
DROP INDEX "public"."educations_userId_startDate_idx";

-- AlterTable
ALTER TABLE "public"."educations" ADD COLUMN     "relevantCoursework" TEXT,
ALTER COLUMN "startDate" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "educations_userId_endDate_idx" ON "public"."educations"("userId", "endDate");
