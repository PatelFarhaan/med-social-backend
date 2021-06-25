-- rambler up
ALTER TABLE "PseudoPost" ADD COLUMN "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz;

-- rambler down
ALTER TABLE "PseudoPost" DROP COLUMN "updatedAt";
