-- rambler up

CREATE TABLE "PseudoPost" (
    "id" integer NOT NULL PRIMARY KEY,
    "name" character varying(255) NOT NULL,
    "username" character varying(255) NOT NULL,
    "bio" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "join_date" character varying(255) NOT NULL,
    "join_time" character varying(255) NOT NULL,
    "tweets" integer NOT NULL,
    "following" integer NOT NULL,
    "followers" integer NOT NULL,
    "likes" integer NOT NULL,
    "media" integer NOT NULL,
    "private" boolean NOT NULL,
    "verified" boolean NOT NULL,
    "profile_image_url" TEXT NOT NULL,
    "background_image" TEXT NOT NULL,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "PseudoPost";
