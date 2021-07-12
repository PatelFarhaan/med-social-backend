-- rambler up
ALTER TABLE "PseudoUser" ADD COLUMN "expertises" jsonb DEFAULT '[]';

-- rambler down
ALTER TABLE "PseudoUser" DROP COLUMN "expertises";