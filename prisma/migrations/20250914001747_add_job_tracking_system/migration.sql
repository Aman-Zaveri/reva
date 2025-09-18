-- AlterTable
ALTER TABLE "public"."profiles" ADD COLUMN     "jobId" TEXT;

-- CreateTable
CREATE TABLE "public"."jobs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "description" TEXT,
    "requirements" TEXT,
    "responsibilities" TEXT,
    "qualifications" TEXT,
    "skills" TEXT,
    "url" TEXT,
    "location" TEXT,
    "salary" TEXT,
    "jobType" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "extractedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jobs_userId_source_idx" ON "public"."jobs"("userId", "source");

-- CreateIndex
CREATE INDEX "jobs_userId_createdAt_idx" ON "public"."jobs"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."jobs" ADD CONSTRAINT "jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
