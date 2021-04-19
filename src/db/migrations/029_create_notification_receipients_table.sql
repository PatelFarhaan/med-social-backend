-- rambler up
CREATE TABLE "NotificationReceipient" (
    "UserId" uuid REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "NotificationId" integer REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "NotificationReceipient";
