-- rambler up

CREATE TABLE "UserInterests" (
    "InterestId" integer NOT NULL REFERENCES "Interest"("id"),
    "UserId" integer NOT NULL REFERENCES "User"("id"),
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "UserInterests";
