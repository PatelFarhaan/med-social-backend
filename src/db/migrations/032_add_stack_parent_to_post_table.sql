-- rambler up
ALTER TABLE "Post"
ADD COLUMN "stackParentId" integer REFERENCES "Post"("id");

-- rambler down
ALTER TABLE "Post"
DROP COLUMN "stackParentId";
