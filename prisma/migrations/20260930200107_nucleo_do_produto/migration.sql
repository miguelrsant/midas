-- CreateEnum
CREATE TYPE "EntryKind" AS ENUM ('EXPENSE', 'INCOME');

-- CreateEnum
CREATE TYPE "CalculatorKind" AS ENUM ('VACATION', 'THIRTEENTH', 'TERMINATION', 'NET_SALARY', 'UNEMPLOYMENT');

-- AlterEnum
ALTER TYPE "SecurityEventType" ADD VALUE 'DATA_EXPORTED';

-- CreateTable
CREATE TABLE "entry" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "EntryKind" NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "categoryId" VARCHAR(40) NOT NULL,
    "description" TEXT,
    "date" DATE NOT NULL,
    "recurringId" UUID,
    "occurrenceMonth" CHAR(7),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "EntryKind" NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "categoryId" VARCHAR(40) NOT NULL,
    "description" TEXT,
    "dayOfMonth" SMALLINT NOT NULL,
    "startMonth" CHAR(7) NOT NULL,
    "endMonth" CHAR(7),
    "nextOccurrenceOn" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_category" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "EntryKind" NOT NULL,
    "systemId" VARCHAR(40),
    "sealed" TEXT,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_limit" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" VARCHAR(40) NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_limit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculation" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "CalculatorKind" NOT NULL,
    "sealed" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expected_income" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" VARCHAR(40) NOT NULL,
    "labelKey" VARCHAR(40) NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "dueDate" DATE NOT NULL,
    "calculationId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expected_income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preference" (
    "userId" TEXT NOT NULL,
    "lastSummaryOpenedMonth" CHAR(7),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preference_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "deleted_account" (
    "id" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deleted_account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "entry_userId_date_idx" ON "entry"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "entry_recurringId_occurrenceMonth_key" ON "entry"("recurringId", "occurrenceMonth");

-- CreateIndex
CREATE INDEX "recurring_userId_nextOccurrenceOn_idx" ON "recurring"("userId", "nextOccurrenceOn");

-- CreateIndex
CREATE INDEX "user_category_userId_idx" ON "user_category"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_category_userId_systemId_key" ON "user_category"("userId", "systemId");

-- CreateIndex
CREATE UNIQUE INDEX "category_limit_userId_categoryId_key" ON "category_limit"("userId", "categoryId");

-- CreateIndex
CREATE INDEX "calculation_userId_createdAt_idx" ON "calculation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "expected_income_userId_dueDate_idx" ON "expected_income"("userId", "dueDate");

-- CreateIndex
CREATE INDEX "deleted_account_deletedAt_idx" ON "deleted_account"("deletedAt");

-- AddForeignKey
ALTER TABLE "entry" ADD CONSTRAINT "entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry" ADD CONSTRAINT "entry_recurringId_fkey" FOREIGN KEY ("recurringId") REFERENCES "recurring"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring" ADD CONSTRAINT "recurring_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_category" ADD CONSTRAINT "user_category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_limit" ADD CONSTRAINT "category_limit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculation" ADD CONSTRAINT "calculation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expected_income" ADD CONSTRAINT "expected_income_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expected_income" ADD CONSTRAINT "expected_income_calculationId_fkey" FOREIGN KEY ("calculationId") REFERENCES "calculation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preference" ADD CONSTRAINT "user_preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Regras que o Prisma não expressa: valores, dias, meses e tamanhos de cifra.
-- Um lançamento de R$ 0,00 ou negativo nunca entra, nem por SQL direto.
ALTER TABLE "entry"
  ADD CONSTRAINT "entry_amount_check" CHECK ("amountCents" BETWEEN 1 AND 999999999),
  ADD CONSTRAINT "entry_date_check" CHECK ("date" BETWEEN DATE '2000-01-01' AND DATE '2100-12-31'),
  ADD CONSTRAINT "entry_occurrence_month_check" CHECK ("occurrenceMonth" IS NULL OR "occurrenceMonth" ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  ADD CONSTRAINT "entry_description_check" CHECK ("description" IS NULL OR length("description") <= 400),
  ADD CONSTRAINT "entry_category_check" CHECK ("categoryId" ~ '^([a-z]+(-[a-z]+)*|u-[0-9a-f-]{36})$');

ALTER TABLE "recurring"
  ADD CONSTRAINT "recurring_amount_check" CHECK ("amountCents" BETWEEN 1 AND 999999999),
  ADD CONSTRAINT "recurring_day_check" CHECK ("dayOfMonth" BETWEEN 1 AND 31),
  ADD CONSTRAINT "recurring_start_check" CHECK ("startMonth" ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  ADD CONSTRAINT "recurring_end_check" CHECK ("endMonth" IS NULL OR ("endMonth" ~ '^[0-9]{4}-(0[1-9]|1[0-2])$' AND "endMonth" >= "startMonth")),
  ADD CONSTRAINT "recurring_description_check" CHECK ("description" IS NULL OR length("description") <= 400),
  ADD CONSTRAINT "recurring_category_check" CHECK ("categoryId" ~ '^([a-z]+(-[a-z]+)*|u-[0-9a-f-]{36})$');

ALTER TABLE "user_category"
  ADD CONSTRAINT "user_category_sealed_check" CHECK ("sealed" IS NULL OR length("sealed") <= 400);

ALTER TABLE "category_limit"
  ADD CONSTRAINT "category_limit_amount_check" CHECK ("amountCents" BETWEEN 1 AND 999999999);

ALTER TABLE "calculation"
  ADD CONSTRAINT "calculation_sealed_check" CHECK (length("sealed") <= 20000);

ALTER TABLE "expected_income"
  ADD CONSTRAINT "expected_income_amount_check" CHECK ("amountCents" BETWEEN 1 AND 999999999),
  ADD CONSTRAINT "expected_income_label_check" CHECK ("labelKey" ~ '^[a-z0-9-]+$');

ALTER TABLE "user_preference"
  ADD CONSTRAINT "user_preference_month_check" CHECK ("lastSummaryOpenedMonth" IS NULL OR "lastSummaryOpenedMonth" ~ '^[0-9]{4}-(0[1-9]|1[0-2])$');
