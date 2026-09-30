-- CreateTable
CREATE TABLE "throttle" (
    "key" VARCHAR(100) NOT NULL,
    "count" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "throttle_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "throttle_expiresAt_idx" ON "throttle"("expiresAt");
