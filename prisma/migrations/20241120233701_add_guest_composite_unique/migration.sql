/*
  Warnings:

  - A unique constraint covering the columns `[identification,documentType]` on the table `Guest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Guest_identification_documentType_key" ON "Guest"("identification", "documentType");
