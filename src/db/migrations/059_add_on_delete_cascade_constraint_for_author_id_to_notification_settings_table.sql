-- rambler up
ALTER TABLE "NotificationSetting"
DROP CONSTRAINT "NotificationSetting_UserId_fkey";
ALTER TABLE "NotificationSetting"
ADD CONSTRAINT "NotificationSetting_UserId_fkey"
FOREIGN KEY ("UserId")
REFERENCES "User"("id")
ON DELETE CASCADE;

-- rambler down
ALTER TABLE "NotificationSetting" ADD CONSTRAINT "NotificationSetting_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES 
"User"("id");