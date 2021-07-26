-- rambler up
ALTER TABLE "Post"
DROP CONSTRAINT "Post_parentId_fkey";
ALTER TABLE "Post"
ADD CONSTRAINT "Post_parentId_fkey"
FOREIGN KEY ("parentId")
REFERENCES "Post"("id")
ON DELETE CASCADE;

-- rambler down
ALTER TABLE "Post" ADD CONSTRAINT "Post_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES 
"Post"("id");