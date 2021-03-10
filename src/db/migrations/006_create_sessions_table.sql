-- rambler up

CREATE TYPE sessionTypes AS ENUM ('ACCESS', 'REFRESH', 'RESET_PASSWORD', 'MAGIC_LINK');

CREATE TABLE "Session" (
	"token" varchar NOT NULL PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES "User"("id"),
  "type" sessionTypes,
	"expires" timestamp(6) NOT NULL,
  "blackListed" BOOLEAN DEFAULT FALSE,
  "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
  "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down

DROP TABLE session;