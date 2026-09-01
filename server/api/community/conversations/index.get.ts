import { currentUser } from '~/server/utils/auth'
import { useDriver } from '~/server/utils/driver'
import {
  conversationsFor,
  lastMessageOf,
  sanitizeSender,
  unreadCount
} from '~/server/utils/community'

export default defineEventHandler(async (event) => {
  const viewer = await currentUser(event)
  const list = conversationsFor(viewer?.id)
  const users = (await useDriver().find<any>('users', {})).rows
  const byId = new Map(users.map((u) => [u.id, u]))

  const items = list.map((c) => {
    const last = lastMessageOf(c.id)
    const partnerId =
      c.kind === 'private' && viewer ? c.member_ids.find((m) => m !== viewer.id) : ''
    const partner = partnerId ? sanitizeSender(byId.get(partnerId)) : null
    return {
      id: c.id,
      kind: c.kind,
      title: c.kind === 'private' && partner ? partner.name : c.title,
      subtitle: c.subtitle,
      icon: c.icon,
      avatar: partner?.avatar || '',
      verified: partner?.verified || false,
      member_ids: c.member_ids,
      members_count: c.member_ids.length,
      partner,
      unread: unreadCount(c.id, viewer?.id),
      last_message: last
        ? {
            id: last.id,
            body: last.body,
            type: last.type,
            created_at: last.created_at,
            sender: sanitizeSender(byId.get(last.sender_id))
          }
        : null,
      created_at: c.created_at,
      updated_at: c.updated_at
    }
  })

  items.sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))

  return { data: { items, total: items.length } }
})
