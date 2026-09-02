import { requireUser } from '~/server/utils/auth'
import { useDriver } from '~/server/utils/driver'
import {
  addMessage,
  canRead,
  communityStore,
  replyPreviewOf,
  resolveReplyTarget,
  sanitizeSender
} from '~/server/utils/community'

export default defineEventHandler(async (event) => {
  const me = await requireUser(event)
  const id = getRouterParam(event, 'id') as string
  const conv = communityStore().conversations.find((c) => c.id === id)
  if (!conv) throw createError({ statusCode: 404, message: 'Không tìm thấy cuộc trò chuyện' })
  if (!canRead(conv, me.id))
    throw createError({ statusCode: 403, message: 'Bạn không có quyền gửi tin nhắn ở đây' })

  const payload = (await readBody(event)) || {}
  const body = String(payload.body || '').trim()
  const type = payload.type === 'system' ? 'system' : 'text'
  const rawReply = payload.reply_to_id ? String(payload.reply_to_id) : null
  const replyToId = resolveReplyTarget(conv.id, rawReply)

  if (!body) throw createError({ statusCode: 400, message: 'Nội dung tin nhắn không được để trống' })
  if (body.length > 2000)
    throw createError({ statusCode: 400, message: 'Tin nhắn tối đa 2000 ký tự' })

  const rec = addMessage(conv.id, me.id, body, type, replyToId)
  const users = (await useDriver().find<any>('users', {})).rows

  return {
    data: {
      id: rec.id,
      conversation_id: rec.conversation_id,
      body: rec.body,
      type: rec.type,
      created_at: rec.created_at,
      reply_to_id: rec.reply_to_id || null,
      reply_to: replyPreviewOf(rec.reply_to_id, users),
      is_self: true,
      sender: sanitizeSender(me)
    }
  }
})
