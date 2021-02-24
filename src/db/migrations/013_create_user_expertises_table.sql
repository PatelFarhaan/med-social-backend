-- rambler up

CREATE TABLE "UserExpertises" (
    "ExpertiseId" integer NOT NULL REFERENCES "Expertise"("id"),
    "UserId" uuid NOT NULL REFERENCES "User"("id"),
    "totalPoints" integer DEFAULT 0,
    "isPrimary" boolean,
    "isSecondary" boolean,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "UserExpertises";
