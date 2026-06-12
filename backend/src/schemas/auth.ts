import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  // company/dev são perfis de aluno no onboarding — qualquer role != teacher vira student
  role: z.enum(["teacher", "student", "company", "dev"]),
  teacherEmail: z.string().trim().email("Email do professor inválido").optional().or(z.literal("")),
  // Aluno que estuda sem professor — ganha acesso ao editor de campos
  isAutodidact: z.boolean().optional(),
  organizationName: z.string().optional(),
  level: z.string().max(10).optional(),
  goals: z.array(z.string().max(40)).max(10).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Nome não pode ser vazio").max(60).optional(),
  bio: z.string().max(160).nullish(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(8, "A nova senha deve ter no mínimo 8 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().min(1, "Email é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});
