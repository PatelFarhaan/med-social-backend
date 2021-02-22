-- rambler up

CREATE TABLE "Multipotentiality" (
    "InterestId" integer NOT NULL REFERENCES "Interest"("id"),
    "ExpertiseId" integer NOT NULL REFERENCES "Expertise"("id"),
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "Multipotentiality";
