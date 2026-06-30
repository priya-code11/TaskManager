/*
  Warnings:

  - Added the required column `userId` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `priority` on the `tasks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'missed';

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'todo',
DROP COLUMN "priority",
ADD COLUMN     "priority" TEXT NOT NULL,
ALTER COLUMN "reminderMin" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "fullName" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
