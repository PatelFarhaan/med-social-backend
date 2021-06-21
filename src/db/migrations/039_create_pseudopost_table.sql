-- rambler up

CREATE TABLE "PseudoPost" (
    "id" integer NOT NULL PRIMARY KEY,
    "conversation_id" character varying(255) NOT NULL,
    "created_at" character varying(255) NOT NULL,
    "date" character varying(255) NOT NULL,
    "time" character varying(255) NOT NULL,
    "timezone" character varying(255) NOT NULL,
    "user_id" character varying(255) NOT NULL,
    "username" character varying(255) NOT NULL,
    "place" character varying(255) NOT NULL,
    "tweet" TEXT NOT NULL,
    "language" character varying(255) NOT NULL,
    "mentions" jsonb NOT NULL DEFAULT '[]',
    "urls" TEXT [],
    "photos" TEXT [],
    "replies_count" integer NOT NULL,
    "retweets_count" integer NOT NULL,
    "likes_count" integer NOT NULL,
    "hashtags" TEXT [],
    "cashtags" TEXT [],
    "link" TEXT NOT NULL,
    "retweet" boolean NOT NULL,
    "quote_url" TEXT,
    "video" integer,
    "thumbnail" TEXT,
    "near" TEXT,
    "geo" TEXT,
    "source" TEXT,
    "user_rt_id" character varying(255),
    "user_rt" TEXT,
    "retweet_id" character varying(255),
    "reply_to" jsonb NOT NULL DEFAULT '[]',
    "retweet_date" TEXT,
    "translate" TEXT,
    "trans_src" TEXT,
    "trans_dest" TEXT
);

-- rambler down
DROP TABLE "PseudoPost";
