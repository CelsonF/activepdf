import { PrismaClient } from "../src/generated/prisma/client";
import type { ExerciseStatus, LessonStatus } from "../src/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import path from "path";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://activepdf:activepdf@localhost:5433/activepdf",
});
const prisma = new PrismaClient({ adapter });

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

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000);
const daysFromNow = (d: number) => new Date(now.getTime() + d * 86_400_000);

/** Decompõe um total de XP em eventos plausíveis espalhados pelos últimos 60 dias. */
function buildXpEvents(totalXp: number): Array<{ points: number; reason: string; createdAt: Date }> {
  const menu = [
    { points: 20, reason: "exercise_completed" },
    { points: 15, reason: "lesson_attended" },
    { points: 10, reason: "audio_listened" },
  ];
  const events: Array<{ points: number; reason: string; createdAt: Date }> = [];
  let remaining = totalXp;
  let i = 0;
  while (remaining >= 10) {
    const pick = menu[i % menu.length];
    if (pick.points <= remaining) {
      events.push({ ...pick, createdAt: daysAgo(Math.floor((remaining / totalXp) * 60)) });
      remaining -= pick.points;
    }
    i++;
  }
  if (remaining > 0) {
    events.push({ points: remaining, reason: "teacher_award:participação", createdAt: daysAgo(1) });
  }
  return events;
}

// ── Assets binários (PDF/áudio reais e válidos) ──────────────────────────────

const ASSETS = path.join(process.cwd(), "prisma", "assets");
const worksheetPdf = readFileSync(path.join(ASSETS, "unit3-worksheet.pdf")).toString("base64");
const track16Mp3 = readFileSync(path.join(ASSETS, "listening-track16.mp3")).toString("base64");

// Campos no shape PdfField do front-end (página A4 595×842, editor em scale 1.4).
// px/py/pw/ph = pixels do canvas · pdfX/pdfY/pdfW/pdfH = pontos do PDF.
const worksheetFields = [
  {
    id: "seed-f1", name: "campo1", label: "1. She ___ to work by train. (go)",
    fieldType: "input", page: 1,
    px: 156.8, py: 179.2, pw: 182, ph: 28,
    pdfX: 112, pdfY: 694, pdfW: 130, pdfH: 20,
    multiline: false, fontSize: 12,
  },
  {
    id: "seed-f2", name: "campo2", label: "2. They ___ English on Mondays. (study)",
    fieldType: "input", page: 1,
    px: 170.8, py: 235.2, pw: 182, ph: 28,
    pdfX: 122, pdfY: 654, pdfW: 130, pdfH: 20,
    multiline: false, fontSize: 12,
  },
  {
    id: "seed-f3", name: "campo3", label: "3. Right now, I ___ a new language. (learn)",
    fieldType: "input", page: 1,
    px: 221.2, py: 291.2, pw: 189, ph: 28,
    pdfX: 158, pdfY: 614, pdfW: 135, pdfH: 20,
    multiline: false, fontSize: 12,
  },
  {
    id: "seed-f4", name: "campo4", label: "4. What do you do every morning?",
    fieldType: "question", page: 1,
    px: 98, py: 399, pw: 637, ph: 86.8,
    pdfX: 70, pdfY: 495, pdfW: 455, pdfH: 62,
    multiline: true, fontSize: 12,
  },
] as const;

const worksheetFieldsJson = JSON.stringify(worksheetFields);

// ── Perfis dos alunos demo ───────────────────────────────────────────────────

interface DemoStudent {
  name: string;
  email: string;
  enrollment: string;
  level: string;
  objective: string;
  xp: number;
  streak: number;
  achievements: string[];
  lastActiveDaysAgo: number;
}

const DEMO_STUDENTS: readonly DemoStudent[] = [
  {
    name: "Maria Oliveira", email: "maria@activepdf.app", enrollment: "ENG-2024-002",
    level: "B2", objective: "Advanced conversation and presentations at work",
    xp: 860, streak: 14, lastActiveDaysAgo: 0,
    achievements: ["first_lesson", "first_exercise", "first_audio", "xp_100", "xp_500", "streak_3", "streak_7"],
  },
  {
    name: "Pedro Santos", email: "pedro@activepdf.app", enrollment: "ENG-2024-003",
    level: "A2", objective: "Travel English and everyday conversation",
    xp: 480, streak: 9, lastActiveDaysAgo: 0,
    achievements: ["first_lesson", "first_exercise", "xp_100", "streak_3", "streak_7"],
  },
  {
    name: "Ana Costa", email: "ana@activepdf.app", enrollment: "ENG-2024-004",
    level: "B1", objective: "TOEFL preparation for graduate school abroad",
    xp: 320, streak: 5, lastActiveDaysAgo: 1,
    achievements: ["first_lesson", "first_exercise", "xp_100", "streak_3"],
  },
  {
    name: "Lucas Ferreira", email: "lucas@activepdf.app", enrollment: "ENG-2024-005",
    level: "A1", objective: "English basics for tech career — documentation and interviews",
    xp: 210, streak: 3, lastActiveDaysAgo: 0,
    achievements: ["first_lesson", "first_exercise", "xp_100", "streak_3"],
  },
  {
    name: "Beatriz Lima", email: "beatriz@activepdf.app", enrollment: "ENG-2024-006",
    level: "B1", objective: "Business English for client meetings",
    xp: 95, streak: 1, lastActiveDaysAgo: 2,
    achievements: ["first_lesson"],
  },
  {
    name: "Rafael Almeida", email: "rafael@activepdf.app", enrollment: "ENG-2024-007",
    level: "A2", objective: "General English — regain fluency after years without practice",
    xp: 40, streak: 0, lastActiveDaysAgo: 6,
    achievements: ["first_exercise"],
  },
] as const;

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

  // ── Aluno principal (João) ────────────────────────────────────────────────

  const joao = await prisma.student.upsert({
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

  for (const subject of [english, listening, speaking]) {
    await prisma.studentSubject.upsert({
      where: { studentId_subjectId: { studentId: joao.id, subjectId: subject.id } },
      update: {},
      create: { studentId: joao.id, subjectId: subject.id },
    });
  }

  await prisma.learningPlan.upsert({
    where: { studentId: joao.id },
    update: {},
    create: {
      studentId: joao.id,
      professorId: professor.id,
      level: "B1",
      objective: "Job interviews and professional communication in English",
      bookRef: "Interchange 5th Edition — Cambridge (Units 1–8)",
      notes: "Strong in reading. Needs practice with speaking fluency. Shy but improves quickly.",
    },
  });

  // ── Aluna autodidata (vinculada à professora para testar a conversão) ─────

  await prisma.student.upsert({
    where: { email: "clara@activepdf.app" },
    update: {},
    create: {
      name: "Clara Mendes",
      email: "clara@activepdf.app",
      password: await bcrypt.hash("student123", 10),
      enrollment: "ENG-2024-008",
      professorId: professor.id,
      isAutodidact: true,
    },
  });
  console.log("  ✔ Student (autodidata): clara@activepdf.app / student123");

  // ── Demais alunos (povoam ranking, turmas e relatórios) ───────────────────

  const studentPassword = await bcrypt.hash("student123", 10);
  const others: Array<{ id: string; profile: DemoStudent }> = [];

  for (const profile of DEMO_STUDENTS) {
    const student = await prisma.student.upsert({
      where: { email: profile.email },
      update: {},
      create: {
        name: profile.name,
        email: profile.email,
        password: studentPassword,
        enrollment: profile.enrollment,
        professorId: professor.id,
      },
    });
    others.push({ id: student.id, profile });

    await prisma.learningPlan.upsert({
      where: { studentId: student.id },
      update: {},
      create: {
        studentId: student.id,
        professorId: professor.id,
        level: profile.level,
        objective: profile.objective,
      },
    });

    for (const subject of [english, speaking]) {
      await prisma.studentSubject.upsert({
        where: { studentId_subjectId: { studentId: student.id, subjectId: subject.id } },
        update: {},
        create: { studentId: student.id, subjectId: subject.id },
      });
    }

    // Stats determinísticas (re-rodar o seed não infla XP)
    await prisma.userStats.upsert({
      where: { studentId: student.id },
      update: {
        xp: profile.xp,
        level: computeLevel(profile.xp),
        streak: profile.streak,
        lastActiveAt: daysAgo(profile.lastActiveDaysAgo),
      },
      create: {
        studentId: student.id,
        xp: profile.xp,
        level: computeLevel(profile.xp),
        streak: profile.streak,
        lastActiveAt: daysAgo(profile.lastActiveDaysAgo),
      },
    });

    // Histórico de eventos coerente com o total de XP
    await prisma.xpEvent.deleteMany({ where: { studentId: student.id } });
    for (const ev of buildXpEvents(profile.xp)) {
      await prisma.xpEvent.create({ data: { studentId: student.id, ...ev } });
    }

    for (const key of profile.achievements) {
      await prisma.achievement.upsert({
        where: { studentId_key: { studentId: student.id, key } },
        update: {},
        create: { studentId: student.id, key },
      });
    }
  }
  console.log(`  ✔ ${DEMO_STUDENTS.length} alunos extras (ranking com 7 alunos)`);

  // ── Turmas ────────────────────────────────────────────────────────────────

  const classSeed = [
    { name: "Conversação B1", students: [joao.id, others[2].id, others[4].id] },
    { name: "Business English — Turma A", students: [others[0].id, others[1].id, others[5].id] },
    { name: "Tech English", students: [others[3].id, joao.id] },
  ];

  for (const cls of classSeed) {
    let klass = await prisma.class.findFirst({
      where: { professorId: professor.id, name: cls.name },
    });
    if (!klass) {
      klass = await prisma.class.create({
        data: { professorId: professor.id, name: cls.name },
      });
    }
    for (const studentId of cls.students) {
      await prisma.classStudent.upsert({
        where: { classId_studentId: { classId: klass.id, studentId } },
        update: {},
        create: { classId: klass.id, studentId },
      });
    }
  }
  console.log("  ✔ 3 turmas com alunos");

  // ── Aulas do João (guard por conteúdo para não duplicar) ──────────────────

  async function ensureLesson(data: {
    studentId: string; subjectId?: string; scheduledAt: Date;
    content: string; homework?: string; notes?: string; status: LessonStatus;
  }) {
    const existing = await prisma.lesson.findFirst({
      where: { studentId: data.studentId, content: data.content },
    });
    if (existing) return existing;
    return prisma.lesson.create({
      data: {
        professorId: professor.id,
        meetLink: "https://meet.google.com/abc-defg-hij",
        ...data,
      },
    });
  }

  const lesson1 = await ensureLesson({
    studentId: joao.id,
    subjectId: english.id,
    scheduledAt: daysAgo(14),
    content: "Unit 3 — Daily routines. Present simple vs present continuous. Vocabulary: work and leisure.",
    homework: "Write 5 sentences about your daily routine. Review vocabulary list.",
    notes: "João struggled with present continuous but understood by end of class.",
    status: "COMPLETED",
  });

  const lesson2 = await ensureLesson({
    studentId: joao.id,
    subjectId: listening.id,
    scheduledAt: daysAgo(7),
    content: "Listening — Interchange Unit 4 (tracks 12–15). Dictation practice. Describing people.",
    homework: "Listen to track 16 and answer questions on page 42. Shadow for 10 min.",
    notes: "Improved listening comprehension. Still misses fast speech.",
    status: "COMPLETED",
  });

  await ensureLesson({
    studentId: joao.id,
    subjectId: english.id,
    scheduledAt: daysFromNow(2),
    content: "Unit 5 — Working and volunteering. Modal verbs: can, could, should. Job interview vocabulary.",
    status: "SCHEDULED",
  });

  await ensureLesson({
    studentId: joao.id,
    subjectId: speaking.id,
    scheduledAt: daysFromNow(9),
    content: "Role-play: Job interview simulation. Pronunciation: word stress.",
    status: "SCHEDULED",
  });

  // Aulas concluídas para alguns alunos extras (relatórios ficam vivos)
  await ensureLesson({
    studentId: others[0].id, subjectId: speaking.id, scheduledAt: daysAgo(3),
    content: "Presentation skills — signposting language and Q&A practice.", status: "COMPLETED",
  });
  await ensureLesson({
    studentId: others[1].id, subjectId: english.id, scheduledAt: daysAgo(5),
    content: "Unit 2 — Asking for directions. Prepositions of place.", status: "COMPLETED",
  });
  await ensureLesson({
    studentId: others[2].id, subjectId: english.id, scheduledAt: daysFromNow(1),
    content: "TOEFL reading section — skimming and scanning strategies.", status: "SCHEDULED",
  });

  console.log("  ✔ Aulas (João: 4 · extras: 3)");

  // ── Áudio de listening com transcript ─────────────────────────────────────

  const existingAudio = await prisma.audioMaterial.findFirst({
    where: { lessonId: lesson2.id, title: "Track 16 — Describing People" },
  });
  if (!existingAudio) {
    await prisma.audioMaterial.create({
      data: {
        lessonId: lesson2.id,
        title: "Track 16 — Describing People",
        fileData: track16Mp3,
        mimeType: "audio/mpeg",
        durationSecs: 6,
        transcript:
          "A: What does your new coworker look like? B: She's tall, with short dark hair. " +
          "She's very outgoing — you'll like her. A: Is she the one who just moved from Recife? B: That's right.",
      },
    });
  }
  console.log("  ✔ Áudio de listening (com transcript)");

  // ── Vocabulário do João (recriado de forma determinística) ────────────────

  const vocab = [
    { lessonId: lesson1.id, word: "leisure",    definition: "Free time; time when you are not working",       example: "I enjoy reading in my leisure time.",            note: "Pronunciation: /ˈleʒə/" },
    { lessonId: lesson1.id, word: "commute",    definition: "To travel regularly between home and work",      example: "My commute takes about 40 minutes.",             note: "Noun and verb" },
    { lessonId: lesson1.id, word: "routine",    definition: "A regular way of doing things in a fixed order", example: "I have a morning routine before work.",          note: "Collocations: daily routine, morning routine" },
    { lessonId: lesson2.id, word: "outgoing",   definition: "Friendly and confident; enjoys meeting people",  example: "She is very outgoing and makes friends easily.", note: "Opposite: shy, introverted" },
    { lessonId: lesson2.id, word: "ambitious",  definition: "Having a strong desire to succeed",              example: "He is ambitious and works very hard.",           note: "Positive in professional context" },
    { lessonId: lesson2.id, word: "determined", definition: "Having made a firm decision to do something",    example: "She was determined to learn English.",           note: "Good for job interview self-description" },
  ];
  await prisma.vocabularyEntry.deleteMany({
    where: { studentId: joao.id, word: { in: vocab.map((v) => v.word) } },
  });
  for (const v of vocab) {
    await prisma.vocabularyEntry.create({ data: { ...v, studentId: joao.id } });
  }
  console.log("  ✔ 6 vocabulary entries");

  // ── Exercícios (PDF válido + campos no shape do editor) ───────────────────
  //    Remove versões antigas do seed (inclui o stub quebrado unit3-exercise.pdf).

  await prisma.exercise.deleteMany({
    where: {
      professorId: professor.id,
      pdfName: { in: ["unit3-exercise.pdf", "unit3-worksheet.pdf", "unit4-worksheet.pdf"] },
    },
  });

  const exerciseSeed: Array<{
    title: string;
    studentId: string;
    lessonId?: string;
    status: ExerciseStatus;
    answersJson: string;
    correctionJson: string;
  }> = [
    {
      title: "Unit 3 — Present Simple & Continuous",
      studentId: joao.id,
      lessonId: lesson1.id,
      status: "corrected",
      answersJson: JSON.stringify({
        "seed-f1": "goes",
        "seed-f2": "studies",
        "seed-f3": "am learning",
        "seed-f4": "I wake up at 7am, take a shower and eat breakfast before work.",
      }),
      correctionJson: JSON.stringify({
        grade: "B+",
        comment: "Great effort, João! Watch out for plural subjects — review question 2.",
        items: {
          "seed-f1": { correct: true,  feedback: null },
          "seed-f2": { correct: false, feedback: "'They' is plural — the correct form is 'study'." },
          "seed-f3": { correct: true,  feedback: null },
          "seed-f4": { correct: true,  feedback: "Nice full sentence with sequencing!" },
        },
      }),
    },
    {
      title: "Unit 4 — Describing People (homework)",
      studentId: joao.id,
      lessonId: lesson2.id,
      status: "assigned",
      answersJson: "{}",
      correctionJson: "{}",
    },
    {
      title: "Unit 3 — Present Simple & Continuous",
      studentId: others[0].id, // Maria
      status: "corrected",
      answersJson: JSON.stringify({
        "seed-f1": "goes",
        "seed-f2": "study",
        "seed-f3": "am learning",
        "seed-f4": "Every morning I go for a run, then I review my English flashcards.",
      }),
      correctionJson: JSON.stringify({
        grade: "A",
        comment: "Perfect! Ready to move on to Unit 4.",
        items: {
          "seed-f1": { correct: true, feedback: null },
          "seed-f2": { correct: true, feedback: null },
          "seed-f3": { correct: true, feedback: null },
          "seed-f4": { correct: true, feedback: null },
        },
      }),
    },
    {
      title: "Unit 3 — Present Simple & Continuous",
      studentId: others[1].id, // Pedro — aguardando correção
      status: "completed",
      answersJson: JSON.stringify({
        "seed-f1": "go",
        "seed-f2": "study",
        "seed-f3": "learning",
        "seed-f4": "I drink coffee and check my emails.",
      }),
      correctionJson: "{}",
    },
    {
      title: "Unit 3 — Present Simple & Continuous",
      studentId: others[2].id, // Ana — em andamento
      status: "in_progress",
      answersJson: JSON.stringify({ "seed-f1": "goes", "seed-f2": "study" }),
      correctionJson: "{}",
    },
  ];

  for (const ex of exerciseSeed) {
    await prisma.exercise.create({
      data: {
        title: ex.title,
        professorId: professor.id,
        studentId: ex.studentId,
        lessonId: ex.lessonId ?? null,
        pdfName: "unit3-worksheet.pdf",
        pdfData: worksheetPdf,
        fieldsJson: worksheetFieldsJson,
        answersJson: ex.answersJson,
        correctionJson: ex.correctionJson,
        status: ex.status,
      },
    });
  }
  console.log("  ✔ 5 exercícios (corrected, assigned, completed, in_progress)");

  // ── Biblioteca ────────────────────────────────────────────────────────────

  const existingLibPdf = await prisma.libraryPdf.findFirst({
    where: { professorId: professor.id, name: "Unit 3 — Worksheet (Present Simple & Continuous)" },
  });
  if (!existingLibPdf) {
    await prisma.libraryPdf.create({
      data: {
        professorId: professor.id,
        name: "Unit 3 — Worksheet (Present Simple & Continuous)",
        description: "One-page grammar worksheet ready to assign as an exercise.",
        tags: JSON.stringify(["grammar", "unit-3", "worksheet"]),
        pdfData: worksheetPdf,
        pageCount: 1,
        fileSize: Math.floor((worksheetPdf.length * 3) / 4),
      },
    });
  }
  console.log("  ✔ Biblioteca: worksheet Unit 3");

  // ── Gamificação do João (não sobrescreve progresso real existente) ────────

  const joaoStats = await prisma.userStats.findUnique({ where: { studentId: joao.id } });
  if (!joaoStats) {
    const xpEvents = [
      { points: 15, reason: "lesson_attended",    referenceId: lesson1.id, createdAt: daysAgo(14) },
      { points: 15, reason: "lesson_attended",    referenceId: lesson2.id, createdAt: daysAgo(7) },
      { points: 20, reason: "exercise_completed", referenceId: null,       createdAt: daysAgo(13) },
    ];
    for (const ev of xpEvents) {
      await prisma.xpEvent.create({ data: { studentId: joao.id, ...ev } });
    }
    const totalXp = xpEvents.reduce((s, e) => s + e.points, 0);
    await prisma.userStats.create({
      data: {
        studentId: joao.id,
        xp: totalXp,
        level: computeLevel(totalXp),
        streak: 2,
        lastActiveAt: daysAgo(7),
      },
    });
  }
  for (const key of ["first_lesson", "first_exercise"]) {
    await prisma.achievement.upsert({
      where: { studentId_key: { studentId: joao.id, key } },
      update: {},
      create: { studentId: joao.id, key },
    });
  }
  console.log("  ✔ Gamificação do João preservada/criada");

  // ── Done ──────────────────────────────────────────────────────────────────

  console.log("\n✅ Seed complete!");
  console.log("\n  Demo accounts (senha de aluno: student123):");
  console.log("  👩‍🏫 Teacher  → sarah@activepdf.app  /  teacher123");
  console.log("  🎓 Student  → joao@activepdf.app   (B1, turma Conversação)");
  console.log("  🎓 Student  → maria@activepdf.app  (B2, topo do ranking)");
  console.log("  🎓 Student  → pedro@activepdf.app  (A2, exercício aguardando correção)");
  console.log("  🎓 Student  → ana@activepdf.app    (B1, exercício em andamento)");
  console.log("  🎓 Student  → lucas@activepdf.app · beatriz@activepdf.app · rafael@activepdf.app");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
