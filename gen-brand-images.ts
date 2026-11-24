/**
 * One-off brand image generator — writes premium visuals into public/brand.
 * Run with: bun scripts/gen-brand-images.ts
 */
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'

const OUT = '/home/z/my-project/public/brand'

const JOBS: { file: string; prompt: string }[] = [
  {
    file: 'hero-new.png',
    prompt:
      'Premium 3D render for a digital agency hero: abstract glossy emerald green glass torus and flowing ribbon shapes floating in deep black space, a majestic eagle silhouette formed from glowing green light particles and thin light trails soaring upward, subtle floating glass panels, emerald green and lime green accents, cinematic studio lighting, depth of field, ultra minimal, futuristic, high quality, detailed',
  },
  {
    file: 'about-new.png',
    prompt:
      'Premium 3D render for digital agency about page: modern creative studio with abstract floating geometric glass shapes in emerald green and white, glowing light trails forming an upward arrow, laptop and design elements silhouettes, deep charcoal black background, emerald green accents, cinematic lighting, minimal, futuristic, high quality',
  },
  {
    file: 'service-graphic-new.png',
    prompt:
      'Premium 3D illustration for graphic design service: floating artboards with vibrant brand mockups, color palette swatches, pen tool bezier curves made of glowing green light, typography letter A as 3D glass shape, deep black background, emerald green and lime accents, cinematic studio lighting, minimal futuristic composition, high quality, detailed',
  },
  {
    file: 'service-marketing-new.png',
    prompt:
      'Premium 3D illustration for digital marketing service: floating analytics dashboard panels with rising bar charts and line graphs glowing in green, 3D megaphone with light beam, floating engagement icons, conversion funnel made of glass, deep black background, emerald green and lime accents, cinematic lighting, minimal futuristic, high quality, detailed',
  },
  {
    file: 'service-web-new.png',
    prompt:
      'Premium 3D illustration for web development service: floating layered browser window mockups showing elegant website layouts, responsive devices phone tablet laptop arranged in 3D space, glowing green code brackets floating, deep black background, emerald green and lime accents, cinematic lighting, minimal futuristic composition, high quality, detailed',
  },
  {
    file: 'service-software-new.png',
    prompt:
      'Premium 3D illustration for software development service: floating dashboard application interface panels, terminal window with glowing green code, circuit board pathways with light pulses, modular 3D cubes connecting like architecture diagram, deep black background, emerald green and lime accents, cinematic lighting, minimal futuristic, high quality, detailed',
  },
]

async function main() {
  const zai = await ZAI.create()
  for (const job of JOBS) {
    const out = `${OUT}/${job.file}`
    if (fs.existsSync(out)) {
      console.log(`skip ${job.file} (exists)`)
      continue
    }
    let ok = false
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        console.log(`gen ${job.file} attempt ${attempt}`)
        const res = await zai.images.generations.create({
          prompt: job.prompt,
          size: '1344x768',
        })
        const b64 = res?.data?.[0]?.base64
        if (!b64) throw new Error('empty base64')
        fs.writeFileSync(out, Buffer.from(b64, 'base64'))
        console.log(`done ${job.file} (${fs.statSync(out).size} bytes)`)
        ok = true
      } catch (e) {
        console.error(`fail ${job.file}:`, (e as Error).message)
        await new Promise((r) => setTimeout(r, 2500 * attempt))
      }
    }
  }
  console.log('ALL_DONE')
}

main().catch((e) => {
  console.error('FATAL', e)
  process.exit(1)
})
