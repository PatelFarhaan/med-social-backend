-- rambler up
-- Name: News; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "News" (
    id serial NOT NULL PRIMARY KEY,
    "headline" character varying(255) UNIQUE NOT NULL,
    "slug" character varying(255) NOT NULL,
    "publisher" character varying(255) NOT NULL,
    "link" character varying(255) NOT NULL,
    "UserId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,    
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down

DROP TABLE "News";