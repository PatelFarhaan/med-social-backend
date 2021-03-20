-- rambler up

CREATE TABLE "ColumnInterests" (
    "ColumnSlug" character varying(60) NOT NULL REFERENCES "Column"("slug"),
    "InterestId" integer NOT NULL REFERENCES "Interest"("id"),
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "ColumnInterests";
