-- rambler up
CREATE TYPE reportedContentStatuses AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "ReportedContent" (
    id serial NOT NULL PRIMARY KEY,
    "reporterId" uuid REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "approvedById" uuid REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "PostId" integer REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "columnSlug" character varying(255)REFERENCES "Column"("slug") ON DELETE CASCADE ON UPDATE CASCADE,
    "state" reportedContentStatuses,
    "reason" TEXT NOT NULL,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "ReportedContent";
