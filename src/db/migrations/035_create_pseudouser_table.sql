-- rambler up

CREATE TABLE "PseudoUser" (
    "username" character varying(255) NOT NULL PRIMARY KEY,
    "id" character varying(255) NOT NULL,
    "name" character varying(255) NOT NULL,
    "bio" TEXT,
    "location" TEXT,
    "url" TEXT NOT NULL,
    "join_date" character varying(255) NOT NULL,
    "join_time" character varying(255) NOT NULL,
    "tweets" integer NOT NULL,
    "following" integer NOT NULL,
    "followers" integer NOT NULL,
    "likes" integer,
    "media" integer,
    "private" boolean NOT NULL,
    "verified" boolean NOT NULL,
    "profile_image_url" TEXT,
    "background_image" TEXT,
    "active" boolean NOT NULL DEFAULT TRUE,
    "expertises" jsonb DEFAULT '[]'
);

-- rambler down
DROP TABLE "PseudoUser";
