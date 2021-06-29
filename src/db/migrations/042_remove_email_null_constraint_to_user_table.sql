-- rambler up
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

-- rambler down
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
