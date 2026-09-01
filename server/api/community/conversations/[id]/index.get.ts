import { currentUser } from '~/server/utils/auth'
import { useDriver } from '~/server/utils/driver'
import { canRead, communityStore, sanitizeSender } from '~/server/utils/community'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const viewer = await currentUser(event)
  const conv = communityStore().conversations.find((c) => c.id === id)
  if (!conv) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy cuộc trò chuyện' })
  if (!canRead(conv, viewer?.id))
    throw createError({ statusCode: 403, statusMessage: 'Bạn không có quyền xem cuộc trò chuyện này' })

  const users = (await useDriver().find<any>('users', {})).rows
  const byId = new Map(users.map((u) => [u.id, u]))
  const partnerId =
    conv.kind === 'private' && viewer ? conv.member_ids.find((m) => m !== viewer.id) : ''
  const partner = partnerId ? sanitizeSender(byId.get(partnerId)) : null

  return {
    data: {
      id: conv.id,
      kind: conv.kind,
      title: conv.kind === 'private' && partner ? partner.name : conv.title,
      subtitle: conv.subtitle,
      icon: conv.icon,
      avatar: partner?.avatar || '',
      verified: partner?.verified || false,
      partner,
      member_ids: conv.member_ids,
      members: conv.member_ids.map((m) => sanitizeSender(byId.get(m))).filter(Boolean),
      created_at: conv.created_at,
      updated_at: conv.updated_at
    }
  }
})
