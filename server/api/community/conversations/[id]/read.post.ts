import { requireUser } from '~/server/utils/auth'
import { canRead, communityStore, markRead, unreadCount } from '~/server/utils/community'

export default defineEventHandler(async (event) => {
  const me = await requireUser(event)
  const id = getRouterParam(event, 'id') as string
  const conv = communityStore().conversations.find((c) => c.id === id)
  if (!conv) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy cuộc trò chuyện' })
  if (!canRead(conv, me.id))
    throw createError({ statusCode: 403, statusMessage: 'Bạn không có quyền truy cập' })

  const updated = markRead(conv.id, me.id)
  return { data: { updated, unread: unreadCount(conv.id, me.id) } }
})
