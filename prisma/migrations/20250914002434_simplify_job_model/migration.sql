/*
  Warnings:

  - You are about to drop the column `jobType` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `qualifications` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `salary` on the `jobs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."jobs" DROP COLUMN "jobType",
DROP COLUMN "location",
DROP COLUMN "qualifications",
DROP COLUMN "salary";
