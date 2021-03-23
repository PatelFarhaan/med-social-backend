-- rambler up
CREATE TABLE "PostTreePath" (
    id serial NOT NULL PRIMARY KEY,
    "depth" integer DEFAULT 0 NOT NULL,
    "ancestorId" integer REFERENCES "Post"("id"),
    "descendantId" integer REFERENCES "Post"("id"),
    "rootPostId" integer REFERENCES "Post"("id"),
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "PostTreePath";
