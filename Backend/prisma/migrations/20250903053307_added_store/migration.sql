-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('basic', 'standard', 'premium');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "plan" "Plan";
