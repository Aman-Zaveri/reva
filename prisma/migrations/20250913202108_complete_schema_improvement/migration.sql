/*
  Warnings:

  - You are about to drop the column `bullets` on the `experiences` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `experiences` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `experiences` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `personal_info` table. All the data in the column will be lost.
  - You are about to drop the column `github` on the `personal_info` table. All the data in the column will be lost.
  - You are about to drop the column `githubDisplay` on the `personal_info` table. All the data in the column will be lost.
  - You are about to drop the column `githubUrl` on the `personal_info` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `personal_info` table. All the data in the column will be lost.
  - You are about to drop the column `linkedinDisplay` on the `personal_info` table. All the data in the column will be lost.
  - You are about to drop the column `linkedinUrl` on the `personal_info` table. All the data in the column will be lost.
  - You are about to drop the column `websiteDisplay` on the `personal_info` table. All the data in the column will be lost.
  - You are about to drop the column `websiteUrl` on the `personal_info` table. All the data in the column will be lost.
  - You are about to drop the column `aiOptimizationKeyInsights` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `aiOptimizationTimestamp` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `bodyTextFontSize` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `fontFamily` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `headerFontSize` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `metadataTextFontSize` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `nameFontSize` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `personalInfoId` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `primaryColor` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `sectionOrder` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `template` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `bullets` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the `education` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profile_educations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profile_experiences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profile_projects` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profile_skills` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `personal_info` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `startDate` to the `experiences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `experiences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileName` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `skills` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."profile_educations" DROP CONSTRAINT "profile_educations_educationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profile_educations" DROP CONSTRAINT "profile_educations_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profile_experiences" DROP CONSTRAINT "profile_experiences_experienceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profile_experiences" DROP CONSTRAINT "profile_experiences_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profile_projects" DROP CONSTRAINT "profile_projects_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profile_projects" DROP CONSTRAINT "profile_projects_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profile_skills" DROP CONSTRAINT "profile_skills_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profile_skills" DROP CONSTRAINT "profile_skills_skillId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_personalInfoId_fkey";

-- AlterTable
ALTER TABLE "public"."experiences" DROP COLUMN "bullets",
DROP COLUMN "date",
DROP COLUMN "tags",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."personal_info" DROP COLUMN "fullName",
DROP COLUMN "github",
DROP COLUMN "githubDisplay",
DROP COLUMN "githubUrl",
DROP COLUMN "linkedin",
DROP COLUMN "linkedinDisplay",
DROP COLUMN "linkedinUrl",
DROP COLUMN "websiteDisplay",
DROP COLUMN "websiteUrl",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "headline" TEXT,
ADD COLUMN     "lastName" TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "location" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."profiles" DROP COLUMN "aiOptimizationKeyInsights",
DROP COLUMN "aiOptimizationTimestamp",
DROP COLUMN "bodyTextFontSize",
DROP COLUMN "fontFamily",
DROP COLUMN "headerFontSize",
DROP COLUMN "metadataTextFontSize",
DROP COLUMN "name",
DROP COLUMN "nameFontSize",
DROP COLUMN "personalInfoId",
DROP COLUMN "primaryColor",
DROP COLUMN "sectionOrder",
DROP COLUMN "template",
ADD COLUMN     "aiOptimizationJobUrl" TEXT,
ADD COLUMN     "profileName" TEXT NOT NULL,
ADD COLUMN     "resumeConfiguration" JSONB,
ADD COLUMN     "templateName" TEXT;

-- AlterTable
ALTER TABLE "public"."projects" DROP COLUMN "bullets",
DROP COLUMN "tags",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."skills" ADD COLUMN     "category" TEXT,
ADD COLUMN     "level" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "details" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."education";

-- DropTable
DROP TABLE "public"."profile_educations";

-- DropTable
DROP TABLE "public"."profile_experiences";

-- DropTable
DROP TABLE "public"."profile_projects";

-- DropTable
DROP TABLE "public"."profile_skills";

-- CreateTable
CREATE TABLE "public"."social_links" (
    "id" TEXT NOT NULL,
    "personalInfoId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profile_items" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."experience_bullets" (
    "id" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "experience_bullets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."educations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "field" TEXT,
    "location" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "gpa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_bullets" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "project_bullets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_tags" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "project_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "social_links_personalInfoId_platform_key" ON "public"."social_links"("personalInfoId", "platform");

-- CreateIndex
CREATE INDEX "profile_items_profileId_itemType_order_idx" ON "public"."profile_items"("profileId", "itemType", "order");

-- CreateIndex
CREATE UNIQUE INDEX "profile_items_profileId_itemType_itemId_key" ON "public"."profile_items"("profileId", "itemType", "itemId");

-- CreateIndex
CREATE INDEX "experience_bullets_experienceId_order_idx" ON "public"."experience_bullets"("experienceId", "order");

-- CreateIndex
CREATE INDEX "educations_userId_startDate_idx" ON "public"."educations"("userId", "startDate");

-- CreateIndex
CREATE INDEX "project_bullets_projectId_order_idx" ON "public"."project_bullets"("projectId", "order");

-- CreateIndex
CREATE INDEX "project_tags_projectId_idx" ON "public"."project_tags"("projectId");

-- CreateIndex
CREATE INDEX "experiences_userId_startDate_idx" ON "public"."experiences"("userId", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "personal_info_userId_key" ON "public"."personal_info"("userId");

-- CreateIndex
CREATE INDEX "projects_userId_idx" ON "public"."projects"("userId");

-- CreateIndex
CREATE INDEX "skills_userId_category_idx" ON "public"."skills"("userId", "category");

-- AddForeignKey
ALTER TABLE "public"."social_links" ADD CONSTRAINT "social_links_personalInfoId_fkey" FOREIGN KEY ("personalInfoId") REFERENCES "public"."personal_info"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_items" ADD CONSTRAINT "profile_items_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."experiences" ADD CONSTRAINT "experiences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."experience_bullets" ADD CONSTRAINT "experience_bullets_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "public"."experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."educations" ADD CONSTRAINT "educations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_bullets" ADD CONSTRAINT "project_bullets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_tags" ADD CONSTRAINT "project_tags_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skills" ADD CONSTRAINT "skills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
