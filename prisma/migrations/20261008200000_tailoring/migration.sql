-- AlterTable
ALTER TABLE "resumes" ADD COLUMN     "hiddenSections" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isTailored" BOOLEAN NOT NULL DEFAULT false;
