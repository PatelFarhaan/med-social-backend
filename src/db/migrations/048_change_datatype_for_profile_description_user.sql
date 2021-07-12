-- rambler up
ALTER TABLE "User" ALTER COLUMN "profile_description" TYPE TEXT;

-- rambler down
ALTER TABLE "User" ALTER COLUMN "profile_description" TYPE VARCHAR(150);