-- rambler up

CREATE TABLE "UserExpertise" (
    id serial NOT NULL PRIMARY KEY,
    "ExpertiseId" integer NOT NULL REFERENCES "Expertise"("id") ON DELETE CASCADE,
    "UserId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "totalPoints" integer DEFAULT 0,
    "isPrimary" boolean,
    "isSecondary" boolean,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "UserExpertise";
