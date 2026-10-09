-- AlterTable
ALTER TABLE "resumes" ADD COLUMN     "photoShape" TEXT,
ADD COLUMN     "photoPosition" TEXT NOT NULL DEFAULT 'left',
ADD COLUMN     "photoSize" TEXT NOT NULL DEFAULT 'medium';
