-- rambler up
CREATE TYPE voteTypes AS ENUM ('UP', 'DOWN');

CREATE TABLE "Vote" (
    id serial NOT NULL PRIMARY KEY,
    "userId" uuid REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "postId" integer REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "type" voteTypes,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "Vote";
