-- rambler up

CREATE TYPE gateways AS ENUM ('STRIPE');
CREATE TYPE types AS ENUM ('PAID_INVITATION', 'COLUMN');
CREATE TYPE statuses AS ENUM ('ACTIVE', 'CANCELLED', 'PENDING');

CREATE TABLE "Subscription" (
    id serial NOT NULL PRIMARY KEY,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "payment_method" jsonb,
    "payment_gateway" gateways,
    "state" statuses,
    "type" types,
    "customer_id" character varying(255),
    "subscription_id" character varying(255),
    email character varying(255) NOT NULL
);

-- rambler down
DROP TABLE "Subscription";
