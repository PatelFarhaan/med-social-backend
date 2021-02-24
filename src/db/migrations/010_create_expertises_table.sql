-- rambler up


CREATE TABLE "Expertise" (
    id serial NOT NULL PRIMARY KEY,
    "name" character varying(255) NOT NULL UNIQUE,
    "isApproved" BOOLEAN DEFAULT FALSE,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "Expertise";
