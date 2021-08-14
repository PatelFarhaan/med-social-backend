-- rambler up
ALTER TYPE types ADD VALUE 'USER';
ALTER TABLE "Subscription" 
    ADD COLUMN "paid" boolean DEFAULT false,
    ADD COLUMN "SubscriptionUserId" uuid REFERENCES "User"("id") ON DELETE CASCADE;

-- rambler down
ALTER TABLE "Subscription" 
    DROP COLUMN "paid", 
    DROP COLUMN "SubscriptionUserId";