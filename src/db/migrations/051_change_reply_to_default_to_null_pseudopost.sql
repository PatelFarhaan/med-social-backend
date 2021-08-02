-- rambler up
ALTER TABLE "PseudoUser" ADD COLUMN "permission_file_url" text;

-- rambler down
ALTER TABLE "PseudoUser" ADD COLUMN "permission_file_url";