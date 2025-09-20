/*
  Warnings:

  - You are about to drop the column `endDate` on the `educations` table. All the data in the column will be lost.
  - You are about to drop the column `field` on the `educations` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `educations` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `educations` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `skills` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `skills` table. All the data in the column will be lost.
  - You are about to drop the `jobs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profile_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `social_links` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `category` on table `skills` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."jobs" DROP CONSTRAINT "jobs_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profile_items" DROP CONSTRAINT "profile_items_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_jobId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."project_tags" DROP CONSTRAINT "project_tags_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."social_links" DROP CONSTRAINT "social_links_personalInfoId_fkey";

-- DropIndex
DROP INDEX "public"."educations_userId_endDate_idx";

-- AlterTable
ALTER TABLE "public"."educations" DROP COLUMN "endDate",
DROP COLUMN "field",
DROP COLUMN "location",
DROP COLUMN "startDate",
ADD COLUMN     "graduationDate" TIMESTAMP(3),
ADD COLUMN     "minor" TEXT;

-- AlterTable
ALTER TABLE "public"."experiences" ALTER COLUMN "startDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."projects" DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."skills" DROP COLUMN "details",
DROP COLUMN "level",
ALTER COLUMN "category" SET NOT NULL;

-- DropTable
DROP TABLE "public"."jobs";

-- DropTable
DROP TABLE "public"."profile_items";

-- DropTable
DROP TABLE "public"."profiles";

-- DropTable
DROP TABLE "public"."project_tags";

-- DropTable
DROP TABLE "public"."social_links";

-- CreateIndex
CREATE INDEX "educations_userId_graduationDate_idx" ON "public"."educations"("userId", "graduationDate");
