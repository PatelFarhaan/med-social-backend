-- rambler up
ALTER TABLE "User"
DROP CONSTRAINT "User_invited_by_fkey";
ALTER TABLE "User"
ADD CONSTRAINT "User_invited_by_fkey"
FOREIGN KEY ("invited_by")
REFERENCES "User"("id")
ON DELETE CASCADE;

-- rambler down
ALTER TABLE "User" ADD CONSTRAINT "User_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES 
"User"("id");