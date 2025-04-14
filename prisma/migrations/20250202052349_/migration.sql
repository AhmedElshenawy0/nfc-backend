/*
  Warnings:

  - You are about to drop the column `template_id` on the `SoldService` table. All the data in the column will be lost.
  - You are about to drop the `Template` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UpdatableContent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SoldService" DROP CONSTRAINT "SoldService_template_id_fkey";

-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT "Template_service_id_fkey";

-- DropForeignKey
ALTER TABLE "UpdatableContent" DROP CONSTRAINT "UpdatableContent_soldService_id_fkey";

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "VCardContent" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "SoldService" DROP COLUMN "template_id",
ADD COLUMN     "fileUpdatableContent" TEXT,
ADD COLUMN     "menuUpdatableContent" JSONB[],
ADD COLUMN     "urlUpdatableContent" TEXT,
ADD COLUMN     "vCardupdatableContent" JSONB DEFAULT '{}';

-- DropTable
DROP TABLE "Template";

-- DropTable
DROP TABLE "UpdatableContent";
