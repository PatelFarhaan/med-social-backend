-- rambler up

CREATE TABLE "UserInterests" (
    "InterestId" integer NOT NULL REFERENCES "Interest"("id") ON DELETE CASCADE,
    "UserId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "UserInterests";
