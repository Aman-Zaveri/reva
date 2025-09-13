-- ================================
-- COMPREHENSIVE DATABASE MIGRATION
-- From Legacy to Improved Schema
-- ================================

-- Step 1: Create backup tables for safety
DO $$ 
BEGIN
    -- Create backup of existing data before migration
    EXECUTE 'CREATE TABLE backup_' || to_char(now(), 'YYYY_MM_DD_HH24_MI') || '_personal_info AS SELECT * FROM personal_info';
    EXECUTE 'CREATE TABLE backup_' || to_char(now(), 'YYYY_MM_DD_HH24_MI') || '_experiences AS SELECT * FROM experiences';
    EXECUTE 'CREATE TABLE backup_' || to_char(now(), 'YYYY_MM_DD_HH24_MI') || '_projects AS SELECT * FROM projects';
    EXECUTE 'CREATE TABLE backup_' || to_char(now(), 'YYYY_MM_DD_HH24_MI') || '_skills AS SELECT * FROM skills';
    EXECUTE 'CREATE TABLE backup_' || to_char(now(), 'YYYY_MM_DD_HH24_MI') || '_education AS SELECT * FROM education';
    EXECUTE 'CREATE TABLE backup_' || to_char(now(), 'YYYY_MM_DD_HH24_MI') || '_profiles AS SELECT * FROM profiles';
    EXECUTE 'CREATE TABLE backup_' || to_char(now(), 'YYYY_MM_DD_HH24_MI') || '_profile_experiences AS SELECT * FROM profile_experiences';
    EXECUTE 'CREATE TABLE backup_' || to_char(now(), 'YYYY_MM_DD_HH24_MI') || '_profile_projects AS SELECT * FROM profile_projects';
    EXECUTE 'CREATE TABLE backup_' || to_char(now(), 'YYYY_MM_DD_HH24_MI') || '_profile_skills AS SELECT * FROM profile_skills';
    EXECUTE 'CREATE TABLE backup_' || to_char(now(), 'YYYY_MM_DD_HH24_MI') || '_profile_educations AS SELECT * FROM profile_educations';
    
    RAISE NOTICE 'Backup tables created successfully';
END $$;

-- Step 2: Create new enum type
CREATE TYPE "ItemType" AS ENUM ('EXPERIENCE', 'PROJECT', 'SKILL', 'EDUCATION');

-- Step 3: Create new tables for normalized structure

-- Social Links table (normalized from personal_info inline fields)
CREATE TABLE "social_links" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "username" TEXT,
    "url" TEXT NOT NULL,
    "displayText" TEXT,
    "personalInfoId" TEXT NOT NULL,

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

-- Experience bullets (normalized from string array)
CREATE TABLE "experience_bullets" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "experienceId" TEXT NOT NULL,

    CONSTRAINT "experience_bullets_pkey" PRIMARY KEY ("id")
);

-- Experience tags (normalized from string array)
CREATE TABLE "experience_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,

    CONSTRAINT "experience_tags_pkey" PRIMARY KEY ("id")
);

-- Project bullets (normalized from string array)
CREATE TABLE "project_bullets" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "project_bullets_pkey" PRIMARY KEY ("id")
);

-- Project tags (normalized from string array)
CREATE TABLE "project_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "project_tags_pkey" PRIMARY KEY ("id")
);

-- Generic profile items (replaces 4 junction tables)
CREATE TABLE "profile_items" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "itemType" "ItemType" NOT NULL,
    "itemId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "titleOverride" TEXT,
    "descriptionOverride" TEXT,

    CONSTRAINT "profile_items_pkey" PRIMARY KEY ("id")
);

-- Bullet-level overrides
CREATE TABLE "bullet_overrides" (
    "id" TEXT NOT NULL,
    "profileItemId" TEXT,
    "experienceBulletId" TEXT,
    "projectBulletId" TEXT,
    "content" TEXT NOT NULL,

    CONSTRAINT "bullet_overrides_pkey" PRIMARY KEY ("id")
);

-- AI optimization versioning
CREATE TABLE "profile_optimizations" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "jobDescriptionHash" TEXT NOT NULL,
    "customInstructions" TEXT,
    "keyInsights" TEXT[],
    "optimizedData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_optimizations_pkey" PRIMARY KEY ("id")
);

-- Step 4: Modify existing tables

-- Update personal_info to be one-to-one with users
ALTER TABLE "personal_info" 
    DROP CONSTRAINT IF EXISTS "personal_info_userId_fkey",
    ADD CONSTRAINT "personal_info_userId_key" UNIQUE ("userId");

-- Make phone and location optional in personal_info
ALTER TABLE "personal_info"
    ALTER COLUMN "phone" DROP NOT NULL,
    ALTER COLUMN "location" DROP NOT NULL;

-- Add new fields to experiences
ALTER TABLE "experiences" 
    ADD COLUMN "startDate" TIMESTAMP(3),
    ADD COLUMN "endDate" TIMESTAMP(3),
    ADD COLUMN "isCurrentRole" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "location" TEXT,
    ADD COLUMN "description" TEXT,
    ADD COLUMN "userId" TEXT,
    ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- Add new fields to projects  
ALTER TABLE "projects"
    ADD COLUMN "description" TEXT,
    ADD COLUMN "startDate" TIMESTAMP(3),
    ADD COLUMN "endDate" TIMESTAMP(3),
    ADD COLUMN "userId" TEXT,
    ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- Add new fields to skills
ALTER TABLE "skills"
    ADD COLUMN "category" TEXT,
    ADD COLUMN "proficiency" TEXT,
    ADD COLUMN "userId" TEXT,
    ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- Update skills details to be optional
ALTER TABLE "skills"
    ALTER COLUMN "details" DROP NOT NULL;

-- Add new fields to education
ALTER TABLE "education"
    ADD COLUMN "institution" TEXT,
    ADD COLUMN "degree" TEXT,
    ADD COLUMN "fieldOfStudy" TEXT,
    ADD COLUMN "startDate" TIMESTAMP(3),
    ADD COLUMN "endDate" TIMESTAMP(3),
    ADD COLUMN "gpa" TEXT,
    ADD COLUMN "userId" TEXT,
    ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- Update profiles table
ALTER TABLE "profiles"
    ADD COLUMN "configuration" JSONB NOT NULL DEFAULT '{}',
    ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    DROP COLUMN IF EXISTS "personalInfoId",
    DROP COLUMN IF EXISTS "sectionOrder",
    DROP COLUMN IF EXISTS "fontFamily",
    DROP COLUMN IF EXISTS "primaryColor", 
    DROP COLUMN IF EXISTS "nameFontSize",
    DROP COLUMN IF EXISTS "headerFontSize",
    DROP COLUMN IF EXISTS "bodyTextFontSize",
    DROP COLUMN IF EXISTS "metadataTextFontSize",
    DROP COLUMN IF EXISTS "aiOptimizationTimestamp",
    DROP COLUMN IF EXISTS "aiOptimizationKeyInsights",
    DROP COLUMN IF EXISTS "aiOptimizationJobDescHash";

-- Step 5: Data Migration Functions

-- Function to safely parse date strings
CREATE OR REPLACE FUNCTION parse_date_string(date_str TEXT) 
RETURNS TIMESTAMP AS $$
DECLARE
    parsed_date TIMESTAMP;
BEGIN
    -- Try different date formats
    BEGIN
        -- Format: "Jan 2023 - Dec 2023" or "Jan 2023 - Present"
        IF date_str ~* '\w+ \d{4} - (\w+ \d{4}|Present)' THEN
            -- Extract start date (first part before " - ")
            parsed_date := TO_TIMESTAMP(split_part(date_str, ' - ', 1), 'Mon YYYY');
            RETURN parsed_date;
        END IF;
        
        -- Format: "2023-01-01" (ISO format)
        IF date_str ~ '^\d{4}-\d{2}-\d{2}' THEN
            RETURN date_str::TIMESTAMP;
        END IF;
        
        -- Format: "January 2023"
        IF date_str ~* '^\w+ \d{4}$' THEN
            RETURN TO_TIMESTAMP(date_str, 'Month YYYY');
        END IF;
        
        -- Default fallback - try to extract year
        IF date_str ~ '\d{4}' THEN
            parsed_date := TO_TIMESTAMP(substring(date_str from '\d{4}'), 'YYYY');
            RETURN parsed_date;
        END IF;
        
    EXCEPTION 
        WHEN OTHERS THEN
            NULL; -- Continue to fallback
    END;
    
    -- Ultimate fallback
    RETURN CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to extract end date from date string
CREATE OR REPLACE FUNCTION parse_end_date_string(date_str TEXT) 
RETURNS TIMESTAMP AS $$
DECLARE
    end_part TEXT;
    parsed_date TIMESTAMP;
BEGIN
    -- Check if it contains " - "
    IF date_str ~* ' - ' THEN
        end_part := split_part(date_str, ' - ', 2);
        
        -- Check for "Present" or "Current"
        IF end_part ~* '(Present|Current)' THEN
            RETURN NULL; -- NULL indicates current role
        END IF;
        
        -- Try to parse the end date
        BEGIN
            IF end_part ~* '^\w+ \d{4}$' THEN
                RETURN TO_TIMESTAMP(end_part, 'Mon YYYY');
            END IF;
        EXCEPTION 
            WHEN OTHERS THEN
                NULL;
        END;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Migrate existing data

-- First, get user associations for existing data
-- We'll need to assign existing experiences/projects/skills/education to users
-- This is the trickiest part since the current schema doesn't have user relationships

DO $$
DECLARE
    user_record RECORD;
    exp_record RECORD;
    proj_record RECORD;
    skill_record RECORD;
    edu_record RECORD;
    profile_record RECORD;
    bullet_content TEXT;
    tag_name TEXT;
    i INTEGER;
BEGIN
    -- For each user, migrate their data
    FOR user_record IN SELECT id, email FROM users LOOP
        RAISE NOTICE 'Migrating data for user: %', user_record.email;
        
        -- Migrate experiences that are used in this user's profiles
        FOR exp_record IN 
            SELECT DISTINCT e.* 
            FROM experiences e
            JOIN profile_experiences pe ON e.id = pe."experienceId"
            JOIN profiles p ON pe."profileId" = p.id
            WHERE p."userId" = user_record.id
        LOOP
            -- Update experience with user association and dates
            UPDATE experiences 
            SET 
                "userId" = user_record.id,
                "startDate" = parse_date_string(exp_record.date),
                "endDate" = parse_end_date_string(exp_record.date),
                "isCurrentRole" = (exp_record.date ~* '(Present|Current)')
            WHERE id = exp_record.id;
            
            -- Migrate bullets to normalized table
            i := 0;
            FOREACH bullet_content IN ARRAY exp_record.bullets LOOP
                INSERT INTO experience_bullets (id, content, "order", "experienceId")
                VALUES (
                    CONCAT('exp_bullet_', exp_record.id, '_', i),
                    bullet_content,
                    i,
                    exp_record.id
                );
                i := i + 1;
            END LOOP;
            
            -- Migrate tags to normalized table
            FOREACH tag_name IN ARRAY exp_record.tags LOOP
                INSERT INTO experience_tags (id, name, "experienceId")
                VALUES (
                    CONCAT('exp_tag_', exp_record.id, '_', replace(tag_name, ' ', '_')),
                    tag_name,
                    exp_record.id
                );
            END LOOP;
        END LOOP;
        
        -- Migrate projects
        FOR proj_record IN 
            SELECT DISTINCT p.* 
            FROM projects p
            JOIN profile_projects pp ON p.id = pp."projectId"
            JOIN profiles pr ON pp."profileId" = pr.id
            WHERE pr."userId" = user_record.id
        LOOP
            UPDATE projects 
            SET "userId" = user_record.id
            WHERE id = proj_record.id;
            
            -- Migrate project bullets
            i := 0;
            FOREACH bullet_content IN ARRAY proj_record.bullets LOOP
                INSERT INTO project_bullets (id, content, "order", "projectId")
                VALUES (
                    CONCAT('proj_bullet_', proj_record.id, '_', i),
                    bullet_content,
                    i,
                    proj_record.id
                );
                i := i + 1;
            END LOOP;
            
            -- Migrate project tags
            FOREACH tag_name IN ARRAY proj_record.tags LOOP
                INSERT INTO project_tags (id, name, "projectId")
                VALUES (
                    CONCAT('proj_tag_', proj_record.id, '_', replace(tag_name, ' ', '_')),
                    tag_name,
                    proj_record.id
                );
            END LOOP;
        END LOOP;
        
        -- Migrate skills
        FOR skill_record IN 
            SELECT DISTINCT s.* 
            FROM skills s
            JOIN profile_skills ps ON s.id = ps."skillId"
            JOIN profiles p ON ps."profileId" = p.id
            WHERE p."userId" = user_record.id
        LOOP
            UPDATE skills 
            SET "userId" = user_record.id
            WHERE id = skill_record.id;
        END LOOP;
        
        -- Migrate education
        FOR edu_record IN 
            SELECT DISTINCT e.* 
            FROM education e
            JOIN profile_educations pe ON e.id = pe."educationId"
            JOIN profiles p ON pe."profileId" = p.id
            WHERE p."userId" = user_record.id
        LOOP
            -- Parse education title and details into structured fields
            UPDATE education 
            SET 
                "userId" = user_record.id,
                "institution" = COALESCE(split_part(edu_record.title, ' - ', 1), edu_record.title),
                "degree" = COALESCE(split_part(edu_record.title, ' - ', 2), edu_record.details)
            WHERE id = edu_record.id;
        END LOOP;
        
        -- Migrate profile formatting to JSON configuration
        FOR profile_record IN SELECT * FROM profiles WHERE "userId" = user_record.id LOOP
            UPDATE profiles 
            SET configuration = jsonb_build_object(
                'fontFamily', COALESCE(profile_record."fontFamily", 'Inter'),
                'primaryColor', COALESCE(profile_record."primaryColor", '#2563eb'),
                'fontSize', jsonb_build_object(
                    'name', COALESCE(profile_record."nameFontSize", '24px'),
                    'header', COALESCE(profile_record."headerFontSize", '16px'),
                    'body', COALESCE(profile_record."bodyTextFontSize", '12px'),
                    'metadata', COALESCE(profile_record."metadataTextFontSize", '10px')
                ),
                'sectionOrder', COALESCE(profile_record."sectionOrder", ARRAY['skills', 'experiences', 'projects', 'education'])
            )
            WHERE id = profile_record.id;
            
            -- Migrate AI optimization data
            IF profile_record."aiOptimizationTimestamp" IS NOT NULL THEN
                INSERT INTO profile_optimizations (
                    id, "profileId", "jobDescription", "jobDescriptionHash", 
                    "keyInsights", "optimizedData", "createdAt"
                ) VALUES (
                    CONCAT('opt_', profile_record.id, '_1'),
                    profile_record.id,
                    'Migrated optimization data',
                    COALESCE(profile_record."aiOptimizationJobDescHash", 'migrated'),
                    COALESCE(profile_record."aiOptimizationKeyInsights", ARRAY[]::TEXT[]),
                    '{"migrated": true}'::jsonb,
                    TO_TIMESTAMP(profile_record."aiOptimizationTimestamp", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
                );
            END IF;
        END LOOP;
        
        -- Migrate profile items (replacing junction tables)
        -- Experience items
        FOR profile_record IN 
            SELECT pe.*, p."userId" 
            FROM profile_experiences pe
            JOIN profiles p ON pe."profileId" = p.id
            WHERE p."userId" = user_record.id
        LOOP
            INSERT INTO profile_items (
                id, "profileId", "itemType", "itemId", "order", 
                "titleOverride", "descriptionOverride"
            ) VALUES (
                CONCAT('item_exp_', profile_record."profileId", '_', profile_record."experienceId"),
                profile_record."profileId",
                'EXPERIENCE',
                profile_record."experienceId",
                profile_record."order",
                profile_record."titleOverride",
                profile_record."companyOverride"
            );
        END LOOP;
        
        -- Project items
        FOR profile_record IN 
            SELECT pp.*, p."userId" 
            FROM profile_projects pp
            JOIN profiles p ON pp."profileId" = p.id
            WHERE p."userId" = user_record.id
        LOOP
            INSERT INTO profile_items (
                id, "profileId", "itemType", "itemId", "order",
                "titleOverride", "descriptionOverride"
            ) VALUES (
                CONCAT('item_proj_', profile_record."profileId", '_', profile_record."projectId"),
                profile_record."profileId",
                'PROJECT',
                profile_record."projectId",
                profile_record."order",
                profile_record."titleOverride",
                profile_record."linkOverride"
            );
        END LOOP;
        
        -- Skill items
        FOR profile_record IN 
            SELECT ps.*, p."userId" 
            FROM profile_skills ps
            JOIN profiles p ON ps."profileId" = p.id
            WHERE p."userId" = user_record.id
        LOOP
            INSERT INTO profile_items (
                id, "profileId", "itemType", "itemId", "order",
                "titleOverride", "descriptionOverride"
            ) VALUES (
                CONCAT('item_skill_', profile_record."profileId", '_', profile_record."skillId"),
                profile_record."profileId",
                'SKILL',
                profile_record."skillId",
                profile_record."order",
                profile_record."nameOverride",
                profile_record."detailsOverride"
            );
        END LOOP;
        
        -- Education items
        FOR profile_record IN 
            SELECT pe.*, p."userId" 
            FROM profile_educations pe
            JOIN profiles p ON pe."profileId" = p.id
            WHERE p."userId" = user_record.id
        LOOP
            INSERT INTO profile_items (
                id, "profileId", "itemType", "itemId", "order",
                "titleOverride", "descriptionOverride"
            ) VALUES (
                CONCAT('item_edu_', profile_record."profileId", '_', profile_record."educationId"),
                profile_record."profileId",
                'EDUCATION',
                profile_record."educationId",
                profile_record."order",
                profile_record."titleOverride",
                profile_record."detailsOverride"
            );
        END LOOP;
        
        -- Migrate social links from personal_info
        FOR profile_record IN 
            SELECT * FROM personal_info WHERE "userId" = user_record.id
        LOOP
            -- LinkedIn
            IF profile_record.linkedin IS NOT NULL OR profile_record."linkedinUrl" IS NOT NULL THEN
                INSERT INTO social_links (id, platform, username, url, "displayText", "personalInfoId")
                VALUES (
                    CONCAT('social_linkedin_', profile_record.id),
                    'linkedin',
                    profile_record.linkedin,
                    COALESCE(profile_record."linkedinUrl", CONCAT('https://linkedin.com/in/', profile_record.linkedin)),
                    profile_record."linkedinDisplay",
                    profile_record.id
                );
            END IF;
            
            -- GitHub
            IF profile_record.github IS NOT NULL OR profile_record."githubUrl" IS NOT NULL THEN
                INSERT INTO social_links (id, platform, username, url, "displayText", "personalInfoId")
                VALUES (
                    CONCAT('social_github_', profile_record.id),
                    'github',
                    profile_record.github,
                    COALESCE(profile_record."githubUrl", CONCAT('https://github.com/', profile_record.github)),
                    profile_record."githubDisplay",
                    profile_record.id
                );
            END IF;
            
            -- Website
            IF profile_record.website IS NOT NULL OR profile_record."websiteUrl" IS NOT NULL THEN
                INSERT INTO social_links (id, platform, username, url, "displayText", "personalInfoId")
                VALUES (
                    CONCAT('social_website_', profile_record.id),
                    'website',
                    profile_record.website,
                    COALESCE(profile_record."websiteUrl", profile_record.website),
                    profile_record."websiteDisplay",
                    profile_record.id
                );
            END IF;
        END LOOP;
        
    END LOOP;
    
    RAISE NOTICE 'Data migration completed successfully';
END $$;

-- Step 7: Add constraints and indexes

-- Add foreign key constraints
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_personalInfoId_fkey" FOREIGN KEY ("personalInfoId") REFERENCES "personal_info"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "experience_bullets" ADD CONSTRAINT "experience_bullets_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "experience_tags" ADD CONSTRAINT "experience_tags_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_bullets" ADD CONSTRAINT "project_bullets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "profile_items" ADD CONSTRAINT "profile_items_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bullet_overrides" ADD CONSTRAINT "bullet_overrides_profileItemId_fkey" FOREIGN KEY ("profileItemId") REFERENCES "profile_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bullet_overrides" ADD CONSTRAINT "bullet_overrides_experienceBulletId_fkey" FOREIGN KEY ("experienceBulletId") REFERENCES "experience_bullets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bullet_overrides" ADD CONSTRAINT "bullet_overrides_projectBulletId_fkey" FOREIGN KEY ("projectBulletId") REFERENCES "project_bullets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "profile_optimizations" ADD CONSTRAINT "profile_optimizations_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add user foreign keys to main tables
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "skills" ADD CONSTRAINT "skills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "education" ADD CONSTRAINT "education_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Make user columns NOT NULL after data migration
ALTER TABLE "experiences" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "projects" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "skills" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "education" ALTER COLUMN "userId" SET NOT NULL;

-- Add unique constraints
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_personalInfoId_platform_key" UNIQUE ("personalInfoId", "platform");
ALTER TABLE "experience_tags" ADD CONSTRAINT "experience_tags_experienceId_name_key" UNIQUE ("experienceId", "name");
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_projectId_name_key" UNIQUE ("projectId", "name");
ALTER TABLE "profile_items" ADD CONSTRAINT "profile_items_profileId_itemType_itemId_key" UNIQUE ("profileId", "itemType", "itemId");
ALTER TABLE "skills" ADD CONSTRAINT "skills_userId_name_key" UNIQUE ("userId", "name");

-- Add performance indexes
CREATE INDEX "experiences_userId_startDate_idx" ON "experiences"("userId", "startDate");
CREATE INDEX "experiences_userId_isDeleted_idx" ON "experiences"("userId", "isDeleted");
CREATE INDEX "projects_userId_isDeleted_idx" ON "projects"("userId", "isDeleted");
CREATE INDEX "skills_userId_category_idx" ON "skills"("userId", "category");
CREATE INDEX "education_userId_endDate_idx" ON "education"("userId", "endDate");
CREATE INDEX "profiles_userId_isDeleted_idx" ON "profiles"("userId", "isDeleted");
CREATE INDEX "profile_items_profileId_itemType_order_idx" ON "profile_items"("profileId", "itemType", "order");
CREATE INDEX "profile_optimizations_profileId_jobDescriptionHash_idx" ON "profile_optimizations"("profileId", "jobDescriptionHash");
CREATE INDEX "profile_optimizations_jobDescriptionHash_idx" ON "profile_optimizations"("jobDescriptionHash");

-- Step 8: Remove old columns from personal_info
ALTER TABLE "personal_info" 
    DROP COLUMN IF EXISTS "linkedin",
    DROP COLUMN IF EXISTS "linkedinUrl", 
    DROP COLUMN IF EXISTS "linkedinDisplay",
    DROP COLUMN IF EXISTS "github",
    DROP COLUMN IF EXISTS "githubUrl",
    DROP COLUMN IF EXISTS "githubDisplay", 
    DROP COLUMN IF EXISTS "website",
    DROP COLUMN IF EXISTS "websiteUrl",
    DROP COLUMN IF EXISTS "websiteDisplay";

-- Step 9: Remove old columns from experiences, projects, skills, education
ALTER TABLE "experiences" 
    DROP COLUMN IF EXISTS "date",
    DROP COLUMN IF EXISTS "bullets",
    DROP COLUMN IF EXISTS "tags";

ALTER TABLE "projects"
    DROP COLUMN IF EXISTS "bullets", 
    DROP COLUMN IF EXISTS "tags";

-- Step 10: Drop old junction tables (after confirming data migration)
-- WARNING: Only run this after validating that all data migrated correctly
-- DROP TABLE IF EXISTS "profile_experiences";
-- DROP TABLE IF EXISTS "profile_projects"; 
-- DROP TABLE IF EXISTS "profile_skills";
-- DROP TABLE IF EXISTS "profile_educations";

-- Step 11: Clean up orphaned data (experiences/projects/skills/education not associated with any user)
DELETE FROM experiences WHERE "userId" IS NULL;
DELETE FROM projects WHERE "userId" IS NULL;
DELETE FROM skills WHERE "userId" IS NULL;
DELETE FROM education WHERE "userId" IS NULL;

-- Drop the helper functions
DROP FUNCTION IF EXISTS parse_date_string(TEXT);
DROP FUNCTION IF EXISTS parse_end_date_string(TEXT);

-- Migration completed
SELECT 'Migration completed successfully! Please validate all data before dropping old junction tables.' AS status;