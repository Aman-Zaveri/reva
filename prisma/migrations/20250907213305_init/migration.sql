-- CreateTable
CREATE TABLE "public"."personal_info" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "linkedin" TEXT,
    "linkedinUrl" TEXT,
    "linkedinDisplay" TEXT,
    "github" TEXT,
    "githubUrl" TEXT,
    "githubDisplay" TEXT,
    "website" TEXT,
    "websiteUrl" TEXT,
    "websiteDisplay" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."experiences" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "bullets" TEXT[],
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT,
    "bullets" TEXT[],
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."education" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "template" TEXT NOT NULL DEFAULT 'classic',
    "personalInfoId" TEXT,
    "sectionOrder" TEXT[] DEFAULT ARRAY['skills', 'experiences', 'projects', 'education']::TEXT[],
    "fontFamily" TEXT,
    "primaryColor" TEXT,
    "nameFontSize" TEXT,
    "headerFontSize" TEXT,
    "bodyTextFontSize" TEXT,
    "metadataTextFontSize" TEXT,
    "aiOptimizationTimestamp" TEXT,
    "aiOptimizationKeyInsights" TEXT[],
    "aiOptimizationJobDescHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profile_experiences" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "titleOverride" TEXT,
    "companyOverride" TEXT,
    "dateOverride" TEXT,
    "bulletsOverride" TEXT[],
    "tagsOverride" TEXT[],

    CONSTRAINT "profile_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profile_projects" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "titleOverride" TEXT,
    "linkOverride" TEXT,
    "bulletsOverride" TEXT[],
    "tagsOverride" TEXT[],

    CONSTRAINT "profile_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profile_skills" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "nameOverride" TEXT,
    "detailsOverride" TEXT,

    CONSTRAINT "profile_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profile_educations" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "educationId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "titleOverride" TEXT,
    "detailsOverride" TEXT,

    CONSTRAINT "profile_educations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_experiences_profileId_experienceId_key" ON "public"."profile_experiences"("profileId", "experienceId");

-- CreateIndex
CREATE UNIQUE INDEX "profile_projects_profileId_projectId_key" ON "public"."profile_projects"("profileId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "profile_skills_profileId_skillId_key" ON "public"."profile_skills"("profileId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "profile_educations_profileId_educationId_key" ON "public"."profile_educations"("profileId", "educationId");

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_personalInfoId_fkey" FOREIGN KEY ("personalInfoId") REFERENCES "public"."personal_info"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_experiences" ADD CONSTRAINT "profile_experiences_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_experiences" ADD CONSTRAINT "profile_experiences_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "public"."experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_projects" ADD CONSTRAINT "profile_projects_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_projects" ADD CONSTRAINT "profile_projects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_skills" ADD CONSTRAINT "profile_skills_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_skills" ADD CONSTRAINT "profile_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_educations" ADD CONSTRAINT "profile_educations_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_educations" ADD CONSTRAINT "profile_educations_educationId_fkey" FOREIGN KEY ("educationId") REFERENCES "public"."education"("id") ON DELETE CASCADE ON UPDATE CASCADE;
