/**
 * Verify the Turso migration: connect to Turso (via the same adapter the app
 * uses) and check every requirement — tables, admin account, and all website
 * content (services, portfolio, blog, media, inquiries).
 *
 * Usage:
 *   1. TURSO_DATABASE_URL + TURSO_AUTH_TOKEN set in .env
 *   2. bun run turso:verify
 *
 * Expects the local backup at db/backups/*.db (or db/custom.db) for
 * count comparison.
 */

import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import { Database } from 'bun:sqlite'
import path from 'node:path'

const url = process.env.TURSO_DATABASE_URL?.trim() || ''
const token = process.env.TURSO_AUTH_TOKEN?.trim() || ''

if (!/^libsql:\/\//i.test(url) || !token) {
  console.error('✗ Set TURSO_DATABASE_URL (libsql://…) and TURSO_AUTH_TOKEN in .env first.')
  process.exit(1)
}

console.log(`→ Connecting to Turso (${url}) ...`)
const adapter = new PrismaLibSQL({ url, authToken: token })
const db = new PrismaClient({ adapter })
const raw = createClient({ url, authToken: token })

// Local reference for count comparison
const localPath = path.resolve(import.meta.dir, '../db/custom.db')
const local = new Database(localPath, { readonly: true })

const TABLES = [
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

// Prisma client exposes models as camelCase properties (prisma.adminUser, …)
const MODEL_KEYS: Record<string, string> = Object.fromEntries(
  TABLES.map((t) => [t, t.charAt(0).toLowerCase() + t.slice(1)])
)

let failures = 0
console.log('\n=== Row counts (Turso vs local snapshot) ===')
for (const table of TABLES) {
  const model = (db as unknown as Record<string, { count: () => Promise<number> }>)[
    MODEL_KEYS[table] ?? table
  ]
  const remote = await model.count()
  const localN = (
    local.query(`SELECT COUNT(*) as n FROM "${table}"`).get() as { n: number }
  ).n
  const ok = remote === localN
  if (!ok) failures++
  console.log(`  ${ok ? '✓' : '✗'} ${table}: turso=${remote} local=${localN}`)
}

console.log('\n=== Requirement checks ===')
// Admin account present with bcrypt hash
const admin = await db.adminUser.findFirst()
if (admin && admin.passwordHash.startsWith('$2')) {
  console.log(`  ✓ AdminUser "${admin.username}" present, password is bcrypt-hashed`)
} else {
  failures++
  console.log('  ✗ AdminUser missing or password not bcrypt')
}

// Content samples
const svc = await db.service.findMany({ take: 2, select: { title: true, slug: true } })
console.log(`  ✓ Services sample: ${svc.map((s) => s.title).join(', ')}`)
const pf = await db.portfolioProject.findMany({ take: 2, select: { title: true } })
console.log(`  ✓ Portfolio sample: ${pf.map((p) => p.title).join(', ')}`)
const bp = await db.blogPost.findMany({ take: 2, select: { title: true } })
console.log(`  ✓ Blog sample: ${bp.map((b) => b.title).join(', ')}`)

// Media: URL-type assets point at files that must exist in public/
const media = await db.mediaAsset.findMany({ select: { filename: true, url: true, data: true } })
const fs = await import('node:fs')
let mediaOk = true
for (const m of media) {
  if (m.data) continue
  const p = path.resolve(import.meta.dir, '../public', (m.url || '').replace(/^\//, ''))
  if (!fs.existsSync(p)) {
    mediaOk = false
    console.log(`  ✗ Media "${m.filename}" points to missing file: ${m.url}`)
  }
}
if (mediaOk) console.log(`  ✓ All ${media.length} media assets resolve (URL files exist / bytes stored)`)
else failures++

// Inquiries preserved
const inq = await db.contactInquiry.count()
console.log(`  ✓ ContactInquiry rows preserved: ${inq}`)

// Write test (the reason SQLite alone can't run on Vercel)
const stamp = `verify-${Date.now()}`
// SiteContent's primary key is the "key" column (no id column exists)
await raw.execute(`INSERT INTO SiteContent (key, value, updatedAt) VALUES (?, ?, ?)`, [
  `_turso_verify_${stamp}`,
  stamp,
  new Date().toISOString(),
])
const written = await raw.execute({
  sql: `SELECT value FROM SiteContent WHERE key = ?`,
  args: [`_turso_verify_${stamp}`],
})
if (String(written.rows[0]?.value) === stamp) {
  console.log('  ✓ Write test passed — Turso accepts writes (persistent storage confirmed)')
  await raw.execute({ sql: `DELETE FROM SiteContent WHERE key = ?`, args: [`_turso_verify_${stamp}`] })
} else {
  failures++
  console.log('  ✗ Write test failed')
}

await db.$disconnect()
local.close()
console.log(failures === 0 ? '\n✓ ALL CHECKS PASSED — migration verified' : `\n✗ ${failures} check(s) failed`)
process.exit(failures === 0 ? 0 : 1)
