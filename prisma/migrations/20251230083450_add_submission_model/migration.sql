-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "runtime" INTEGER NOT NULL,
    "runtimePercentile" DOUBLE PRECISION,
    "runtimeDisplay" TEXT,
    "memory" BIGINT,
    "memoryPercentile" DOUBLE PRECISION,
    "memoryDisplay" TEXT,
    "lang" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "notes" TEXT,
    "difficulty" TEXT,
    "topics" TEXT[],
    "questionId" TEXT,
    "totalCorrect" INTEGER,
    "totalTestcases" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "problemId" TEXT,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Submission_username_idx" ON "Submission"("username");

-- CreateIndex
CREATE INDEX "Submission_slug_idx" ON "Submission"("slug");

-- CreateIndex
CREATE INDEX "Submission_timestamp_idx" ON "Submission"("timestamp");

-- CreateIndex
CREATE INDEX "Submission_difficulty_idx" ON "Submission"("difficulty");

-- CreateIndex
CREATE INDEX "Submission_lang_idx" ON "Submission"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_username_submissionId_key" ON "Submission"("username", "submissionId");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
