import { currentUser } from '~/server/utils/auth'
import { communityUser, listUsers } from '~/server/utils/community'

export default defineEventHandler(async (event) => {
  const q = getQuery(event) as Record<string, any>
  const viewer = await currentUser(event)
  const term = String(q.q || '').trim().toLowerCase()
  const limit = Math.min(20, Math.max(1, Number(q.limit) || 20))

  const users = await listUsers()
  let items = users.map((u) => communityUser(u, viewer?.id))

  if (term) {
    items = items.filter(
      (i) =>
        String(i.name || '').toLowerCase().includes(term) ||
        String(i.username || '').toLowerCase().includes(term)
    )
  }

  items = items.filter((i) => !viewer || i.id !== viewer.id)
  items.sort((a, b) => b.followers_count - a.followers_count)

  return { data: { items: items.slice(0, limit), total: items.length, limit } }
})
