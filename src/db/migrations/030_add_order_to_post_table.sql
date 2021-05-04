-- rambler up
ALTER TABLE "Post"
ADD COLUMN "order" integer NOT NULL DEFAULT 0;

-- rambler down
ALTER TABLE "Post"
DROP COLUMN "order";
