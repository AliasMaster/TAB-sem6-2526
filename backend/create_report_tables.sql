CREATE TABLE IF NOT EXISTS "CourseSales" (
    "Id" UUID PRIMARY KEY,
    "CourseId" UUID NOT NULL,
    "UserId" UUID NOT NULL,
    "Price" DECIMAL(10,2) NOT NULL,
    "PurchasedAt" TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "UserActivities" (
    "Id" UUID PRIMARY KEY,
    "UserId" UUID NOT NULL,
    "Type" INT NOT NULL,
    "ActivityDate" TIMESTAMP NOT NULL
);

GRANT ALL PRIVILEGES ON TABLE "CourseSales" TO report_user;
GRANT ALL PRIVILEGES ON TABLE "UserActivities" TO report_user;
