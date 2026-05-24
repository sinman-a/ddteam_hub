import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  roleTitle: z.string().min(1, "Role is required"),
  photoUrl: z.string().url().optional().or(z.literal("")),
  bioMd: z.string().optional(),
  stackTags: z.array(z.string()).optional(),
  linkedin: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  startDate: z.string().optional(),
  userId: z.string().uuid().optional().nullable(),
});

export const azureSettingsSchema = z.object({
  org: z.string().min(1, "Organization is required"),
  project: z.string().min(1, "Project is required"),
  pat: z.string().min(1, "PAT Token is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type AzureSettingsInput = z.infer<typeof azureSettingsSchema>;
