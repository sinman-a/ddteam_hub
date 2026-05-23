import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  integer,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "member", "viewer"] })
    .default("viewer")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teamProfiles = pgTable("team_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  roleTitle: text("role_title").notNull(),
  photoUrl: text("photo_url"),
  bioMd: text("bio_md"),
  stackTags: text("stack_tags").array(),
  linkedin: text("linkedin"),
  github: text("github"),
  startDate: date("start_date"),
});

export const azureSettings = pgTable("azure_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  org: text("org").notNull(),
  project: text("project").notNull(),
  patEncrypted: text("pat_encrypted").notNull(),
  lastSyncAt: timestamp("last_sync_at"),
});

export const kpiCache = pgTable(
  "kpi_cache",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    metricName: text("metric_name").notNull(),
    period: integer("period").notNull(),
    valueJson: jsonb("value_json").notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    uniqueMetricPeriod: unique().on(t.metricName, t.period),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type TeamProfile = typeof teamProfiles.$inferSelect;
export type NewTeamProfile = typeof teamProfiles.$inferInsert;
export type AzureSettings = typeof azureSettings.$inferSelect;
export type KpiCache = typeof kpiCache.$inferSelect;
