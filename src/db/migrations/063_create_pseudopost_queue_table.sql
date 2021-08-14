-- rambler up
CREATE TYPE pseudoPostQueueStates AS ENUM ('PENDING', 'ACTIVE', 'STALLED', 'COMPLETED');

CREATE TABLE "PseudoPostQueue" (
    id serial NOT NULL PRIMARY KEY,
    "conversationId" character varying(255) NOT NULL,
    "ColumnSlug" character varying(255) NOT NULL,
    "username" character varying(255) NOT NULL,
    "state" pseudoPostQueueStates DEFAULT 'PENDING',
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "PseudoPostQueue";
