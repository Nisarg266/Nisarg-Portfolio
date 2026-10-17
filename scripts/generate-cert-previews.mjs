/**
 * Generates first-page preview images for the certificates gallery.
 * The gallery on /certifications shows these previews, and opens the
 * original PDF itself in the lightbox — so run this script whenever a
 * new certificate file is added to public/Certificat.
 *
 * Run:    node scripts/generate-cert-previews.mjs
 * Output: public/Certificat/previews/<slug>.jpg
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { pdf } from 'pdf-to-img'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, 'public', 'Certificat')
const outDir = path.join(srcDir, 'previews')
fs.mkdirSync(outDir, { recursive: true })

// pdfjs needs its shipped fonts + cmaps so PDFs that rely on standard fonts
// (or non-latin scripts) render faithfully instead of showing garbled text.
const require = createRequire(path.join(root, 'package.json'))
const pdfjsRoot = path.dirname(require.resolve('pdfjs-dist/package.json'))
// pdfjs v6 in Node cannot load file:// URLs for these data factories, and
// backslash paths fail its validation — forward slashes with a trailing
// slash work reliably, even when the project path contains spaces.
const fwd = (p) => p.replace(/\\/g, '/') + '/'
const docInitParams = {
  standardFontDataUrl: fwd(path.join(pdfjsRoot, 'standard_fonts')),
  cMapUrl: fwd(path.join(pdfjsRoot, 'cmaps')),
  cMapPacked: true,
}

// source file (inside public/Certificat)  ->  preview slug
const FILES = {
  '8844275_56492841755977000831_copy.pdf': 'data-structures-c',
  'CSS-Certificate_Free-CSS-Course-with-Certificate-Hindi_Nisarg-Panchal.pdf': 'css-course',
  'Data Set 2600.pdf': 'ai-prompt-engineering',
  'HTML-Certificate_Free-HTML-Certification-Course-Hindi_Nisarg-Panchal.pdf': 'html-course',
  'Introduction-to-JavaScript_Free-JavaScript-Certification-Course-Hindi_Nisarg-Panchal.pdf': 'javascript-course',
  'LUEDAPYTNOV1231997.pdf': 'lue-dapy',
  'LUEHTMLFEB124575.pdf': 'lue-html',
  'LUEJAIGFEB124317.pdf': 'lue-jai',
  'LUENJSFEB124227.pdf': 'lue-njs',
  'Nisarg Panchal.pdf': 'internship-sahajanand',
  'kkE9HyeNcw6rwCRGw_pmnMSL4QiQ9JCgE3W_GX6SSsGo23GqDsGHx_1736014637464_completion_certificate.pdf': 'aws-forage',
  'sd.pdf': 'sd',
  'tops-webinar-certificate.pdf': 'tops-mern',
  'tops-webinar-certificate (1).pdf': 'tops-manual-testing',
  'tops-webinar-certificate (1)55.pdf': 'tops-web-security',
  'tops-webinar-certificate (3).pdf': 'tops-data-science',
  'tops-webinar-certificate22.pdf': 'tops-motion-graphics',
}

for (const [file, slug] of Object.entries(FILES)) {
  const src = path.join(srcDir, file)
  if (!fs.existsSync(src)) {
    console.log(`SKIP ${file} (not found)`)
    continue
  }
  try {
    const doc = await pdf(src, { scale: 2, format: 'jpg', docInitParams })
    const page = await doc.getPage(1)
    const out = path.join(outDir, `${slug}.jpg`)
    fs.writeFileSync(out, page)
    console.log(`OK   ${file} -> previews/${slug}.jpg (${Math.round(page.length / 1024)} KB)`)
    await doc.destroy()
  } catch (e) {
    console.log(`ERR  ${file}: ${e.message}`)
  }
}

console.log('\nDone.')
