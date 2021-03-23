-- rambler up
CREATE TYPE voteTypes AS ENUM ('UP', 'DOWN');

CREATE TABLE "Vote" (
    id serial NOT NULL PRIMARY KEY,
    "userVotesId" uuid REFERENCES "User"("id"),
    "votesId" integer REFERENCES "Post"("id"),
    "type" voteTypes,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "Vote";
