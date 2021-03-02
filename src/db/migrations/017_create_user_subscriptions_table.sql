-- rambler up

CREATE TABLE "UserSubscriptions" (
    "UserId" uuid NOT NULL REFERENCES "User"("id"),
    "SubscriptionId" integer NOT NULL REFERENCES "Subscription"("id"),
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "UserSubscriptions";
