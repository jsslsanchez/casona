-- CreateTable
CREATE TABLE "Guest" (
    "identification" TEXT NOT NULL PRIMARY KEY,
    "documentType" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT,
    "hostingGuestId" TEXT,
    CONSTRAINT "Guest_hostingGuestId_fkey" FOREIGN KEY ("hostingGuestId") REFERENCES "Guest" ("identification") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "checkIn" DATETIME NOT NULL,
    "checkOut" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "numGuests" INTEGER NOT NULL,
    "totalAmount" REAL NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "paymentIntentId" TEXT,
    "guestId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest" ("identification") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_roomNumber_fkey" FOREIGN KEY ("roomNumber") REFERENCES "Room" ("roomNumber") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Room" (
    "roomNumber" TEXT NOT NULL PRIMARY KEY,
    "roomType" TEXT NOT NULL,
    "description" TEXT,
    "pricePerNight" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "features" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RoomImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "roomNumber" TEXT NOT NULL,
    CONSTRAINT "RoomImage_roomNumber_fkey" FOREIGN KEY ("roomNumber") REFERENCES "Room" ("roomNumber") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Administrator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "registryDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Guest_email_key" ON "Guest"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Administrator_email_key" ON "Administrator"("email");
