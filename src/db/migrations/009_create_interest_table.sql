-- rambler up

CREATE TABLE "Interest" (
    id serial NOT NULL PRIMARY KEY,
    "name" character varying(255) NOT NULL UNIQUE,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "Interest";
