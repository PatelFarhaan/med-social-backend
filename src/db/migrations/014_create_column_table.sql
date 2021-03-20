-- rambler up

CREATE TYPE visibilityTypes AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE columnStatuses AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVIEWED', 'CANCELED');
CREATE TYPE columnTypes AS ENUM ('PAID', 'FREE');

CREATE TABLE "Column" (
    "slug" character varying(60) NOT NULL PRIMARY KEY,
    "name" character varying(42) NOT NULL UNIQUE,
    "description" character varying(280) NOT NULL,
    "price" decimal(10,2) DEFAULT 0,
    "visibility" visibilityTypes DEFAULT 'PUBLIC',
    "state" columnStatuses DEFAULT 'PENDING',
    "type" columnTypes DEFAULT 'FREE',
    "stripe_price_id" character varying(150),
    "authorId" uuid REFERENCES "User"("id"),
    "ExpertiseId" integer REFERENCES "Expertise"("id"),
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "Column";
