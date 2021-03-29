-- rambler up
CREATE TABLE "Post" (
    id serial NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "is_stacked" BOOLEAN DEFAULT FALSE,
    "is_quoted" BOOLEAN DEFAULT FALSE,
    "is_comment" BOOLEAN DEFAULT FALSE,
    "votes" integer NOT NULL DEFAULT 0,
    "author_id" uuid REFERENCES "User"("id"),
    "columnSlug" character varying(255)REFERENCES "Column"("slug"),
    "quoted_post" integer REFERENCES "Post"("id"),
    "parentId" integer REFERENCES "Post"("id"),
    "hierarchyLevel" integer,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "PostText" TSVECTOR
);
UPDATE "Post" SET "PostText" = to_tsvector('english', 'content');
CREATE INDEX IF NOT EXISTS post_search_idx ON "Post" USING gin("PostText");
CREATE TRIGGER post_vector_update BEFORE INSERT OR UPDATE ON "Post" FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger("PostText", 'pg_catalog.english', 'content');

-- rambler down
DROP INDEX post_search_idx ON "Post";
DROP TRIGGER post_vector_update ON "Post";
DROP TABLE "Post";
