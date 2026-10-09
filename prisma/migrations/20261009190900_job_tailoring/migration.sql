-- AlterTable
ALTER TABLE "resumes" ADD COLUMN     "jobId" TEXT;

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "company" TEXT,
    "postText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tailor_runs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tailor_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jobs_userId_createdAt_idx" ON "jobs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "tailor_runs_userId_createdAt_idx" ON "tailor_runs"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
