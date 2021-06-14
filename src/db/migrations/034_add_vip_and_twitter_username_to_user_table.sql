-- rambler up
ALTER TABLE "User"
ADD COLUMN "vip" boolean NOT NULL DEFAULT false,
ADD COLUMN "twitterUsername" character varying(255) NOT NULL UNIQUE;

-- rambler down
ALTER TABLE "Post"
DROP COLUMN "vip",
DROP COLUMN "twitterUsername";
