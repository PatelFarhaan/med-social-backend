-- rambler up
ALTER TABLE "PseudoPost" ADD "PostId" integer REFERENCES "Post"("id") ON DELETE CASCADE;

-- rambler down
ALTER TABLE "PseudoPost" DROP COLUMN "PostId";