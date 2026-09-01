import { currentUser } from '~/server/utils/auth'
import { useDriver } from '~/server/utils/driver'
import {
  communityUser,
  findUser,
  followersOf,
  followingOf,
  isFollowing
} from '~/server/utils/community'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const viewer = await currentUser(event)
  const user = await findUser(id)
  if (!user) throw createError({ statusCode: 404, message: 'Không tìm thấy thành viên' })

  const db = useDriver()
  const followerIds = followersOf(user.id).map((f) => f.follower_id)
  const followingIds = followingOf(user.id).map((f) => f.following_id)

  const all = (await db.find<any>('users', { where: { blocked: false } })).rows
  const byId = new Map(all.map((u) => [u.id, u]))

  const followers = followerIds
    .map((fid) => byId.get(fid))
    .filter(Boolean)
    .map((u) => communityUser(u, viewer?.id))
  const following = followingIds
    .map((fid) => byId.get(fid))
    .filter(Boolean)
    .map((u) => communityUser(u, viewer?.id))

  const docs = await db.find<any>('documents', {
    where: { seller_id: user.id },
    order: { field: 'created_at', asc: false },
    limit: 12
  })

  const posts = docs.rows.map((d) => ({
    id: d.id,
    title: d.title,
    slug: d.slug,
    thumbnail: d.thumbnail,
    price: d.price,
    status: d.status,
    views: d.view_count,
    downloads: d.download_count,
    sold: d.sold_count,
    rating: d.rating_avg,
    rating_count: d.rating_count,
    created_at: d.created_at
  }))

  const sold = docs.rows.reduce((sum, d) => sum + (Number(d.sold_count) || 0), 0)
  const rated = docs.rows.filter((d) => Number(d.rating_avg) > 0)
  const rating = rated.length
    ? Math.round((rated.reduce((s, d) => s + Number(d.rating_avg), 0) / rated.length) * 10) / 10
    : 0

  return {
    data: {
      user: {
        ...communityUser(user, viewer?.id),
        docs_count: docs.total,
        docs_sold: sold,
        rating
      },
      followers,
      following,
      is_following: viewer ? isFollowing(viewer.id, user.id) : false,
      posts
    }
  }
})
