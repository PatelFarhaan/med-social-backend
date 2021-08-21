-- rambler up
-- Name: SimplePage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "SimplePage" (
    id serial NOT NULL PRIMARY KEY,
    "pageName" character varying(255) NOT NULL, 
    "slug" character varying(255) NOT NULL, 
    "effectiveDate" timestamptz,
    "content" text NOT NULL, 
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down

DROP TABLE "SimplePage";