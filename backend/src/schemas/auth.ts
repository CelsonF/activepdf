import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  role: z.enum(["teacher", "student"]),
  teacherEmail: z.string().trim().email("Email do professor inválido").optional().or(z.literal("")),
  organizationName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().min(1, "Email é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});
