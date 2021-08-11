-- rambler up
ALTER TABLE "Column"
DROP CONSTRAINT "Column_authorId_fkey";
ALTER TABLE "Column"
ADD CONSTRAINT "Column_authorId_fkey"
FOREIGN KEY ("authorId")
REFERENCES "User"("id")
ON DELETE CASCADE;

-- rambler down
ALTER TABLE "Column" ADD CONSTRAINT "Column_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES 
"User"("id");