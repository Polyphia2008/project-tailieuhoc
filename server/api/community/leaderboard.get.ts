import { currentUser } from '~/server/utils/auth'
import { paginate } from '~/server/utils/helpers'
import { communityUser, listUsers } from '~/server/utils/community'

const PERIOD_DAYS: Record<string, number> = { week: 7, month: 30 }

export default defineEventHandler(async (event) => {
  const q = getQuery(event) as Record<string, any>
  const viewer = await currentUser(event)
  const period = String(q.period || 'all')
  const sort = String(q.sort || 'followers')
  const term = String(q.q || '').trim().toLowerCase()
  const { page, limit, offset } = paginate({ ...q, limit: q.limit || 20 }, 20)

  const users = await listUsers()
  let items = users.map((u) => communityUser(u, viewer?.id))

  if (period !== 'all' && PERIOD_DAYS[period]) {
    const from = Date.now() - PERIOD_DAYS[period] * 86400000
    const recent = items.filter((i) => new Date(i.created_at || 0).getTime() >= from)
    if (recent.length) items = recent
  }

  if (term) {
    items = items.filter(
      (i) =>
        String(i.name || '').toLowerCase().includes(term) ||
        String(i.username || '').toLowerCase().includes(term)
    )
  }

  if (sort === 'popularity') items.sort((a, b) => b.popularity - a.popularity)
  else if (sort === 'newest')
    items.sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    )
  else items.sort((a, b) => b.followers_count - a.followers_count || b.popularity - a.popularity)

  const ranked = items.map((item, index) => ({ ...item, rank: index + 1 }))
  const total = ranked.length
  const slice = ranked.slice(offset, offset + limit)

  return {
    data: {
      items: slice,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  }
})
