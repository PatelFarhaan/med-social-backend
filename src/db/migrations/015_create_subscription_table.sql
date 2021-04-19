-- rambler up

CREATE TYPE gateways AS ENUM ('STRIPE');
CREATE TYPE types AS ENUM ('PAID_INVITATION', 'COLUMN');
CREATE TYPE statuses AS ENUM ('ACTIVE', 'CANCELLED', 'PENDING');
CREATE TYPE cycles AS ENUM ('DAY', 'MONTH', 'QUARTER', 'ANNUAL', 'FOREVER');

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
    email character varying(255),
    "amountPerCycle" decimal(10, 2) DEFAULT 0,
    "cycle" cycles DEFAULT 'MONTH',
    "cycleLength" integer DEFAULT 1,
    "ColumnSlug" character varying(255) REFERENCES "Column"("slug") ON DELETE CASCADE,
    "UserId" uuid REFERENCES "User"("id") ON DELETE CASCADE
);

-- rambler down
DROP TABLE "Subscription";
