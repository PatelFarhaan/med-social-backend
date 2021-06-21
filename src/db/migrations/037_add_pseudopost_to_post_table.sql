-- rambler up
ALTER TABLE "Post"
ADD COLUMN "pseudopost" boolean DEFAULT false;

-- rambler down
ALTER TABLE "Post"
DROP COLUMN "pseudopost";
