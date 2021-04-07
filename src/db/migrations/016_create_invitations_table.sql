-- rambler up

CREATE TYPE states AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'CLOSED', 'COMPLETED', 'REQUESTED');
CREATE TYPE subscriptionModels AS ENUM ('FREE', 'PAID');
CREATE TYPE invitationTypes AS ENUM ('REGULAR', 'PAID', 'FELLOW');


CREATE TABLE "Invitation" (
    id serial NOT NULL PRIMARY KEY,
    "token" character varying(255) UNIQUE,
    email character varying(255) NOT NULL,
    "is_private" BOOLEAN DEFAULT FALSE,
    "special" BOOLEAN DEFAULT FALSE,
    "reason" character varying(50),
    "note" character varying(134),
    "verification_link" character varying(254),
    "first_name" character varying(50),
    "last_name" character varying(50),
    "state" states,
    "subscription_model" subscriptionModels,
    "type" invitationTypes,
    "created_by" uuid REFERENCES "User"("id"),
    "approved_by" uuid REFERENCES "User"("id"),
    "ColumnSlug" character varying(255) REFERENCES "Column"("slug"),
    "subscriptionId" integer REFERENCES "Subscription"("id"),
    "expires_at" timestamptz,
    "sample_posts" jsonb NOT NULL DEFAULT '[]',
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "Invitation";
