-- AlterTable
ALTER TABLE "users" ADD COLUMN "country_code" VARCHAR(2) NOT NULL DEFAULT 'US';
ALTER TABLE "users" ADD COLUMN "country_name" VARCHAR(100) NOT NULL DEFAULT 'United States';

ALTER TABLE "users" ALTER COLUMN "country_code" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "country_name" DROP DEFAULT;
