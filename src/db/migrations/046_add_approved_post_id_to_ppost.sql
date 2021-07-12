-- rambler up
ALTER TABLE "PseudoPost" ADD COLUMN "approved_post_id" serial;

-- rambler down
ALTER TABLE "PseudoPost" DROP COLUMN "approved_post_id";