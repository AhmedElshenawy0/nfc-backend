/*
  Warnings:

  - Added the required column `vCardUi` to the `SoldService` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SoldService" ADD COLUMN     "vCardUi" TEXT NOT NULL;
