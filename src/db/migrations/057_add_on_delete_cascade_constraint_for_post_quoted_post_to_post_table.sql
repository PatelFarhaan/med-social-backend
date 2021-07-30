-- rambler up
ALTER TABLE "Post"
DROP CONSTRAINT "Post_quoted_post_fkey";
ALTER TABLE "Post"
ADD CONSTRAINT "Post_quoted_post_fkey"
FOREIGN KEY ("quoted_post")
REFERENCES "Post"("id")
ON DELETE CASCADE;

-- rambler down
ALTER TABLE "Post" ADD CONSTRAINT "Post_quoted_post_fkey" FOREIGN KEY ("quoted_post") REFERENCES 
"Post"("id");