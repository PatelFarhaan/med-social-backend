-- rambler up
CREATE TYPE notificationTypes AS ENUM ('UPVOTED', 'DOWNVOTED', 'REPLIED_TO_POST', 'REPLIED_TO_REPLY', 'QUOTED_POST', 'MENTIONED', 'COLUMN_INVITATION', 'REMOVED_FROM_COLUMN', 'INVITATION_ACCEPTED', 'INVITATION_EXPIRED', 'REACHED_LEVEL', 'WRITE_POST_REMINDER', 'WRITE_COLUMN_REMINDER', 'LEFT_INVITATIONS_REMINDER', 'COLUMN_APPROVED_BY_ADMIN', 'REPORTED_POST', 'NEW_COLUMN_SUBSCRIPTION', 'BOOKMARKED_POST', 'INVITATION_LIMIT_REMINDER', 'SUBSCRIPTION_EXTENDED', 'DOWNGRADED_LEVEL', 'INVITE_TO_COLUMN');
CREATE TYPE notificationCategories AS ENUM ('VOTES', 'REPLIES', 'BOOKMARKS', 'COLUMNS', 'INVITATION', 'ADMIN', 'SUBSCRIPTION');

CREATE TABLE "Notification" (
    id serial NOT NULL PRIMARY KEY,
    "UserId" uuid REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "authorId" uuid REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "PostId" integer REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "ColumnSlug" character varying(255)REFERENCES "Column"("slug") ON DELETE CASCADE ON UPDATE CASCADE,
    "type" notificationTypes,
    "data" jsonb,
    "category" notificationCategories,
    "value" decimal(8,2) DEFAULT 0,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "Notification";
