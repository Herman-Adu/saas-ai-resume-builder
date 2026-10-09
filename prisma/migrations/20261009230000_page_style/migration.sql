-- AlterTable
ALTER TABLE "resumes" ADD COLUMN     "fontPair" TEXT NOT NULL DEFAULT 'default',
ADD COLUMN     "pageBackground" TEXT NOT NULL DEFAULT 'plain';
