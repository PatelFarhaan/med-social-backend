-- rambler up
CREATE TABLE "File" (
    id serial NOT NULL PRIMARY KEY,
    "mimeType" character varying(255) NOT NULL,
    "filename" character varying(255) NOT NULL,
    "location" text NOT NULL,
    "success" boolean NOT NULL,
    "UserId" uuid REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "PostId" integer REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "ColumnSlug" character varying(255) REFERENCES "Column"("slug") ON DELETE CASCADE ON UPDATE CASCADE,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "File";
