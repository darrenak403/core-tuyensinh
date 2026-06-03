/**
 * Database migrations + optional seed (idempotent).
 * Usage: bun run src/database/migrate.ts [--reset] [--yes]
 */
import { SQL } from "bun";
import { readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { env } from "@config/env";

const ROOT = join(import.meta.dir, "../..");
const SCHEMA_DIR = join(ROOT, "src/database/schema");
const VIEWS_DIR = join(SCHEMA_DIR, "05_views");
const SEEDS_DIR = join(ROOT, "src/database/seeds");

const args = process.argv.slice(2);
const shouldReset = args.includes("--reset");
const assumeYes = args.includes("--yes");

const db = new SQL({
  url: env.DATABASE_URL,
  max: 1,
});

async function confirmReset(): Promise<boolean> {
  if (assumeYes) return true;
  process.stdout.write(
    "⚠️  Reset sẽ xóa toàn bộ schema + data. Tiếp tục? (y/N): ",
  );
  const buf = Buffer.alloc(16);
  const n = await Bun.stdin.read(buf);
  const answer = (n ? buf.subarray(0, n).toString() : "").trim().toLowerCase();
  return answer === "y" || answer === "yes";
}

async function resetDatabase(): Promise<void> {
  console.log("🗑️  Reset database...");
  await db`DROP SCHEMA IF EXISTS public CASCADE`;
  await db`CREATE SCHEMA public`;
  await db`GRANT ALL ON SCHEMA public TO postgres`;
  await db`GRANT ALL ON SCHEMA public TO public`;
}

async function ensureMigrationsTable(): Promise<void> {
  await db`
    CREATE TABLE IF NOT EXISTS _schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

async function getAppliedMigrations(): Promise<Set<string>> {
  await ensureMigrationsTable();
  const rows = await db<{ name: string }[]>`SELECT name FROM _schema_migrations`;
  return new Set(rows.map((r) => r.name));
}

async function runSqlFile(filePath: string): Promise<void> {
  const sql = await Bun.file(filePath).text();
  await db.unsafe(sql);
}

async function listSqlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".sql"))
    .map((e) => join(dir, e.name))
    .sort((a, b) => a.localeCompare(b));
}

async function applyMigrations(
  applied: Set<string>,
  files: { key: string; path: string }[],
): Promise<void> {
  for (const { key, path } of files) {
    if (applied.has(key)) {
      console.log(`⏭️  ${key} (đã chạy)`);
      continue;
    }
    console.log(`▶️  ${key}...`);
    await runSqlFile(path);
    await db`INSERT INTO _schema_migrations (name) VALUES (${key})`;
    console.log(`✅ ${key}`);
  }
}

async function hasSeedData(): Promise<boolean> {
  try {
    const [row] = await db<{ count: number }[]>`
      SELECT COUNT(*)::int AS count FROM departments
    `;
    return (row?.count ?? 0) > 0;
  } catch {
    return false;
  }
}

async function applySeeds(applied: Set<string>): Promise<void> {
  if (await hasSeedData()) {
    console.log("⏭️  Seed bỏ qua — database đã có dữ liệu (departments)");
    return;
  }

  console.log("🌱 Seed data...");
  const paths = await listSqlFiles(SEEDS_DIR);
  for (const path of paths) {
    const key = `seed:${basename(path)}`;
    if (applied.has(key)) {
      console.log(`⏭️  ${key} (đã chạy)`);
      continue;
    }
    console.log(`▶️  ${key}...`);
    try {
      await runSqlFile(path);
      await db`INSERT INTO _schema_migrations (name) VALUES (${key})`;
      console.log(`✅ ${key}`);
    } catch (error) {
      console.warn(`⚠️  ${key}:`, error);
      if (await hasSeedData()) {
        await db`INSERT INTO _schema_migrations (name) VALUES (${key}) ON CONFLICT DO NOTHING`;
      } else {
        throw error;
      }
    }
  }
}

async function countTable(
  table: "departments" | "programs" | "campuses" | "scholarships" | "users",
): Promise<number | null> {
  const counts = {
    departments: () => db`SELECT COUNT(*)::int AS count FROM departments`,
    programs: () => db`SELECT COUNT(*)::int AS count FROM programs`,
    campuses: () => db`SELECT COUNT(*)::int AS count FROM campuses`,
    scholarships: () => db`SELECT COUNT(*)::int AS count FROM scholarships`,
    users: () => db`SELECT COUNT(*)::int AS count FROM users`,
  };
  const [row] = await counts[table]();
  return row?.count ?? 0;
}

async function printStats(): Promise<void> {
  const tables = [
    "departments",
    "programs",
    "campuses",
    "scholarships",
    "users",
  ] as const;
  console.log("\n📊 Thống kê:");
  for (const table of tables) {
    try {
      console.log(`   ${table}: ${await countTable(table)}`);
    } catch {
      console.log(`   ${table}: —`);
    }
  }
}

async function main(): Promise<void> {
  const safeUrl = env.DATABASE_URL.replace(/:[^:@]+@/, ":****@");
  console.log(`🔗 ${safeUrl}`);

  if (shouldReset) {
    if (!(await confirmReset())) {
      console.log("Đã hủy.");
      process.exit(0);
    }
    await resetDatabase();
  }

  await ensureMigrationsTable();
  let applied = await getAppliedMigrations();

  const schemaPaths = await listSqlFiles(SCHEMA_DIR);
  const viewPaths = await listSqlFiles(VIEWS_DIR);
  const migrations = [
    ...schemaPaths.map((path) => ({
      key: `schema:${basename(path)}`,
      path,
    })),
    ...viewPaths.map((path) => ({
      key: `view:${basename(path)}`,
      path,
    })),
  ];

  console.log("\n🚀 Migrations...");
  await applyMigrations(applied, migrations);

  applied = await getAppliedMigrations();
  await applySeeds(applied);

  await printStats();
  console.log("\n✅ Xong.");
  await db.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
