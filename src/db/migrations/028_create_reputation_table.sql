-- rambler up
CREATE TYPE reputationSources AS ENUM ('ONBOARDED', 'POSTED', 'BOOKMARKED', 'OPENED_COLUMN', 'DELETED_POST_BY_MODERATOR', 'DELETED_REPORTED_POST_BY_MODERATOR', 'VOTED', 'PROVIDED_BY_ADMIN');

CREATE TABLE "Reputation" (
    id serial NOT NULL PRIMARY KEY,
    "authorId" uuid REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "PostId" integer REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "ColumnSlug" character varying(255)REFERENCES "Column"("slug") ON DELETE CASCADE ON UPDATE CASCADE,
    "UserExpertiseId" integer REFERENCES "UserExpertise"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "source" reputationSources,
    "value" decimal(8,2) DEFAULT 0,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "Reputation";
