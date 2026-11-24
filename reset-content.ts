/**
 * Reset content blobs back to defaults (keeps entities like services/portfolio).
 * Usage: bun scripts/reset-content.ts [key...]
 * Without args, resets all content keys.
 */
import { db } from '../src/lib/db'
import {
  DEFAULT_SETTINGS,
  DEFAULT_HOME,
  DEFAULT_ABOUT,
  DEFAULT_FOOTER,
  DEFAULT_SEO,
  DEFAULT_CONTACT_PAGE,
  DEFAULT_PRIVACY,
  DEFAULT_TERMS,
} from '../src/lib/defaults'

const ALL: Record<string, unknown> = {
  settings: DEFAULT_SETTINGS,
  home: DEFAULT_HOME,
  about: DEFAULT_ABOUT,
  footer: DEFAULT_FOOTER,
  seo: DEFAULT_SEO,
  contact_page: DEFAULT_CONTACT_PAGE,
  privacy: DEFAULT_PRIVACY,
  terms: DEFAULT_TERMS,
}

async function main() {
  const keys = process.argv.slice(2)
  const targets = keys.length ? keys : Object.keys(ALL)
  for (const key of targets) {
    const value = ALL[key]
    if (!value) {
      console.log(`Unknown key: ${key}`)
      continue
    }
    await db.siteContent.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    })
    console.log(`Reset: ${key}`)
  }
  await db.$disconnect()
}

main()
