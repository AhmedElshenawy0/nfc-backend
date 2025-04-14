/*
  Warnings:

  - You are about to drop the column `VCardContent` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "VCardContent",
ADD COLUMN     "vCardContent" JSONB NOT NULL DEFAULT '{}';
