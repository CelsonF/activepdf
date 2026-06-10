import {
  BookOpen,
  Briefcase,
  Buildings,
  ChatCircle,
  Code,
  Exam,
  GraduationCap,
  Headphones,
  TextT,
} from "@phosphor-icons/react";

export type Role = "teacher" | "student" | "company" | "dev";
export type Goal = "conversation" | "business" | "tech" | "exam" | "grammar" | "listening";
export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export const ROLES = [
  { id: "teacher" as Role, icon: <GraduationCap size={22} weight="bold" />, name: "Professor(a)", desc: "Atribuir e acompanhar turmas" },
  { id: "student" as Role, icon: <BookOpen size={22} weight="bold" />, name: "Aluno / Autodidata", desc: "Aprender com meu material" },
  { id: "company" as Role, icon: <Buildings size={22} weight="bold" />, name: "Empresa / RH", desc: "Capacitar meu time" },
  { id: "dev" as Role, icon: <Code size={22} weight="bold" />, name: "Dev / Tech", desc: "Inglês técnico" },
];

export const LEVELS: { id: Level; label: string }[] = [
  { id: "A1", label: "Iniciante" }, { id: "A2", label: "Básico" },
  { id: "B1", label: "Intermediário" }, { id: "B2", label: "Inter. alto" },
  { id: "C1", label: "Avançado" }, { id: "C2", label: "Proficiente" },
];

export const GOALS = [
  { id: "conversation" as Goal, icon: <ChatCircle size={16} weight="bold" />, label: "Conversação" },
  { id: "business" as Goal, icon: <Briefcase size={16} weight="bold" />, label: "Inglês de negócios" },
  { id: "tech" as Goal, icon: <Code size={16} weight="bold" />, label: "Inglês técnico" },
  { id: "exam" as Goal, icon: <Exam size={16} weight="bold" />, label: "Provas (TOEFL/IELTS)" },
  { id: "grammar" as Goal, icon: <TextT size={16} weight="bold" />, label: "Gramática" },
  { id: "listening" as Goal, icon: <Headphones size={16} weight="bold" />, label: "Listening" },
];

export function stepLabels(role: Role | null) {
  if (role === "teacher") return ["Conta", "Perfil", "Escola"];
  return ["Conta", "Perfil", "Objetivos"];
}
