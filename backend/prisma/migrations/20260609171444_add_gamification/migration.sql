-- CreateTable: UserStats
-- One-to-one with Student. Tracks XP, level, streak and last activity date.
CREATE TABLE "UserStats" (
    "id"           TEXT     NOT NULL PRIMARY KEY,
    "studentId"    TEXT     NOT NULL,
    "xp"           INTEGER  NOT NULL DEFAULT 0,
    "level"        INTEGER  NOT NULL DEFAULT 1,
    "streak"       INTEGER  NOT NULL DEFAULT 0,
    "lastActiveAt" DATETIME,
    "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    DATETIME NOT NULL,
    CONSTRAINT "UserStats_studentId_fkey"
        FOREIGN KEY ("studentId") REFERENCES "Student" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: Achievement
-- Each row represents one unlocked badge for a student.
CREATE TABLE "Achievement" (
    "id"         TEXT     NOT NULL PRIMARY KEY,
    "studentId"  TEXT     NOT NULL,
    "key"        TEXT     NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Achievement_studentId_fkey"
        FOREIGN KEY ("studentId") REFERENCES "Student" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: XpEvent
-- Immutable audit log. One row per XP transaction (exercise done, streak, etc.).
CREATE TABLE "XpEvent" (
    "id"          TEXT     NOT NULL PRIMARY KEY,
    "studentId"   TEXT     NOT NULL,
    "points"      INTEGER  NOT NULL,
    "reason"      TEXT     NOT NULL,
    "referenceId" TEXT,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "XpEvent_studentId_fkey"
        FOREIGN KEY ("studentId") REFERENCES "Student" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex: UserStats.studentId is unique (one stats record per student)
CREATE UNIQUE INDEX "UserStats_studentId_key" ON "UserStats"("studentId");

-- CreateIndex: prevent duplicate achievements for the same student
CREATE UNIQUE INDEX "Achievement_studentId_key_key" ON "Achievement"("studentId", "key");

-- CreateIndex: fast lookup of all XP events for a student, newest first
CREATE INDEX "XpEvent_studentId_createdAt_idx" ON "XpEvent"("studentId", "createdAt" DESC);
