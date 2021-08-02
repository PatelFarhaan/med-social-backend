-- rambler up
ALTER TABLE "Post"
DROP CONSTRAINT "Post_author_id_fkey";
ALTER TABLE "Post"
ADD CONSTRAINT "Post_author_id_fkey"
FOREIGN KEY ("author_id")
REFERENCES "User"("id")
ON DELETE CASCADE;

-- rambler down
ALTER TABLE "Post" ADD CONSTRAINT "Post_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES 
"User"("id");