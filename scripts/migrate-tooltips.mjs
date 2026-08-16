#!/usr/bin/env node
/**
 * Bọc các nút icon có class="act" + title="..." bằng <UiTooltip text="...">.
 * An toàn: chỉ xử lý element <button>/<NuxtLink> có class chứa "act" VÀ có title tĩnh.
 * Bỏ qua element đã nằm trong UiTooltip. Idempotent. Hỗ trợ --dry.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const DRY = process.argv.includes('--dry')

const files = execSync(
  `grep -rl 'class="act' pages components layouts --include=*.vue || true`,
  { encoding: 'utf8' }
).trim().split('\n').filter(Boolean)

const TAGS = ['button', 'NuxtLink', 'a']

/** Tìm vị trí đóng của element bắt đầu tại idx (đã biết tên tag) */
function findElementEnd(src, startIdx, tag) {
  // tìm cuối open-tag
  let i = startIdx
  let inQuote = null
  while (i < src.length) {
    const ch = src[i]
    if (inQuote) {
      if (ch === inQuote) inQuote = null
    } else if (ch === '"' || ch === "'") inQuote = ch
    else if (ch === '>') break
    i++
  }
  if (i >= src.length) return -1
  const openEnd = i
  if (src[i - 1] === '/') return openEnd + 1 // self-closing

  // đếm nesting
  let depth = 1
  let j = openEnd + 1
  const openRe = new RegExp(`<${tag}[\\s/>]`, 'g')
  const closeRe = new RegExp(`</${tag}\\s*>`, 'g')
  while (j < src.length) {
    openRe.lastIndex = j
    closeRe.lastIndex = j
    const mo = openRe.exec(src)
    const mc = closeRe.exec(src)
    if (!mc) return -1
    if (mo && mo.index < mc.index) {
      depth++
      j = mo.index + 1
    } else {
      depth--
      j = mc.index + mc[0].length
      if (depth === 0) return j
    }
  }
  return -1
}

let totalWrapped = 0
const touched = []

for (const file of files) {
  let src = readFileSync(file, 'utf8')
  let changed = 0
  let cursor = 0

  while (true) {
    let found = null
    for (const tag of TAGS) {
      const re = new RegExp(`<${tag}(?=[\\s>])`, 'g')
      re.lastIndex = cursor
      const m = re.exec(src)
      if (m && (!found || m.index < found.index)) found = { index: m.index, tag }
    }
    if (!found) break

    const end = findElementEnd(src, found.index, found.tag)
    if (end < 0) { cursor = found.index + 1; continue }

    const el = src.slice(found.index, end)
    const openTag = el.slice(0, el.indexOf('>') + 1)

    const hasAct = /class="[^"]*\bact\b[^"]*"/.test(openTag)
    const titleM = openTag.match(/\s+title="([^"{}]+)"/)

    if (!hasAct || !titleM) { cursor = found.index + 1; continue }

    // đã bọc rồi?
    const before = src.slice(Math.max(0, found.index - 200), found.index)
    if (/<UiTooltip[^>]*>\s*$/.test(before)) { cursor = end; continue }

    const text = titleM[1]
    const newOpen = openTag.replace(titleM[0], '')
    const newEl = newOpen + el.slice(openTag.length)

    // giữ indent
    const lineStart = src.lastIndexOf('\n', found.index) + 1
    const indent = src.slice(lineStart, found.index).match(/^\s*/)[0]
    const inner = newEl.split('\n').join('\n  ')
    const wrapped = `<UiTooltip text="${text}">\n${indent}  ${inner}\n${indent}</UiTooltip>`

    src = src.slice(0, found.index) + wrapped + src.slice(end)
    cursor = found.index + wrapped.length
    changed++
  }

  if (changed) {
    totalWrapped += changed
    touched.push(`${file} (${changed})`)
    if (!DRY) writeFileSync(file, src, 'utf8')
  }
}

console.log(touched.join('\n'))
console.log(`\n${DRY ? '[DRY] ' : ''}Đã bọc ${totalWrapped} nút icon trong ${touched.length} file.`)
