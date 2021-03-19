-- rambler up

CREATE TABLE "BannedColumnMembers" (
    "ColumnSlug" character varying(60) NOT NULL REFERENCES "Column"("slug"),
    "UserId" uuid NOT NULL REFERENCES "User"("id"),
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "BannedColumnMembers";
