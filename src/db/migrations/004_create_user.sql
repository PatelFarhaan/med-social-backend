-- rambler up

CREATE TABLE "User" (
    id uuid NOT NULL PRIMARY KEY,
    "lookupId" character varying(255) UNIQUE,
    email character varying(255) NOT NULL,
    "first_name" character varying(255),
    "last_name" character varying(255),
    "fullName" character varying(255),
    name character varying(255),
    hash character varying(255),
    "roleId" integer NOT NULL REFERENCES "Role"("id"),
    "invited_by" uuid REFERENCES "User"("id"),
    settings jsonb NOT NULL DEFAULT '{}',
    "username" character varying(150),
    "profile_picture" text,
    "is_anonymous_user" boolean,
    "invitation_limit" integer,
    "stripe_user_id" character varying(150),
    "stripe_customer_id" character varying(150),
    payment_method jsonb,
    "notifications_seen_at" timestamptz,
    "muted_notification_categories" character varying(64) [],
    "profile_description" character varying(150),
    "deactivatedAt" timestamptz,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down

DROP TABLE "User";
