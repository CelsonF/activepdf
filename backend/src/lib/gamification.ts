import { prisma } from "./prisma.js";

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000];

function computeLevel(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

export const ACHIEVEMENT_META: Record<string, string> = {
  first_exercise: "Primeiro exercício concluído",
  first_lesson: "Primeira aula concluída",
  first_audio: "Primeiro áudio ouvido",
  streak_3: "3 dias seguidos",
  streak_7: "7 dias seguidos",
  streak_30: "30 dias seguidos",
  xp_100: "100 XP acumulados",
  xp_500: "500 XP acumulados",
  xp_1000: "1000 XP acumulados",
};

async function unlockIfNew(studentId: string, key: string) {
  await prisma.achievement.upsert({
    where: { studentId_key: { studentId, key } },
    create: { studentId, key },
    update: {},
  });
}

async function checkAchievements(
  studentId: string,
  totalXp: number,
  streak: number,
  reason: string
) {
  const promises: Promise<unknown>[] = [];

  if (reason === "exercise_completed") promises.push(unlockIfNew(studentId, "first_exercise"));
  if (reason === "lesson_attended") promises.push(unlockIfNew(studentId, "first_lesson"));
  if (reason === "audio_listened") promises.push(unlockIfNew(studentId, "first_audio"));

  if (totalXp >= 100) promises.push(unlockIfNew(studentId, "xp_100"));
  if (totalXp >= 500) promises.push(unlockIfNew(studentId, "xp_500"));
  if (totalXp >= 1000) promises.push(unlockIfNew(studentId, "xp_1000"));

  if (streak >= 3) promises.push(unlockIfNew(studentId, "streak_3"));
  if (streak >= 7) promises.push(unlockIfNew(studentId, "streak_7"));
  if (streak >= 30) promises.push(unlockIfNew(studentId, "streak_30"));

  await Promise.all(promises);
}

function computeStreak(lastActiveAt: Date | null, currentStreak: number): number {
  if (!lastActiveAt) return 1;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastStart = new Date(
    lastActiveAt.getFullYear(),
    lastActiveAt.getMonth(),
    lastActiveAt.getDate()
  );
  const diffDays = Math.round(
    (todayStart.getTime() - lastStart.getTime()) / 86_400_000
  );
  if (diffDays === 0) return currentStreak;
  if (diffDays === 1) return currentStreak + 1;
  return 1;
}

export async function awardXp(
  studentId: string,
  points: number,
  reason: string,
  referenceId?: string
): Promise<{ xpAwarded: number; alreadyCounted: boolean }> {
  if (referenceId) {
    const exists = await prisma.xpEvent.findFirst({
      where: { studentId, referenceId, reason },
    });
    if (exists) return { xpAwarded: 0, alreadyCounted: true };
  }

  const stats = await prisma.userStats.findUnique({ where: { studentId } });
  const newStreak = computeStreak(stats?.lastActiveAt ?? null, stats?.streak ?? 0);
  const newXp = (stats?.xp ?? 0) + points;
  const newLevel = computeLevel(newXp);

  await prisma.$transaction([
    prisma.xpEvent.create({
      data: { studentId, points, reason, referenceId: referenceId ?? null },
    }),
    prisma.userStats.upsert({
      where: { studentId },
      create: { studentId, xp: points, level: newLevel, streak: newStreak, lastActiveAt: new Date() },
      update: { xp: { increment: points }, level: newLevel, streak: newStreak, lastActiveAt: new Date() },
    }),
  ]);

  await checkAchievements(studentId, newXp, newStreak, reason);

  return { xpAwarded: points, alreadyCounted: false };
}
