import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function init() {
  console.log("Creating tables...");

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'member', 'viewer')),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS team_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      role_title TEXT NOT NULL,
      photo_url TEXT,
      bio_md TEXT,
      stack_tags TEXT[],
      linkedin TEXT,
      github TEXT,
      start_date DATE
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS azure_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org TEXT NOT NULL,
      project TEXT NOT NULL,
      pat_encrypted TEXT NOT NULL,
      last_sync_at TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS kpi_cache (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      metric_name TEXT NOT NULL,
      period INTEGER NOT NULL,
      value_json JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(metric_name, period)
    )
  `;

  console.log("All tables created successfully!");
}

init().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
