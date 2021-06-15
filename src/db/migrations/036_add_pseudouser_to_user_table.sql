-- rambler up
ALTER TABLE "User"
ADD COLUMN "pseudouser" boolean DEFAULT false;

-- rambler down
ALTER TABLE "Post"
DROP COLUMN "pseudouser";
