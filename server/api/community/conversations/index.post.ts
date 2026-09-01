import { requireUser } from '~/server/utils/auth'
import { useDriver } from '~/server/utils/driver'
import { communityStore, createConversation, sanitizeSender } from '~/server/utils/community'

export default defineEventHandler(async (event) => {
  const me = await requireUser(event)
  const body = (await readBody(event)) || {}
  const raw = Array.isArray(body.member_ids) ? body.member_ids.map(String) : []
  const kind = body.kind === 'group' ? 'group' : raw.length > 1 ? 'group' : 'private'
  const members = [...new Set([me.id, ...raw])]

  if (members.length < 2)
    throw createError({ statusCode: 400, message: 'Cần ít nhất một thành viên khác' })

  const db = useDriver()
  const users = (await db.find<any>('users', {})).rows
  const byId = new Map(users.map((u) => [u.id, u]))
  for (const m of members) {
    if (!byId.has(m))
      throw createError({ statusCode: 400, message: 'Thành viên không hợp lệ' })
  }

  let title = String(body.title || '').trim()
  if (kind === 'group' && !title)
    throw createError({ statusCode: 400, message: 'Vui lòng nhập tên nhóm' })

  if (kind === 'private') {
    const existing = communityStore().conversations.find(
      (c) =>
        c.kind === 'private' &&
        c.member_ids.length === members.length &&
        members.every((m) => c.member_ids.includes(m))
    )
    if (existing) return { data: { id: existing.id, existing: true } }
    const other = byId.get(members.find((m) => m !== me.id) as string)
    title = title || String(other?.name || 'Tin nhắn riêng')
  }

  const conv = createConversation(title, members, me.id, kind)

  return {
    data: {
      id: conv.id,
      kind: conv.kind,
      title: conv.title,
      icon: conv.icon,
      member_ids: conv.member_ids,
      members: conv.member_ids.map((m) => sanitizeSender(byId.get(m))),
      created_at: conv.created_at,
      existing: false
    }
  }
})
