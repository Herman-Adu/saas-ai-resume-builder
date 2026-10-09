-- CreateTable
CREATE TABLE "mentor_briefs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentor_briefs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_brief_runs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentor_brief_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mentor_briefs_jobId_key" ON "mentor_briefs"("jobId");

-- CreateIndex
CREATE INDEX "mentor_briefs_userId_idx" ON "mentor_briefs"("userId");

-- CreateIndex
CREATE INDEX "mentor_brief_runs_userId_createdAt_idx" ON "mentor_brief_runs"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "mentor_briefs" ADD CONSTRAINT "mentor_briefs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
