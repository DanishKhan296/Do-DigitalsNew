/**
 * DO DIGITALS - Brand asset generation (sequential, resumable).
 * Usage: bun scripts/gen-assets.ts  (skips files that already exist)
 */
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

const OUT_DIR = path.join(process.cwd(), 'public', 'brand')
const PROGRESS = path.join(process.cwd(), 'scripts', 'gen-progress.log')

const BRAND_STYLE =
  'emerald green (#159B35) and fresh lime green (#70C51C) accents, premium modern digital agency aesthetic, clean professional composition, high quality, detailed'

const jobs: { file: string; size: string; prompt: string }[] = [
  { file: 'logo-light.png', size: '1024x1024' as const, prompt: 'Minimalist flat vector logo mark of a soaring eagle with wide spread wings, geometric modern emblem design, emerald green color, centered on pure white background, clean sharp edges, professional brand identity mark, no text, no letters, no words, high quality' },
  { file: 'logo-dark.png', size: '1024x1024' as const, prompt: 'Minimalist flat vector logo mark of a soaring eagle with wide spread wings, geometric modern emblem design, emerald green with subtle lime gradient, centered on pure black background, clean sharp edges, professional brand identity mark, no text, no letters, no words, high quality' },
  { file: 'favicon.png', size: '1024x1024' as const, prompt: 'Modern app icon, rounded square with emerald green gradient background, white soaring eagle silhouette in center, flat minimal design, no text, no letters, high quality' },
  { file: 'hero.png', size: '1344x768' as const, prompt: `Majestic soaring eagle formed by flowing digital light trails and glowing particles rising upward, dark charcoal background, ${BRAND_STYLE}, floating translucent UI cards and growth charts around it, abstract technology shapes, modern 3D render, cinematic lighting, premium, no text` },
  { file: 'og-image.png', size: '1344x768' as const, prompt: `Premium abstract social share banner, soaring eagle silhouette with elegant green light trails over deep dark background, subtle geometric shapes and dots, ${BRAND_STYLE}, minimal composition, no text` },
  { file: 'about.png', size: '1344x768' as const, prompt: `Modern creative digital agency team collaborating in a bright workspace, laptops design mockups and sticky notes on table, plants and emerald green accent wall, friendly flat illustration style with subtle gradients, ${BRAND_STYLE}, professional, no text` },
  { file: 'service-graphic.png', size: '1344x768' as const, prompt: `Creative graphic design studio flat lay, brand identity moodboard with color swatches, logo sketches, typography specimens, business cards, kraft paper and emerald green palette, top view, studio lighting, professional, high quality, no text` },
  { file: 'service-marketing.png', size: '1344x768' as const, prompt: `Digital marketing growth concept, rocket launching over rising analytics bar charts, social media engagement icons floating, ${BRAND_STYLE}, dark background, modern 3D illustration, high quality, no text` },
  { file: 'service-web.png', size: '1344x768' as const, prompt: `Modern web development concept, sleek laptop and smartphone displaying clean responsive website layouts, floating code editor panels, ${BRAND_STYLE}, dark charcoal background, 3D render, professional, no text` },
  { file: 'service-software.png', size: '1344x768' as const, prompt: `Custom software engineering concept, modular application architecture blocks connected by data pipelines, gears and terminal windows, ${BRAND_STYLE}, dark charcoal background, modern 3D illustration, high quality, no text` },
  { file: 'portfolio-1.png', size: '1344x768' as const, prompt: 'Coffee shop brand identity design mockup, logo on coffee cup and packaging with business cards, kraft paper and emerald green color scheme, professional branding presentation, studio lighting, high quality' },
  { file: 'portfolio-2.png', size: '1344x768' as const, prompt: 'Social media campaign presentation, smartphone showing vibrant instagram feed mockups with engagement growth chart beside it, emerald green theme, professional marketing design, high quality' },
  { file: 'portfolio-3.png', size: '1344x768' as const, prompt: 'E-commerce website design displayed on laptop and smartphone mockups, clean product grid layout, emerald green accent colors, floating on soft studio background, professional web design presentation, high quality' },
  { file: 'portfolio-4.png', size: '1344x768' as const, prompt: 'Corporate business website on desktop browser mockup, elegant hero section layout, white and emerald green palette, professional web design showcase, high quality' },
  { file: 'portfolio-5.png', size: '1344x768' as const, prompt: 'Restaurant management software dashboard on desktop monitor, orders tables and analytics panels, dark UI with emerald green charts, professional interface design, high quality' },
  { file: 'portfolio-6.png', size: '1344x768' as const, prompt: 'Fitness studio logo and brand identity mockups, apparel tag and signage, bold geometric eagle emblem, black and emerald green palette, professional branding presentation, high quality' },
  { file: 'portfolio-7.png', size: '1344x768' as const, prompt: 'Real estate landing page design on laptop mockup, property listing hero with search bar, modern clean layout, emerald green accents, professional web design, high quality' },
  { file: 'portfolio-8.png', size: '1344x768' as const, prompt: 'Inventory management desktop application interface, data tables and warehouse statistics charts, dark professional UI with emerald green highlights, software showcase, high quality' },
  { file: 'blog-1.png', size: '1344x768' as const, prompt: 'Strong brand identity concept illustration, logo sketches color palettes and brand guideline sheets arranged neatly, emerald green palette, modern flat illustration, professional, high quality, no text' },
  { file: 'blog-2.png', size: '1344x768' as const, prompt: 'SEO growth strategy concept, large search magnifying glass over rising bar charts with keyword tags floating, emerald green dark theme, modern 3D illustration, high quality, no text' },
  { file: 'blog-3.png', size: '1344x768' as const, prompt: 'Choosing the right website concept, clean flowchart with connected website type icons like cart shop and portfolio, emerald green and charcoal palette, modern flat illustration, high quality, no text' },
]

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}`
  console.log(line)
  fs.appendFileSync(PROGRESS, line + '\n')
}

async function main() {
  process.on('uncaughtException', (e) => log(`UNCAUGHT: ${e.message}`))
  process.on('unhandledRejection', (e) => log(`UNHANDLED: ${String(e)}`))

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
  const zai = await ZAI.create()
  log('ZAI ready')

  let done = 0
  for (const job of jobs) {
    const outPath = path.join(OUT_DIR, job.file)
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10000) {
      log(`SKIP ${job.file} (exists)`)
      continue
    }
    let success = false
    for (let attempt = 1; attempt <= 5 && !success; attempt++) {
      try {
        const res = await zai.images.generations.create({
          prompt: job.prompt,
          size: job.size as '1024x1024' | '1344x768',
        })
        const b64 = res?.data?.[0]?.base64
        if (!b64) throw new Error('empty response')
        fs.writeFileSync(outPath, Buffer.from(b64, 'base64'))
        log(`OK ${job.file}`)
        success = true
        done++
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message.split('\n')[0] : String(e)
        log(`FAIL(${attempt}) ${job.file}: ${msg.slice(0, 120)}`)
        await new Promise((r) => setTimeout(r, attempt * 5000))
      }
    }
  }
  log(`FINISHED. Generated this run: ${done}`)
}

main()
