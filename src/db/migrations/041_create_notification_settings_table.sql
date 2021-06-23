-- rambler up
-- Name: NotificationSettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "NotificationSettings" (
    id serial NOT NULL PRIMARY KEY,
    "pushNotifications" BOOLEAN DEFAULT FALSE,
    "upVote" BOOLEAN DEFAULT FALSE,
    "downVote" BOOLEAN DEFAULT FALSE,
    "repliesAndQuotes" BOOLEAN DEFAULT FALSE,
    "bookmarks" BOOLEAN DEFAULT FALSE,
    "columns" BOOLEAN DEFAULT FALSE,
    "invitations" BOOLEAN DEFAULT FALSE,
    "yourReputation" BOOLEAN DEFAULT FALSE,
    "reminders" BOOLEAN DEFAULT FALSE,
    "admin" BOOLEAN DEFAULT FALSE,
    "userId" uuid NOT NULL REFERENCES "User"("id"),
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
);

-- rambler down
DROP TABLE "NotificationSettings";
