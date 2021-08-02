-- rambler up
CREATE TABLE "PaymentMethod" (
    id character varying(255) NOT NULL PRIMARY KEY,
    "name" character varying(255),
    "brend" character varying(255),
    "brand" character varying(255),
    "expire_year" integer,
    "expire_month" integer,
    "last_digits" character varying(255),
    "stripe" jsonb,
    "UserId" uuid REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "PaymentMethod";
