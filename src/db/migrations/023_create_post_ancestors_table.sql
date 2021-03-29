-- rambler up
CREATE TABLE "Postsancestors" (
    "ancestorId" integer NOT NULL REFERENCES "Post"("id") ON DELETE CASCADE,
    "PostId" integer NOT NULL REFERENCES "Post"("id") ON DELETE CASCADE
);

-- rambler down
DROP TABLE "Postsancestors";
