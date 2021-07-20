-- rambler up
ALTER TABLE "User" ADD COLUMN "title" character varying(255);

-- rambler down
ALTER TABLE "User" DROP COLUMN "title";