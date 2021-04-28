-- rambler up
ALTER TABLE "Notification"
ADD COLUMN "isRead" boolean NOT NULL DEFAULT false;

-- rambler down
ALTER TABLE "Notification"
DROP COLUMN "isRead";
