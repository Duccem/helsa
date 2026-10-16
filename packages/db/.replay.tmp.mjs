import postgres from "postgres";
import fs from "node:fs";
const sql = postgres(process.env.DATABASE_URL, { max: 1, onnotice: () => {} });
const stmts = fs.readFileSync(`src/migrations/20261016012918_round_steel_serpent/migration.sql`,"utf8").split("--> statement-breakpoint").map(s=>s.trim()).filter(Boolean);
let ok = true;
await sql.begin(async (tx) => {
  for (const [i, s] of stmts.entries()) {
    try { await tx.unsafe(s); } catch (e) { ok = false; console.log("FAILED #"+i, s, "\n=>", e.message, e.detail ?? ""); break; }
  }
  throw new Error("rollback");
}).catch(e => e.message === "rollback" || console.log(e));
console.log(ok ? `ALL ${stmts.length} STATEMENTS OK (rolled back)` : "FAILED");
await sql.end();
