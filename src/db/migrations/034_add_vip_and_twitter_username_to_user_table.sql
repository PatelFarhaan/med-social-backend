-- rambler up
ALTER TABLE "User"
ADD COLUMN "vip" boolean DEFAULT false,
ADD COLUMN "twitterUsername" character varying(255);

-- rambler down
ALTER TABLE "Post"
DROP COLUMN "vip",
DROP COLUMN "twitterUsername";
