-- rambler up

CREATE TABLE "BannedColumnMembers" (
    "ColumnSlug" character varying(255) NOT NULL REFERENCES "Column"("slug") ON DELETE CASCADE,
    "UserId" uuid NOT NULL REFERENCES "User"("id"),
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "BannedColumnMembers";
