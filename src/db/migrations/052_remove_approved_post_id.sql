-- rambler up
ALTER TABLE "PseudoPost" DROP COLUMN "approved_post_id";
ALTER TABLE "PseudoPost" ADD "PostId" integer REFERENCES "Post"("id") ON DELETE CASCADE;

-- rambler down
ALTER TABLE "PseudoPost" DROP COLUMN "PostId";
ALTER TABLE "PseudoPost" ADD "approved_post_id" integer;