/*
  Warnings:

  - The values [super_admin] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `SuperAdmin` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('basic', 'standard', 'premium');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('admin', 'cashier');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'cashier';
COMMIT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "plan" "Plan";

-- DropTable
DROP TABLE "SuperAdmin";
