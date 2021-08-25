-- rambler up
-- Name: Dispatch; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "Dispatch" (
    id serial NOT NULL PRIMARY KEY,
    "title" character varying(255) UNIQUE NOT NULL,
    "slug" character varying(255) NOT NULL,
    "about" TEXT,
    "content" TEXT NOT NULL,
    "imageLink" character varying(255) NOT NULL,
    "UserId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,    
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down

DROP TABLE "Dispatch";