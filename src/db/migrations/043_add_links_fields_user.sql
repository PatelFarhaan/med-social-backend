-- rambler up
ALTER TABLE "User" ADD COLUMN "social_link" jsonb DEFAULT '{}';
ALTER TABLE "User" ADD COLUMN "custom_link" jsonb DEFAULT '[]';

-- rambler down
ALTER TABLE "User" DROP COLUMN "social_link";
ALTER TABLE "User" DROP COLUMN "custom_link";