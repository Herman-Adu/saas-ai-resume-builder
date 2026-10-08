-- CreateTable
CREATE TABLE "cv_imports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cv_imports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cv_imports_userId_createdAt_idx" ON "cv_imports"("userId", "createdAt");
