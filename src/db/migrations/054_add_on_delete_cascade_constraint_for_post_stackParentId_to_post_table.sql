-- rambler up
ALTER TABLE "Post"
DROP CONSTRAINT "Post_stackParentId_fkey";
ALTER TABLE "Post"
ADD CONSTRAINT "Post_stackParentId_fkey"
FOREIGN KEY ("stackParentId")
REFERENCES "Post"("id")
ON DELETE CASCADE;

-- rambler down
ALTER TABLE "Post" ADD CONSTRAINT "Post_stackParentId_fkey" FOREIGN KEY ("stackParentId") REFERENCES 
"Post"("id");