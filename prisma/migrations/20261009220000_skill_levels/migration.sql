-- AlterTable
ALTER TABLE "resumes" ADD COLUMN     "skillLevels" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "skillsStyle" TEXT NOT NULL DEFAULT 'chips';
