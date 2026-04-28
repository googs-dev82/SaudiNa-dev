-- CreateEnum
CREATE TYPE "InServiceMeetingFormat" AS ENUM ('PHYSICAL', 'ZOOM');

-- AlterTable
ALTER TABLE "in_service_meetings"
  ADD COLUMN "meetingFormat" "InServiceMeetingFormat" NOT NULL DEFAULT 'PHYSICAL',
  ADD COLUMN "venueName" TEXT,
  ADD COLUMN "city" TEXT,
  ADD COLUMN "district" TEXT,
  ADD COLUMN "address" TEXT,
  ADD COLUMN "zoomJoinUrl" TEXT,
  ADD COLUMN "zoomMeetingId" TEXT,
  ADD COLUMN "zoomPasscode" TEXT;
