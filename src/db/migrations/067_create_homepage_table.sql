-- rambler up
-- Name: Homepage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "Homepage" (
    id serial NOT NULL PRIMARY KEY,
    "taglineMain" character varying(255), 
    "headlineMain" character varying(255), 
    "tag1" character varying(255), 
    "tag2" character varying(255), 
    "tag3" character varying(255), 
    "tag4" character varying(255), 
    "tag5" character varying(255), 
    "tag6" character varying(255), 
    "headline1" character varying(255), 
    "content1" text, 
    "headline2" character varying(255), 
    "content2" text, 
    "headline3" character varying(255), 
    "content3" text, 
    "taglineUnderAsset" character varying(255), 
    "headline4" character varying(255), 
    "content4" text, 
    "headline5" character varying(255), 
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down

DROP TABLE "Homepage";