#!/usr/bin/env node
/**
 * Chuyen doi <i class="fa-solid fa-xxx ..."></i>  ->  <AppIcon name="fa-xxx" class="..." />
 * Chay: node scripts/migrate-icons.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const DRY = process.argv.includes('--dry')

const files = execSync(
  `grep -rl 'fa-solid\\|fa-regular\\|fa-brands' --include=*.vue /home/user/webapp/components /home/user/webapp/layouts /home/user/webapp/pages /home/user/webapp/app.vue /home/user/webapp/error.vue 2>/dev/null || true`
).toString().trim().split('\n').filter(Boolean).filter((f) => !f.endsWith('AppIcon.vue'))

// Icon nen dung style "bold" cho noi bat
const BOLD = new Set(['fa-star', 'fa-fire', 'fa-heart', 'fa-circle-check', 'fa-check', 'fa-bolt', 'fa-trophy'])

let totalIcons = 0
let changedFiles = 0

for (const file of files) {
  const src = readFileSync(file, 'utf8')
  let count = 0

  // <i class="..."></i>  hoac  <i class="..." />
  const out = src.replace(
    /<i\s+([^>]*?)class="([^"]*?(?:fa-solid|fa-regular|fa-brands)[^"]*?)"([^>]*?)\s*(?:\/>|>\s*<\/i>)/g,
    (m, pre, cls, post) => {
      const tokens = cls.split(/\s+/).filter(Boolean)
      const faName = tokens.find(
        (t) => t.startsWith('fa-') && !['fa-solid', 'fa-regular', 'fa-brands', 'fa-fw', 'fa-spin', 'fa-xs', 'fa-sm', 'fa-lg', 'fa-xl', 'fa-2x', 'fa-3x'].includes(t)
      )
      if (!faName) return m

      const rest = tokens.filter((t) => !t.startsWith('fa-'))

      const attrs = [`name="${faName}"`]
      if (BOLD.has(faName)) attrs.push('variant="bold"')
      if (rest.length) attrs.push(`class="${rest.join(' ')}"`)

      const extra = `${(pre || '').trim()} ${(post || '').trim()}`.trim()
      if (extra) attrs.push(extra)

      count++
      return `<AppIcon ${attrs.join(' ')} />`
    }
  )

  if (count > 0) {
    totalIcons += count
    changedFiles++
    if (!DRY) writeFileSync(file, out)
    console.log(`${DRY ? '[dry] ' : ''}${String(count).padStart(3)} icon  ${file.replace('/home/user/webapp/', '')}`)
  }
}

console.log(`\n${DRY ? '[DRY RUN] ' : ''}Tong: ${totalIcons} icon / ${changedFiles} file`)
