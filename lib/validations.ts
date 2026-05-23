import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Невірний email"),
  password: z.string().min(6, "Мінімум 6 символів"),
});

export const registerSchema = z.object({
  email: z.string().email("Невірний email"),
  password: z.string().min(6, "Мінімум 6 символів"),
});

export const profileSchema = z.object({
  name: z.string().min(1, "Ім'я обов'язкове"),
  roleTitle: z.string().min(1, "Роль обов'язкова"),
  photoUrl: z.string().url().optional().or(z.literal("")),
  bioMd: z.string().optional(),
  stackTags: z.array(z.string()).optional(),
  linkedin: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  startDate: z.string().optional(),
  userId: z.string().uuid().optional().nullable(),
});

export const azureSettingsSchema = z.object({
  org: z.string().min(1, "Organization обов'язкова"),
  project: z.string().min(1, "Project обов'язковий"),
  pat: z.string().min(1, "PAT Token обов'язковий"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type AzureSettingsInput = z.infer<typeof azureSettingsSchema>;
