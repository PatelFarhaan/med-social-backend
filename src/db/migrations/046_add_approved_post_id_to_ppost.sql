-- rambler up
ALTER TABLE "PseudoPost" ADD COLUMN "approved_post_id" integer DEFAULT NULL;

-- rambler down
ALTER TABLE "PseudoPost" DROP COLUMN "approved_post_id";