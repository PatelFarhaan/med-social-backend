-- rambler up
-- Name: NotificationSettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "NotificationSettings" (
    id serial NOT NULL PRIMARY KEY,
    "pushNotifications" BOOLEAN DEFAULT TRUE,
    "upVote" BOOLEAN DEFAULT TRUE,
    "downVote" BOOLEAN DEFAULT TRUE,
    "repliesAndQuotes" BOOLEAN DEFAULT TRUE,
    "bookmarks" BOOLEAN DEFAULT TRUE,
    "columns" BOOLEAN DEFAULT TRUE,
    "invitations" BOOLEAN DEFAULT TRUE,
    "yourReputation" BOOLEAN DEFAULT TRUE,
    "reminders" BOOLEAN DEFAULT TRUE,
    "admin" BOOLEAN DEFAULT TRUE,
    "UserId" uuid NOT NULL REFERENCES "User"("id"),
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "NotificationSettings";
