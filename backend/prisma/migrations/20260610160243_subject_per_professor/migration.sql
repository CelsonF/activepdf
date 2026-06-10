-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "professorId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subject_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Subject" ("createdAt", "description", "id", "name", "updatedAt") SELECT "createdAt", "description", "id", "name", "updatedAt" FROM "Subject";
DROP TABLE "Subject";
ALTER TABLE "new_Subject" RENAME TO "Subject";
CREATE UNIQUE INDEX "Subject_professorId_name_key" ON "Subject"("professorId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Backfill: matéria legada vai para o professor que tem aulas com ela;
-- sem aulas, vai para o professor mais antigo.
UPDATE "Subject" SET "professorId" = (
  SELECT "professorId" FROM "Lesson"
  WHERE "Lesson"."subjectId" = "Subject"."id"
  LIMIT 1
) WHERE "professorId" IS NULL;

UPDATE "Subject" SET "professorId" = (
  SELECT "id" FROM "Professor" ORDER BY "createdAt" ASC LIMIT 1
) WHERE "professorId" IS NULL;
