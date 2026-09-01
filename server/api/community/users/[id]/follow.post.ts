import { requireUser } from '~/server/utils/auth'
import {
  addFollow,
  findUser,
  followersCount,
  followingCount,
  isFollowing
} from '~/server/utils/community'

export default defineEventHandler(async (event) => {
  const me = await requireUser(event)
  const id = getRouterParam(event, 'id') as string
  const target = await findUser(id)
  if (!target) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy thành viên' })
  if (target.id === me.id)
    throw createError({ statusCode: 400, statusMessage: 'Không thể tự theo dõi chính mình' })

  addFollow(me.id, target.id)

  return {
    data: {
      following: isFollowing(me.id, target.id),
      followers_count: followersCount(target.id),
      following_count: followingCount(me.id)
    }
  }
})
