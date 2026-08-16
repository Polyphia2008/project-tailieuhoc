#!/usr/bin/env node
/**
 * Chuyen doi cac <i> dung :class dong -> <AppIcon :name="..." />
 * Chay: node scripts/migrate-icons-dyn.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const DRY = process.argv.includes('--dry')

const files = execSync(
  `grep -rl 'fa-solid\\|fa-regular\\|fa-brands' --include=*.vue /home/user/webapp/components /home/user/webapp/layouts /home/user/webapp/pages 2>/dev/null || true`
).toString().trim().split('\n').filter(Boolean).filter((f) => !f.endsWith('AppIcon.vue'))

let total = 0

for (const file of files) {
  let src = readFileSync(file, 'utf8')
  let count = 0

  // Co v-for/:key phia truoc: <i v-for=".." :key=".." class="fa-star" :class="EXPR" />
  src = src.replace(
    /<i\s+(v-for="[^"]*"\s+:key="[^"]*")\s+class="([^"]*?)"\s+:class="([^"]*?)"\s*(?:\/>|>\s*<\/i>)/g,
    (m, loop, staticCls, expr) => {
      const rest = staticCls.split(/\s+/).filter((t) => t && !t.startsWith('fa-'))
      count++
      const clsAttr = rest.length ? ` class="${rest.join(' ')}"` : ''
      return `<AppIcon ${loop} :name="${expr.trim()}"${clsAttr} />`
    }
  )

  // <i class="fa-solid <static...>" :class="EXPR" />
  src = src.replace(
    /<i\s+class="([^"]*?)"\s+:class="([^"]*?)"\s*(?:\/>|>\s*<\/i>)/g,
    (m, staticCls, expr) => {
      const rest = staticCls.split(/\s+/).filter((t) => t && !t.startsWith('fa-'))
      count++
      const clsAttr = rest.length ? ` class="${rest.join(' ')}"` : ''
      return `<AppIcon :name="${expr.trim()}"${clsAttr} />`
    }
  )

  // Dao thu tu: <i :class="..." class="..." />
  src = src.replace(
    /<i\s+:class="([^"]*?)"\s+class="([^"]*?)"\s*(?:\/>|>\s*<\/i>)/g,
    (m, expr, staticCls) => {
      const rest = staticCls.split(/\s+/).filter((t) => t && !t.startsWith('fa-'))
      count++
      const clsAttr = rest.length ? ` class="${rest.join(' ')}"` : ''
      return `<AppIcon :name="${expr.trim()}"${clsAttr} />`
    }
  )

  if (count > 0) {
    total += count
    if (!DRY) writeFileSync(file, src)
    console.log(`${DRY ? '[dry] ' : ''}${String(count).padStart(3)}  ${file.replace('/home/user/webapp/', '')}`)
  }
}

console.log(`\n${DRY ? '[DRY] ' : ''}Tong: ${total} icon dong`)
