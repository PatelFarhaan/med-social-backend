-- rambler up
ALTER TABLE "PseudoPost" ALTER COLUMN "reply_to" DROP NOT NULL;

-- rambler down
ALTER TABLE "PseudoPost" ALTER COLUMN "reply_to" SET NOT NULL;