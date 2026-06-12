-- CreateTable
CREATE TABLE "SavedDocument" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pdfName" TEXT NOT NULL,
    "pdfData" TEXT NOT NULL,
    "fieldsJson" TEXT NOT NULL DEFAULT '[]',
    "answersJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedDocument_studentId_idx" ON "SavedDocument"("studentId");

-- AddForeignKey
ALTER TABLE "SavedDocument" ADD CONSTRAINT "SavedDocument_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
