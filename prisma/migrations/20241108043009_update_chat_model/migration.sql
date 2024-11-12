/*
  Warnings:

  - You are about to drop the column `content` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `messageType` on the `Chat` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "content",
DROP COLUMN "isRead",
DROP COLUMN "messageType",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
