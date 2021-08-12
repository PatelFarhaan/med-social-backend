-- rambler up
CREATE TABLE "Follow" (
    id serial NOT NULL PRIMARY KEY,
    "FollowerId" uuid REFERENCES "User"("id") ON DELETE CASCADE,
    "FollowingId" uuid REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "Follow";
