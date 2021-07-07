-- rambler up
ALTER TABLE "User"
ADD COLUMN "social_link" jsonb DEFAULT '{}';

-- rambler down
ALTER TABLE "User"
DROP COLUMN "social_link";