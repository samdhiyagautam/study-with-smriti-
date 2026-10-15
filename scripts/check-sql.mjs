/**
 * Offline SQL syntax validation for the Supabase migrations/seed files
 * using libpg_query (PostgreSQL's real parser compiled to WASM).
 * Usage: node scripts/check-sql.mjs
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parse } from "pgsql-parser";

const dirs = ["supabase/migrations", "supabase"];
const files = [];

for (const dir of dirs) {
  const entries = await readdir(dir).catch(() => []);
  for (const entry of entries) {
    if (entry.endsWith(".sql")) files.push(path.join(dir, entry));
  }
}

let failed = 0;
for (const file of [...new Set(files)]) {
  const sql = await readFile(file, "utf8");
  try {
    const result = await parse(sql);
    const count = Array.isArray(result)
      ? result.length
      : result?.stmts?.length ?? 0;
    console.log(`OK   ${file} (${count} statements)`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${file}\n     ${error.message}`);
  }
}

process.exit(failed === 0 ? 0 : 1);
