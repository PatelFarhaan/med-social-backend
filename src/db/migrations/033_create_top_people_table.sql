-- rambler up
CREATE TABLE "TopPeople" (
    id serial NOT NULL PRIMARY KEY,
    "UserId" uuid REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "ColumnSlug" character varying(255)REFERENCES "Column"("slug") ON DELETE CASCADE ON UPDATE CASCADE,
    "order" integer NOT NULL DEFAULT 0,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "TopPeople";
