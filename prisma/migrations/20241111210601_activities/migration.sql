/*
  Warnings:

  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EventToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_EventToUser" DROP CONSTRAINT "_EventToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventToUser" DROP CONSTRAINT "_EventToUser_B_fkey";

-- DropTable
DROP TABLE "Event";

-- DropTable
DROP TABLE "_EventToUser";

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "summary" TEXT NOT NULL,
    "locations" TEXT[],
    "urlResources" TEXT[],
    "categories" TEXT[],

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ActivityToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ActivityToUser_AB_unique" ON "_ActivityToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ActivityToUser_B_index" ON "_ActivityToUser"("B");

-- AddForeignKey
ALTER TABLE "_ActivityToUser" ADD CONSTRAINT "_ActivityToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityToUser" ADD CONSTRAINT "_ActivityToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
