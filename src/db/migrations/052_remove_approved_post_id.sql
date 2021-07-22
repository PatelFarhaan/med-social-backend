-- rambler up
ALTER TABLE "PsuedoPost" DROP COLUMN "approve_post_id";
ALTER TABLE "PsuedoPost" ADD "PostId" integer REFERENCES "Post"("id");

-- rambler down
ALTER TABLE "PsuedoPost" DROP COLUMN "PostId";
ALTER TABLE "PsuedoPost" ADD "approve_post_id" integer;