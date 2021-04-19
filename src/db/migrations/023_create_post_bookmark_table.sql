-- rambler up
CREATE TABLE "PostBookmark" (
    id serial NOT NULL PRIMARY KEY,
    "userId" uuid REFERENCES "User"("id") ON DELETE CASCADE,
    "postId" integer REFERENCES "Post"("id") ON DELETE CASCADE,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "deletedAt" timestamptz
);

-- rambler down
DROP TABLE "PostBookmark";
