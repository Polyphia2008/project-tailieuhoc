import { useDriver, cryptoId } from '~/server/utils/driver'

export interface CommunityFollow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface CommunityMessage {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  type: 'text' | 'system'
  reply_to_id?: string | null
  created_at: string
  read_at?: string
}

export interface CommunityConversation {
  id: string
  kind: 'public' | 'private' | 'group'
  title: string
  subtitle: string
  icon: string
  member_ids: string[]
  created_by: string
  created_at: string
  updated_at: string
}

export interface CommunityProfile {
  username: string
  verified: boolean
  popularity: number
  online: boolean
  last_active: string
  headline: string
  work: string
  school: string
}

interface CommunityStore {
  follows: CommunityFollow[]
  conversations: CommunityConversation[]
  messages: CommunityMessage[]
}

const G = globalThis as any

function iso(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60000).toISOString()
}

export const COMMUNITY_PROFILES: Record<string, CommunityProfile> = {
  u_admin: {
    username: 'tranxuanloc',
    verified: true,
    popularity: 4820,
    online: true,
    last_active: iso(1),
    headline: 'Quản trị viên MapDocs',
    work: 'Quản trị hệ thống tại MapDocs',
    school: 'Đại học Sư phạm Hà Nội'
  },
  u_seller: {
    username: 'minhhoang',
    verified: true,
    popularity: 3640,
    online: true,
    last_active: iso(6),
    headline: 'Giáo viên Toán 12 năm kinh nghiệm',
    work: 'Giáo viên Toán tại THPT Chu Văn An',
    school: 'Đại học Khoa học Tự nhiên'
  },
  u_s2: {
    username: 'quocanh',
    verified: true,
    popularity: 2980,
    online: false,
    last_active: iso(95),
    headline: 'Tác giả bộ chuyên đề Dao động cơ',
    work: 'Giáo viên Vật lý tại THPT Lê Hồng Phong',
    school: 'Đại học Sư phạm Hà Nội'
  },
  u_s3: {
    username: 'kimngan',
    verified: true,
    popularity: 2415,
    online: false,
    last_active: iso(240),
    headline: 'Chuyên nghị luận xã hội',
    work: 'Giáo viên Ngữ văn tại THPT Nguyễn Huệ',
    school: 'Đại học Khoa học Xã hội và Nhân văn'
  },
  u_s4: {
    username: 'hailong',
    verified: false,
    popularity: 1730,
    online: true,
    last_active: iso(3),
    headline: 'Giáo viên Hoá học, chuyên Hoá hữu cơ',
    work: 'Giáo viên Hoá tại MapDocs Teacher',
    school: 'Đại học Bách khoa Hà Nội'
  },
  u_user: {
    username: 'lethuha',
    verified: false,
    popularity: 1180,
    online: true,
    last_active: iso(2),
    headline: 'Học sinh lớp 12 chuyên Lý',
    work: 'Học sinh THPT chuyên Lý',
    school: 'THPT Chu Văn An'
  },
  u_u2: {
    username: 'giabao',
    verified: false,
    popularity: 640,
    online: false,
    last_active: iso(430),
    headline: 'Học sinh yêu thích môn Toán',
    work: 'Học sinh THPT',
    school: 'THPT Lê Hồng Phong'
  },
  u_u3: {
    username: 'myduyen',
    verified: false,
    popularity: 215,
    online: false,
    last_active: iso(1400),
    headline: 'Thành viên mới của MapDocs',
    work: 'Học sinh THPT',
    school: 'THPT Nguyễn Huệ'
  }
}

const FOLLOW_MATRIX: Record<string, string[]> = {
  u_admin: ['u_seller', 'u_s2', 'u_s3', 'u_s4', 'u_user', 'u_u2'],
  u_seller: ['u_admin', 'u_s2', 'u_s3', 'u_user'],
  u_s2: ['u_admin', 'u_seller', 'u_s3'],
  u_s3: ['u_admin', 'u_seller'],
  u_s4: ['u_admin', 'u_seller', 'u_s2', 'u_s3'],
  u_user: ['u_admin', 'u_seller', 'u_s2', 'u_s3', 'u_s4'],
  u_u2: ['u_admin', 'u_seller', 'u_s4'],
  u_u3: ['u_admin']
}

const BASE_FOLLOWERS: Record<string, number> = {
  u_admin: 1274,
  u_seller: 968,
  u_s2: 742,
  u_s3: 615,
  u_s4: 431,
  u_user: 287,
  u_u2: 143,
  u_u3: 46
}

function seedFollows(): CommunityFollow[] {
  const out: CommunityFollow[] = []
  let n = 0
  for (const [follower, list] of Object.entries(FOLLOW_MATRIX)) {
    for (const following of list) {
      out.push({
        id: 'f_' + follower + '_' + following,
        follower_id: follower,
        following_id: following,
        created_at: iso(600 + n * 37)
      })
      n++
    }
  }
  return out
}

function seedConversations(): CommunityConversation[] {
  return [
    {
      id: 'c_ai',
      kind: 'public',
      title: 'Trợ lý AI MapDocs',
      subtitle: 'Hỏi đáp nhanh về tài liệu và cách sử dụng nền tảng',
      icon: 'solar:magic-stick-3-bold-duotone',
      member_ids: [],
      created_by: 'u_admin',
      created_at: iso(20000),
      updated_at: iso(14)
    },
    {
      id: 'c_all',
      kind: 'public',
      title: 'Cộng đồng MapDocs',
      subtitle: 'Kênh chung của mọi thành viên',
      icon: 'solar:hashtag-square-bold-duotone',
      member_ids: [],
      created_by: 'u_admin',
      created_at: iso(20000),
      updated_at: iso(7)
    },
    {
      id: 'c_p1',
      kind: 'private',
      title: '',
      subtitle: '',
      icon: '',
      member_ids: ['u_admin', 'u_seller'],
      created_by: 'u_admin',
      created_at: iso(9000),
      updated_at: iso(21)
    },
    {
      id: 'c_p2',
      kind: 'private',
      title: '',
      subtitle: '',
      icon: '',
      member_ids: ['u_admin', 'u_user'],
      created_by: 'u_user',
      created_at: iso(6000),
      updated_at: iso(58)
    },
    {
      id: 'c_p3',
      kind: 'private',
      title: '',
      subtitle: '',
      icon: '',
      member_ids: ['u_admin', 'u_s3'],
      created_by: 'u_s3',
      created_at: iso(3000),
      updated_at: iso(180)
    }
  ]
}

const MSG_SEEDS: Array<[string, string, string, number]> = [
  ['c_ai', 'u_admin', 'Xin chào! Mình là trợ lý ảo của MapDocs, bạn cần tìm tài liệu môn nào?', 900],
  ['c_ai', 'u_user', 'Mình cần đề ôn thi Toán 12 chương Tích phân.', 620],
  ['c_ai', 'u_admin', 'Bạn vào Thư viện, chọn môn Toán rồi lọc theo chuyên đề Tích phân nhé.', 615],
  ['c_ai', 'u_user', 'Cảm ơn bạn, mình tìm thấy rồi.', 590],
  ['c_ai', 'u_admin', 'Chúc bạn ôn tập hiệu quả, cần gì cứ nhắn lại nhé.', 14],
  ['c_all', 'u_seller', 'Chào cả nhà, mình vừa đăng bộ chuyên đề Hàm số mới.', 1400],
  ['c_all', 'u_user', 'Bộ này có kèm đáp án chi tiết không ạ?', 1360],
  ['c_all', 'u_seller', 'Có đầy đủ lời giải từng bước bạn nhé.', 1340],
  ['c_all', 'u_s2', 'Mình cũng vừa hoàn thiện phần Dao động cơ, ai cần thì tải thử.', 900],
  ['c_all', 'u_s3', 'Bên Ngữ văn mình có thêm 12 đề nghị luận xã hội mới.', 640],
  ['c_all', 'u_u2', 'Tuyệt vời quá, cảm ơn các thầy cô.', 480],
  ['c_all', 'u_s4', 'Hoá hữu cơ chương Este mình sẽ cập nhật tuần này.', 300],
  ['c_all', 'u_user', 'Mong chờ tài liệu mới ạ.', 120],
  ['c_all', 'u_admin', 'Cảm ơn mọi người đã đóng góp cho cộng đồng.', 7],
  ['c_p1', 'u_admin', 'Chào bạn, tài liệu mới của bạn đã được duyệt.', 700],
  ['c_p1', 'u_seller', 'Cảm ơn anh, em vừa bổ sung phần đáp án.', 660],
  ['c_p1', 'u_admin', 'Rất tốt, doanh thu tháng này của bạn đang tăng.', 610],
  ['c_p1', 'u_seller', 'Em sẽ ra thêm 3 chuyên đề nữa trong tháng.', 300],
  ['c_p1', 'u_admin', 'Mình sẽ hỗ trợ đẩy lên trang chủ.', 21],
  ['c_p2', 'u_user', 'Em muốn hỏi về cách rút tiền từ ví ạ.', 500],
  ['c_p2', 'u_admin', 'Bạn vào Dashboard, chọn Doanh thu rồi bấm Rút tiền nhé.', 480],
  ['c_p2', 'u_user', 'Thời gian xử lý mất bao lâu ạ?', 420],
  ['c_p2', 'u_admin', 'Thường trong 24 giờ làm việc.', 400],
  ['c_p2', 'u_user', 'Em cảm ơn ạ.', 58],
  ['c_p3', 'u_s3', 'Anh xem giúp em bộ đề nghị luận mới với ạ.', 900],
  ['c_p3', 'u_admin', 'Mình đã xem, phần mở bài rất tốt.', 860],
  ['c_p3', 'u_s3', 'Em sẽ chỉnh lại phần kết luận cho gọn hơn.', 700],
  ['c_p3', 'u_admin', 'Ổn rồi, bạn gửi lại khi xong nhé.', 600],
  ['c_p3', 'u_s3', 'Vâng em gửi trong hôm nay ạ.', 240],
  ['c_p3', 'u_admin', 'Cảm ơn bạn nhiều.', 180]
]

function seedMessages(): CommunityMessage[] {
  return MSG_SEEDS.map((m, i) => ({
    id: 'm_' + String(i + 1).padStart(3, '0'),
    conversation_id: m[0],
    sender_id: m[1],
    body: m[2],
    type: 'text' as const,
    created_at: iso(m[3]),
    read_at: m[3] > 60 ? iso(m[3] - 10) : undefined
  }))
}

export function communityStore(): CommunityStore {
  if (!G.__mapdocs_community) {
    G.__mapdocs_community = {
      follows: seedFollows(),
      conversations: seedConversations(),
      messages: seedMessages()
    } as CommunityStore
  }
  return G.__mapdocs_community as CommunityStore
}

export function usernameOf(user: any): string {
  const p = COMMUNITY_PROFILES[user?.id]
  if (p?.username) return p.username
  const mail = String(user?.email || '')
  if (mail.includes('@')) return mail.split('@')[0]
  return String(user?.id || 'mapdocs')
}

export function avatarFor(user: any): string {
  if (user?.avatar) return user.avatar
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(usernameOf(user))}`
}

export function profileOf(user: any): CommunityProfile {
  return (
    COMMUNITY_PROFILES[user?.id] || {
      username: usernameOf(user),
      verified: false,
      popularity: 0,
      online: false,
      last_active: new Date().toISOString(),
      headline: '',
      work: '',
      school: ''
    }
  )
}

export function followersOf(userId: string): CommunityFollow[] {
  return communityStore().follows.filter((f) => f.following_id === userId)
}

export function followingOf(userId: string): CommunityFollow[] {
  return communityStore().follows.filter((f) => f.follower_id === userId)
}

export function followersCount(userId: string): number {
  return Math.max(0, (BASE_FOLLOWERS[userId] || 0) + followersOf(userId).length)
}

export function followingCount(userId: string): number {
  return Math.max(0, followingOf(userId).length)
}

export function isFollowing(followerId: string, followingId: string): boolean {
  return communityStore().follows.some(
    (f) => f.follower_id === followerId && f.following_id === followingId
  )
}

export function addFollow(followerId: string, followingId: string): boolean {
  if (followerId === followingId) return false
  if (isFollowing(followerId, followingId)) return false
  communityStore().follows.push({
    id: 'f_' + cryptoId(),
    follower_id: followerId,
    following_id: followingId,
    created_at: new Date().toISOString()
  })
  return true
}

export function removeFollow(followerId: string, followingId: string): boolean {
  const s = communityStore()
  const i = s.follows.findIndex(
    (f) => f.follower_id === followerId && f.following_id === followingId
  )
  if (i < 0) return false
  s.follows.splice(i, 1)
  return true
}

export async function listUsers(): Promise<any[]> {
  const { rows } = await useDriver().find<any>('users', { where: { blocked: false } })
  return rows
}

export async function findUser(id: string): Promise<any | null> {
  const db = useDriver()
  const byId = await db.findOne<any>('users', { id })
  if (byId) return byId
  const all = await listUsers()
  return all.find((u) => usernameOf(u) === id) || null
}

export function communityUser(user: any, viewerId?: string) {
  const p = profileOf(user)
  return {
    id: user.id,
    name: user.name,
    username: p.username,
    avatar: avatarFor(user),
    verified: p.verified,
    role: user.role,
    bio: user.bio || p.headline || '',
    headline: p.headline,
    work: p.work,
    school: p.school,
    online: p.online,
    last_active: p.last_active,
    followers_count: followersCount(user.id),
    following_count: followingCount(user.id),
    popularity: p.popularity,
    created_at: user.created_at,
    is_following: viewerId ? isFollowing(viewerId, user.id) : false,
    is_self: viewerId === user.id
  }
}

export function conversationsFor(userId?: string): CommunityConversation[] {
  const all = communityStore().conversations
  if (!userId) return all.filter((c) => c.kind === 'public')
  return all.filter((c) => c.kind === 'public' || c.member_ids.includes(userId))
}

export function canRead(conv: CommunityConversation, userId?: string): boolean {
  if (conv.kind === 'public') return true
  if (!userId) return false
  return conv.member_ids.includes(userId)
}

export function messagesOf(conversationId: string): CommunityMessage[] {
  return communityStore()
    .messages.filter((m) => m.conversation_id === conversationId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
}

export function lastMessageOf(conversationId: string): CommunityMessage | null {
  const list = messagesOf(conversationId)
  return list.length ? list[list.length - 1] : null
}

export function unreadCount(conversationId: string, userId?: string): number {
  if (!userId) return 0
  return messagesOf(conversationId).filter((m) => m.sender_id !== userId && !m.read_at).length
}

export function addMessage(
  conversationId: string,
  senderId: string,
  body: string,
  type: 'text' | 'system' = 'text',
  replyToId?: string | null
): CommunityMessage {
  const s = communityStore()
  const rec: CommunityMessage = {
    id: 'm_' + cryptoId(),
    conversation_id: conversationId,
    sender_id: senderId,
    body,
    type,
    reply_to_id: resolveReplyTarget(conversationId, replyToId),
    created_at: new Date().toISOString()
  }
  s.messages.push(rec)
  const conv = s.conversations.find((c) => c.id === conversationId)
  if (conv) conv.updated_at = rec.created_at
  return rec
}

export function resolveReplyTarget(
  conversationId: string,
  replyToId?: string | null
): string | null {
  if (!replyToId) return null
  const found = communityStore().messages.find(
    (m) => m.id === replyToId && m.conversation_id === conversationId
  )
  return found ? found.id : null
}

export function messageById(id?: string | null): CommunityMessage | null {
  if (!id) return null
  return communityStore().messages.find((m) => m.id === id) || null
}

export function replyPreviewOf(replyToId: string | null | undefined, users: any[]) {
  const src = messageById(replyToId)
  if (!src) return null
  const author = users.find((u) => u.id === src.sender_id)
  const p = author ? profileOf(author) : null
  return {
    id: src.id,
    body: src.body.length > 180 ? `${src.body.slice(0, 180)}…` : src.body,
    sender: {
      id: src.sender_id,
      name: author?.name || 'Thành viên',
      username: p?.username || ''
    }
  }
}

export function markRead(conversationId: string, userId: string): number {
  const now = new Date().toISOString()
  let n = 0
  for (const m of communityStore().messages) {
    if (m.conversation_id === conversationId && m.sender_id !== userId && !m.read_at) {
      m.read_at = now
      n++
    }
  }
  return n
}

export function createConversation(
  title: string,
  memberIds: string[],
  createdBy: string,
  kind: 'private' | 'group' = 'group'
): CommunityConversation {
  const now = new Date().toISOString()
  const rec: CommunityConversation = {
    id: 'c_' + cryptoId(),
    kind,
    title,
    subtitle: '',
    icon: kind === 'group' ? 'solar:users-group-two-rounded-bold-duotone' : '',
    member_ids: [...new Set(memberIds)],
    created_by: createdBy,
    created_at: now,
    updated_at: now
  }
  communityStore().conversations.push(rec)
  return rec
}

export function sanitizeSender(user: any) {
  if (!user) return null
  const p = profileOf(user)
  return {
    id: user.id,
    name: user.name,
    username: p.username,
    avatar: avatarFor(user),
    verified: p.verified,
    role: user.role
  }
}
