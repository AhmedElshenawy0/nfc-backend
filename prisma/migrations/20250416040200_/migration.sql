/*
  Warnings:

  - The primary key for the `Card` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `client_id` column on the `Card` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Client` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SoldService` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `client_id` column on the `SoldService` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `card_id` column on the `SoldService` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `id` on the `Card` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Client` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `SoldService` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_client_id_fkey";

-- DropForeignKey
ALTER TABLE "SoldService" DROP CONSTRAINT "SoldService_card_id_fkey";

-- DropForeignKey
ALTER TABLE "SoldService" DROP CONSTRAINT "SoldService_client_id_fkey";

-- AlterTable
ALTER TABLE "Card" DROP CONSTRAINT "Card_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "client_id",
ADD COLUMN     "client_id" UUID,
ADD CONSTRAINT "Card_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Client" DROP CONSTRAINT "Client_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Client_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "SoldService" DROP CONSTRAINT "SoldService_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "client_id",
ADD COLUMN     "client_id" UUID,
DROP COLUMN "card_id",
ADD COLUMN     "card_id" UUID,
ADD CONSTRAINT "SoldService_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "SoldService_card_id_key" ON "SoldService"("card_id");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoldService" ADD CONSTRAINT "SoldService_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoldService" ADD CONSTRAINT "SoldService_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
