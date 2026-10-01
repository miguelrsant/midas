-- O adiantamento só aponta para um salário da mesma pessoa: a chave leva o userId junto,
-- e apagar o salário de uma conta nunca alcança fixos de outra.

-- DropForeignKey
ALTER TABLE "recurring" DROP CONSTRAINT "recurring_salaryId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "recurring_id_userId_key" ON "recurring"("id", "userId");

-- AddForeignKey
ALTER TABLE "recurring" ADD CONSTRAINT "recurring_salaryId_userId_fkey" FOREIGN KEY ("salaryId", "userId") REFERENCES "recurring"("id", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

