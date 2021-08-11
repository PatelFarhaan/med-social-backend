-- rambler up
ALTER TABLE "Session"
DROP CONSTRAINT "Session_userId_fkey";
ALTER TABLE "Session"
ADD CONSTRAINT "Session_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE CASCADE;

-- rambler down
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES 
"User"("id");