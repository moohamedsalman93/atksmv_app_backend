-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "role" TEXT DEFAULT 'User',
    "status" TEXT DEFAULT 'Active',
    "userId" TEXT,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "DOB" TEXT,
    "aadhar" TEXT,
    "pan" TEXT,
    "mobile" TEXT,
    "secondary_mobile" TEXT,
    "address" TEXT,
    "account_no" TEXT,
    "upi_id" TEXT,
    "account_holder" TEXT,
    "IFSC" TEXT,
    "amount" INTEGER,
    "return" INTEGER,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedOn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nominee" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "aadhar" TEXT,
    "pan" TEXT,
    "mobile" TEXT,
    "account_no" TEXT,
    "upi_id" TEXT,
    "account_holder" TEXT,
    "IFSC" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "nominee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthpackages" (
    "id" SERIAL NOT NULL,
    "packId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "years" INTEGER NOT NULL,
    "returns" INTEGER NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedOn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthpackages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anunualPackages" (
    "id" SERIAL NOT NULL,
    "packId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "years" INTEGER NOT NULL,
    "returns" INTEGER NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedOn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anunualPackages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "name" TEXT,
    "amount" INTEGER,
    "transId" TEXT,
    "packId" TEXT NOT NULL,
    "count" INTEGER,
    "status" TEXT DEFAULT 'Pending',
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedOn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawal" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedOn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Success',
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedOn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "nominee_userId_key" ON "nominee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "monthpackages_packId_key" ON "monthpackages"("packId");

-- CreateIndex
CREATE UNIQUE INDEX "anunualPackages_packId_key" ON "anunualPackages"("packId");

-- CreateIndex
CREATE UNIQUE INDEX "withdrawal_userId_key" ON "withdrawal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "history_userId_key" ON "history"("userId");

-- AddForeignKey
ALTER TABLE "nominee" ADD CONSTRAINT "nominee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
