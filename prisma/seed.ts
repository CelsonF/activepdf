import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const adapter = new PrismaBetterSqlite3({ url: `file:${path.join(process.cwd(), "dev.db")}` });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Seeding database...");

  // --- Subjects ---
  const subjects = await Promise.all([
    prisma.subject.upsert({ where: { name: "English" }, update: {}, create: { name: "English", description: "General English — grammar, vocabulary, conversation" } }),
    prisma.subject.upsert({ where: { name: "Listening" }, update: {}, create: { name: "Listening", description: "Listening comprehension exercises and dictation" } }),
    prisma.subject.upsert({ where: { name: "Speaking" }, update: {}, create: { name: "Speaking", description: "Conversation practice and pronunciation" } }),
    prisma.subject.upsert({ where: { name: "Writing" }, update: {}, create: { name: "Writing", description: "Written expression, emails, essays" } }),
  ]);

  const [english, listening, speaking] = subjects;
  console.log("  ✔ Subjects created");

  // --- Professor ---
  const professorPassword = await bcrypt.hash("teacher123", 10);
  const professor = await prisma.professor.upsert({
    where: { email: "sarah@activepdf.app" },
    update: {},
    create: {
      name: "Sarah Johnson",
      email: "sarah@activepdf.app",
      password: professorPassword,
      subject: "English",
      bio: "Cambridge-certified English teacher with 10 years of experience. Specializes in conversational English and exam preparation.",
    },
  });
  console.log("  ✔ Professor: sarah@activepdf.app / teacher123");

  // --- Student ---
  const studentPassword = await bcrypt.hash("student123", 10);
  const student = await prisma.student.upsert({
    where: { email: "joao@activepdf.app" },
    update: {},
    create: {
      name: "João Silva",
      email: "joao@activepdf.app",
      password: studentPassword,
      enrollment: "ENG-2024-001",
      professorId: professor.id,
    },
  });
  console.log("  ✔ Student: joao@activepdf.app / student123");

  // --- Enroll student in subjects ---
  for (const subject of [english, listening, speaking]) {
    await prisma.studentSubject.upsert({
      where: { studentId_subjectId: { studentId: student.id, subjectId: subject.id } },
      update: {},
      create: { studentId: student.id, subjectId: subject.id },
    });
  }
  console.log("  ✔ Subjects enrolled: English, Listening, Speaking");

  // --- Learning Plan ---
  await prisma.learningPlan.upsert({
    where: { studentId: student.id },
    update: {},
    create: {
      studentId: student.id,
      professorId: professor.id,
      level: "B1 — Intermediate",
      objective: "Job interviews and professional communication in English",
      bookRef: "Interchange 5th Edition — Cambridge (Units 1–8)",
      notes: "Strong in reading. Needs practice with speaking fluency and listening to native speakers. Shy in conversation but improves quickly with encouragement.",
    },
  });
  console.log("  ✔ Learning plan created");

  // --- Lessons ---
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000);

  const lesson1 = await prisma.lesson.create({
    data: {
      studentId: student.id,
      professorId: professor.id,
      subjectId: english.id,
      scheduledAt: daysAgo(14),
      meetLink: "https://meet.google.com/abc-defg-hij",
      content: "Unit 3 — Daily routines and habits. Present simple vs present continuous. Vocabulary: work and leisure activities.",
      homework: "Write 5 sentences about your daily routine. Review vocabulary list from Unit 3.",
      notes: "João struggled with present continuous but understood by end of class. Very good pronunciation today.",
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
      content: "Listening exercise — Interchange Unit 4 (audio tracks 12–15). Dictation practice. New expressions: describing people.",
      homework: "Listen to audio track 16 and answer questions on page 42. Practice shadowing for 10 minutes.",
      notes: "Improved listening comprehension. Still misses fast speech. Recommended 10 min/day shadowing practice.",
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
      homework: null,
      notes: null,
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
      content: "Role-play: Job interview simulation. Pronunciation: word stress in multi-syllable words.",
      homework: null,
      notes: null,
      status: "SCHEDULED",
    },
  });

  console.log("  ✔ 4 lessons created (2 completed, 2 scheduled)");

  // --- Vocabulary entries from completed lessons ---
  const vocab = [
    { lessonId: lesson1.id, word: "leisure", definition: "Free time; time when you are not working", example: "I enjoy reading in my leisure time.", note: "Pronunciation: /ˈleʒə/" },
    { lessonId: lesson1.id, word: "commute", definition: "To travel regularly between home and work", example: "My commute takes about 40 minutes.", note: "Noun and verb" },
    { lessonId: lesson1.id, word: "routine", definition: "A regular way of doing things in a particular order", example: "I have a morning routine before work.", note: "Collocations: daily routine, morning routine" },
    { lessonId: lesson2.id, word: "outgoing", definition: "Friendly and confident; enjoys meeting people", example: "She is very outgoing and makes friends easily.", note: "Opposite: shy, introverted" },
    { lessonId: lesson2.id, word: "ambitious", definition: "Having a strong desire to succeed", example: "He is ambitious and works very hard.", note: "Positive in professional context" },
    { lessonId: lesson2.id, word: "determined", definition: "Having made a firm decision to do something", example: "She was determined to learn English.", note: "Good for job interview self-description" },
  ];

  for (const v of vocab) {
    await prisma.vocabularyEntry.create({ data: { ...v, studentId: student.id } });
  }
  console.log("  ✔ 6 vocabulary entries created");

  console.log("\n✅ Seed complete!");
  console.log("\n  Demo accounts:");
  console.log("  👩‍🏫 Teacher  → sarah@activepdf.app  /  teacher123");
  console.log("  🎓 Student  → joao@activepdf.app   /  student123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
