-- rambler up
ALTER TABLE "User" ADD COLUMN "stripe_price_id" character varying(150);

-- rambler down
ALTER TABLE "User" DROP COLUMN "stripe_price_id";