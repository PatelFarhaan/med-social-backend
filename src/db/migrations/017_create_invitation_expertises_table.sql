-- rambler up

CREATE TABLE "InvitationExpertises" (
    "InvitationId" integer NOT NULL REFERENCES "Invitation"("id") ON DELETE CASCADE,
    "ExpertiseId" integer NOT NULL REFERENCES "Expertise"("id") ON DELETE CASCADE,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "InvitationExpertises";
