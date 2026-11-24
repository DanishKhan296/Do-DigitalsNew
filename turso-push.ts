// Bun-only maintenance script (run with: bun run turso:push).
// bun:sqlite and import.meta.dir are Bun runtime APIs — skipped for tsc.
// @ts-nocheck

/**
 * Push the Prisma schema AND all data from the local SQLite file (db/custom.db)
 * to a hosted Turso (libSQL) database.
 *
 * Usage:
 *   1. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env (see .env.example)
 *   2. bun run turso:push
 *
 * Safe to run multiple times:
 *   - "already exists" DDL errors are ignored
 *   - rows are copied with INSERT OR REPLACE (idempotent by primary key)
 */

import { createClient, type InValue } from '@libsql/client'
import { execSync } from 'node:child_process'
import { Database } from 'bun:sqlite'
import path from 'node:path'

// Bun auto-loads .env — but call this early for clarity
const url = process.env.TURSO_DATABASE_URL?.trim() || ''
const token = process.env.TURSO_AUTH_TOKEN?.trim() || ''

if (!url || !token) {
  console.error(
    '✗ Missing Turso credentials.\n' +
      '  Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env\n' +
      '  (find both in the Turso dashboard → your database → Connect)'
  )
  process.exit(1)
}

const root = path.resolve(import.meta.dir, '..')

// 1. Generate the full DDL from prisma/schema.prisma
console.log('→ Generating schema SQL from prisma/schema.prisma ...')
const ddl = execSync(
  'bunx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script',
  { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
)

// 2. Connect to Turso
console.log(`→ Connecting to ${url} ...`)
const turso = createClient({ url, authToken: token })
await turso.execute('SELECT 1')
console.log('✓ Connected')

// 3. Apply the schema
console.log('→ Applying schema ...')
try {
  await turso.executeMultiple('PRAGMA foreign_keys = OFF;\n' + ddl)
  console.log('✓ Schema applied')
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes('already exists')) {
    console.log('• Schema (partially) existed already — continuing')
  } else {
    throw err
  }
}

// 4. Copy data from the local SQLite snapshot
const local = new Database(path.join(root, 'db/custom.db'), { readonly: true })
const tables = (
  local
    .query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all() as { name: string }[]
).map((r) => r.name)

// Parents first so relational rows always have their targets
const ORDER = [
  'AdminUser',
  'SiteContent',
  'NavigationItem',
  'SocialLink',
  'Statistic',
  'Service',
  'ServiceFaq',
  'PortfolioCategory',
  'PortfolioProject',
  'BlogCategory',
  'BlogPost',
  'Testimonial',
  'ContactInquiry',
  'MediaAsset',
  'ActivityLog',
]
const ordered = [
  ...ORDER.filter((t) => tables.includes(t)),
  ...tables.filter((t) => !ORDER.includes(t)),
]

await turso.executeMultiple('PRAGMA foreign_keys = OFF;')
let total = 0
for (const table of ordered) {
  const cols = (
    local.query(`SELECT name FROM pragma_table_info('${table}')`).all() as { name: string }[]
  ).map((c) => c.name)
  if (cols.length === 0) continue
  const rows = local.query(`SELECT * FROM "${table}"`).all() as Record<string, unknown>[]
  const colList = cols.map((c) => `"${c}"`).join(', ')
  const placeholders = cols.map(() => '?').join(', ')
  for (const row of rows) {
    await turso.execute(
      `INSERT OR REPLACE INTO "${table}" (${colList}) VALUES (${placeholders})`,
      cols.map((c) => row[c] as InValue)
    )
  }
  total += rows.length
  console.log(`  • ${table}: ${rows.length} rows`)
}

// 5. Verify
console.log('\n→ Verifying remote counts ...')
for (const table of ordered) {
  const res = await turso.execute(`SELECT COUNT(*) AS n FROM "${table}"`)
  console.log(`  • ${table}: ${res.rows[0]?.n ?? 0} rows`)
}

await turso.executeMultiple('PRAGMA foreign_keys = ON;')
local.close()
console.log(`\n✓ Done — ${total} rows synced to Turso (${url})`)
