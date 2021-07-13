-- rambler up
ALTER TABLE "PseudoPost" ALTER COLUMN "reply_to" DROP DEFAULT;

-- rambler down
ALTER TABLE "PseudoPost" ALTER COLUMN "reply_to" SET DEFAULT '[]';