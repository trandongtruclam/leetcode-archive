-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "trackedUserId" TEXT;

-- CreateTable
CREATE TABLE "TrackedUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastFetched" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackedUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrackedUser_username_key" ON "TrackedUser"("username");

-- CreateIndex
CREATE INDEX "TrackedUser_enabled_idx" ON "TrackedUser"("enabled");

-- CreateIndex
CREATE INDEX "TrackedUser_lastFetched_idx" ON "TrackedUser"("lastFetched");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_trackedUserId_fkey" FOREIGN KEY ("trackedUserId") REFERENCES "TrackedUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
