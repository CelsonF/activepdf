import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const adapter = new PrismaBetterSqlite3({ url: `file:${path.join(process.cwd(), "dev.db")}` });
const prisma = new PrismaClient({ adapter } as any);

// ── XP helpers (mirrors src/lib/gamification.ts without the DB import) ──────

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000];
function computeLevel(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

async function main() {
  console.log("🌱 Seeding database...");

  // ── Professor ─────────────────────────────────────────────────────────────

  const professor = await prisma.professor.upsert({
    where: { email: "sarah@activepdf.app" },
    update: {},
    create: {
      name: "Sarah Johnson",
      email: "sarah@activepdf.app",
      password: await bcrypt.hash("teacher123", 10),
      subject: "English",
      bio: "Cambridge-certified English teacher with 10 years of experience.",
    },
  });
  console.log("  ✔ Professor: sarah@activepdf.app / teacher123");

  // ── Subjects (escopadas por professor) ────────────────────────────────────

  const subjectSeed = [
    { name: "English", description: "General English — grammar, vocabulary, conversation" },
    { name: "Listening", description: "Listening comprehension exercises and dictation" },
    { name: "Speaking", description: "Conversation practice and pronunciation" },
    { name: "Writing", description: "Written expression, emails, essays" },
  ];
  const subjects = await Promise.all(
    subjectSeed.map((s) =>
      prisma.subject.upsert({
        where: { professorId_name: { professorId: professor.id, name: s.name } },
        update: {},
        create: { ...s, professorId: professor.id },
      })
    )
  );

  const [english, listening, speaking] = subjects;
  console.log("  ✔ Subjects");

  // ── Organization ──────────────────────────────────────────────────────────

  await prisma.organization.upsert({
    where: { professorId: professor.id },
    update: {},
    create: {
      name: "Sarah's English Academy",
      slug: `sarahs-english-academy-${professor.id.slice(0, 6)}`,
      professorId: professor.id,
    },
  });
  console.log("  ✔ Organization: Sarah's English Academy");

  // ── Student ───────────────────────────────────────────────────────────────

  const student = await prisma.student.upsert({
    where: { email: "joao@activepdf.app" },
    update: {},
    create: {
      name: "João Silva",
      email: "joao@activepdf.app",
      password: await bcrypt.hash("student123", 10),
      enrollment: "ENG-2024-001",
      professorId: professor.id,
    },
  });
  console.log("  ✔ Student: joao@activepdf.app / student123");

  // ── Enroll in subjects ─────────────────────────────────────────────────────

  for (const subject of [english, listening, speaking]) {
    await prisma.studentSubject.upsert({
      where: { studentId_subjectId: { studentId: student.id, subjectId: subject.id } },
      update: {},
      create: { studentId: student.id, subjectId: subject.id },
    });
  }
  console.log("  ✔ Subjects enrolled: English, Listening, Speaking");

  // ── Learning plan ─────────────────────────────────────────────────────────

  await prisma.learningPlan.upsert({
    where: { studentId: student.id },
    update: {},
    create: {
      studentId: student.id,
      professorId: professor.id,
      level: "B1",
      objective: "Job interviews and professional communication in English",
      bookRef: "Interchange 5th Edition — Cambridge (Units 1–8)",
      notes: "Strong in reading. Needs practice with speaking fluency. Shy but improves quickly.",
    },
  });
  console.log("  ✔ Learning plan (B1)");

  // ── Lessons ────────────────────────────────────────────────────────────────

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000);
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 86_400_000);

  const lesson1 = await prisma.lesson.create({
    data: {
      studentId: student.id,
      professorId: professor.id,
      subjectId: english.id,
      scheduledAt: daysAgo(14),
      meetLink: "https://meet.google.com/abc-defg-hij",
      content: "Unit 3 — Daily routines. Present simple vs present continuous. Vocabulary: work and leisure.",
      homework: "Write 5 sentences about your daily routine. Review vocabulary list.",
      notes: "João struggled with present continuous but understood by end of class.",
      status: "COMPLETED",
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      studentId: student.id,
      professorId: professor.id,
      subjectId: listening.id,
      scheduledAt: daysAgo(7),
      meetLink: "https://meet.google.com/abc-defg-hij",
      content: "Listening — Interchange Unit 4 (tracks 12–15). Dictation practice. Describing people.",
      homework: "Listen to track 16 and answer questions on page 42. Shadow for 10 min.",
      notes: "Improved listening comprehension. Still misses fast speech.",
      status: "COMPLETED",
    },
  });

  await prisma.lesson.create({
    data: {
      studentId: student.id,
      professorId: professor.id,
      subjectId: english.id,
      scheduledAt: daysFromNow(2),
      meetLink: "https://meet.google.com/abc-defg-hij",
      content: "Unit 5 — Working and volunteering. Modal verbs: can, could, should. Job interview vocabulary.",
      status: "SCHEDULED",
    },
  });

  await prisma.lesson.create({
    data: {
      studentId: student.id,
      professorId: professor.id,
      subjectId: speaking.id,
      scheduledAt: daysFromNow(9),
      meetLink: "https://meet.google.com/abc-defg-hij",
      content: "Role-play: Job interview simulation. Pronunciation: word stress.",
      status: "SCHEDULED",
    },
  });

  console.log("  ✔ 4 lessons (2 completed, 2 scheduled)");

  // ── Vocabulary ─────────────────────────────────────────────────────────────

  for (const v of [
    { lessonId: lesson1.id, word: "leisure",    definition: "Free time; time when you are not working",      example: "I enjoy reading in my leisure time.",        note: "Pronunciation: /ˈleʒə/" },
    { lessonId: lesson1.id, word: "commute",    definition: "To travel regularly between home and work",     example: "My commute takes about 40 minutes.",         note: "Noun and verb" },
    { lessonId: lesson1.id, word: "routine",    definition: "A regular way of doing things in a fixed order",example: "I have a morning routine before work.",      note: "Collocations: daily routine, morning routine" },
    { lessonId: lesson2.id, word: "outgoing",   definition: "Friendly and confident; enjoys meeting people", example: "She is very outgoing and makes friends easily.", note: "Opposite: shy, introverted" },
    { lessonId: lesson2.id, word: "ambitious",  definition: "Having a strong desire to succeed",             example: "He is ambitious and works very hard.",        note: "Positive in professional context" },
    { lessonId: lesson2.id, word: "determined", definition: "Having made a firm decision to do something",   example: "She was determined to learn English.",        note: "Good for job interview self-description" },
  ]) {
    await prisma.vocabularyEntry.create({ data: { ...v, studentId: student.id } });
  }
  console.log("  ✔ 6 vocabulary entries");

  // ── Exercise with correction ───────────────────────────────────────────────

  const fieldsJson = JSON.stringify([
    { id: "f1", type: "text",     page: 1, x: 100, y: 150, width: 200, height: 30, label: "What do you do every morning?" },
    { id: "f2", type: "text",     page: 1, x: 100, y: 220, width: 200, height: 30, label: "Use 'going to' in a sentence about your plans." },
    { id: "f3", type: "checkbox", page: 1, x: 100, y: 290, width: 20,  height: 20, label: "I understand present continuous." },
  ]);

  const answersJson = JSON.stringify({
    f1: "I wake up at 7am and eat breakfast.",
    f2: "I am going to study English tomorrow.",
    f3: true,
  });

  const correctionJson = JSON.stringify({
    grade: "A",
    comment: "Excellent work! Great use of 'going to'. Keep it up.",
    items: {
      f1: { correct: true,  feedback: null },
      f2: { correct: true,  feedback: null },
      f3: { correct: true,  feedback: null },
    },
  });

  await prisma.exercise.create({
    data: {
      title: "Unit 3 — Present Simple & Continuous",
      professorId: professor.id,
      studentId: student.id,
      lessonId: lesson1.id,
      pdfName: "unit3-exercise.pdf",
      pdfData: "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nCvkMlAwUDC1NNUzMVcoLU4tykvMTQUA",
      fieldsJson,
      answersJson,
      correctionJson,
      status: "corrected",
    },
  });

  console.log("  ✔ 1 exercise (corrected, grade A)");

  // ── Gamification — XP for the 2 completed lessons + exercise ──────────────
  //    We create events directly since we bypassed the routes above.

  const xpEvents = [
    { points: 15, reason: "lesson_attended",    referenceId: lesson1.id, createdAt: daysAgo(14) },
    { points: 15, reason: "lesson_attended",    referenceId: lesson2.id, createdAt: daysAgo(7) },
    { points: 20, reason: "exercise_completed", referenceId: undefined,  createdAt: daysAgo(13) },
  ];

  for (const ev of xpEvents) {
    await prisma.xpEvent.create({
      data: {
        studentId: student.id,
        points: ev.points,
        reason: ev.reason,
        referenceId: ev.referenceId ?? null,
        createdAt: ev.createdAt,
      },
    });
  }

  const totalXp = xpEvents.reduce((s, e) => s + e.points, 0); // 50
  const level = computeLevel(totalXp);
  const streak = 2;

  await prisma.userStats.upsert({
    where: { studentId: student.id },
    update: { xp: totalXp, level, streak, lastActiveAt: daysAgo(7) },
    create: { studentId: student.id, xp: totalXp, level, streak, lastActiveAt: daysAgo(7) },
  });

  // Achievements for 2 completed lessons + 1 exercise
  for (const key of ["first_lesson", "first_exercise"]) {
    await prisma.achievement.upsert({
      where: { studentId_key: { studentId: student.id, key } },
      update: {},
      create: { studentId: student.id, key },
    });
  }

  console.log(`  ✔ Gamification: ${totalXp} XP, level ${level}, streak ${streak}, 2 achievements`);

  // ── Done ──────────────────────────────────────────────────────────────────

  console.log("\n✅ Seed complete!");
  console.log("\n  Demo accounts:");
  console.log("  👩‍🏫 Teacher  → sarah@activepdf.app  /  teacher123");
  console.log("  🎓 Student  → joao@activepdf.app   /  student123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
