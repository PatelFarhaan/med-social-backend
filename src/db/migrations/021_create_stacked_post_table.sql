-- rambler up
CREATE TABLE "StackedPost" (
    id serial NOT NULL PRIMARY KEY,
    "order" integer DEFAULT 0 NOT NULL,
    "stackedChildrenId" integer REFERENCES "Post"("id") ON DELETE CASCADE,
    "PostId" integer REFERENCES "Post"("id") ON DELETE CASCADE,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "StackedPost";
