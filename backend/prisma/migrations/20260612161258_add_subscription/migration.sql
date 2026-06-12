-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'PAUSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "gateway" TEXT NOT NULL DEFAULT 'mercadopago',
    "gatewayId" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "amountCents" INTEGER NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_professorId_key" ON "Subscription"("professorId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_gatewayId_key" ON "Subscription"("gatewayId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
