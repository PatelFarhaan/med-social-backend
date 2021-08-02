-- rambler up
CREATE TABLE "ChangeRequest" (
    id serial NOT NULL PRIMARY KEY,
    "token" character varying(255),
    "expires" timestamp(6) NOT NULL,
    "table" character varying(255) NOT NULL,
    "attribute" character varying(255) NOT NULL,
    "change" TEXT NOT NULL,
    "approvedById" uuid REFERENCES "User"("id") ON DELETE RESTRICT,
    "UserId" uuid REFERENCES "User"("id") ON DELETE RESTRICT,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "ChangeRequest";
