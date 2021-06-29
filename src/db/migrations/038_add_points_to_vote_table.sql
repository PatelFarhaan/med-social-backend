-- rambler up
ALTER TABLE "Vote"
ADD COLUMN "points" integer DEFAULT 0;

-- rambler down
ALTER TABLE "Vote"
DROP COLUMN "points";
