import { currentUser } from '~/server/utils/auth'
import { useDriver } from '~/server/utils/driver'
import {
  canRead,
  communityStore,
  messagesOf,
  replyPreviewOf,
  sanitizeSender
} from '~/server/utils/community'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const q = getQuery(event) as Record<string, any>
  const viewer = await currentUser(event)
  const conv = communityStore().conversations.find((c) => c.id === id)
  if (!conv) throw createError({ statusCode: 404, message: 'Không tìm thấy cuộc trò chuyện' })
  if (!canRead(conv, viewer?.id))
    throw createError({ statusCode: 403, message: 'Bạn không có quyền xem cuộc trò chuyện này' })

  const limit = Math.min(100, Math.max(1, Number(q.limit) || 50))
  const after = String(q.after || '')

  let list = messagesOf(conv.id)
  if (after) list = list.filter((m) => m.created_at > after)
  const slice = after ? list : list.slice(-limit)

  const users = (await useDriver().find<any>('users', {})).rows
  const byId = new Map(users.map((u) => [u.id, u]))

  const items = slice.map((m) => ({
    id: m.id,
    conversation_id: m.conversation_id,
    body: m.body,
    type: m.type,
    created_at: m.created_at,
    reply_to_id: m.reply_to_id || null,
    reply_to: replyPreviewOf(m.reply_to_id, users),
    is_self: viewer ? m.sender_id === viewer.id : false,
    sender: sanitizeSender(byId.get(m.sender_id))
  }))

  return {
    data: {
      items,
      total: items.length,
      cursor: items.length ? items[items.length - 1].created_at : after
    }
  }
})
