-- rambler up
ALTER TABLE "PseudoUser" ADD COLUMN "deactivatedAt" timestamptz;
ALTER TABLE "PseudoUser" ADD COLUMN "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz;
ALTER TABLE "PseudoUser" ADD COLUMN "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz;

-- rambler down
ALTER TABLE "PseudoUser" DROP COLUMN "deactivatedAt";
ALTER TABLE "PseudoUser" DROP COLUMN "createdAt";
ALTER TABLE "PseudoUser" DROP COLUMN "updatedAt";