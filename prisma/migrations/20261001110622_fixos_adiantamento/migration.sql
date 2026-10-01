-- AlterTable
ALTER TABLE "recurring" ADD COLUMN     "salaryId" UUID;

-- CreateIndex
CREATE INDEX "recurring_salaryId_idx" ON "recurring"("salaryId");

-- AddForeignKey
ALTER TABLE "recurring" ADD CONSTRAINT "recurring_salaryId_fkey" FOREIGN KEY ("salaryId") REFERENCES "recurring"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Um adiantamento nunca aponta para si mesmo.
ALTER TABLE "recurring" ADD CONSTRAINT "recurring_salary_check" CHECK ("salaryId" IS NULL OR "salaryId" <> "id");
