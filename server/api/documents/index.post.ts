import type { DocumentItem, User } from '~/types'
import { db, cryptoId } from '~/server/utils/driver'
import { requireUser } from '~/server/utils/auth'
import { sanitize, slugify, notify } from '~/server/utils/helpers'

const FILE_TYPES = ['pdf', 'docx', 'xlsx', 'image', 'zip']

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)

  const title = sanitize(body?.title, 200)
  const description = sanitize(body?.description, 8000)
  const subject = sanitize(body?.subject, 20)
  const grade = Number(body?.grade)
  const isFree = !!body?.is_free
  const price = isFree ? 0 : Math.round(Number(body?.price) || 0)
  const fileType = FILE_TYPES.includes(body?.file_type) ? body.file_type : 'pdf'
  const fileName = sanitize(body?.file_name, 200) || 'tai-lieu.pdf'
  const fileSize = Math.max(1, Math.round(Number(body?.file_size) || 1024 * 1024))
  const pages = Math.max(1, Math.round(Number(body?.pages) || 1))
  const tags = Array.isArray(body?.tags) ? body.tags.slice(0, 8).map((t: any) => sanitize(t, 40)).filter(Boolean) : []

  if (title.length < 10) throw createError({ statusCode: 400, statusMessage: 'Tiêu đề phải có ít nhất 10 ký tự' })
  if (description.length < 30) throw createError({ statusCode: 400, statusMessage: 'Mô tả phải có ít nhất 30 ký tự' })
  const cat = await db().findOne('categories', { slug: subject })
  if (!cat) throw createError({ statusCode: 400, statusMessage: 'Vui lòng chọn môn học hợp lệ' })
  if (![10, 11, 12].includes(grade)) throw createError({ statusCode: 400, statusMessage: 'Vui lòng chọn lớp (10, 11 hoặc 12)' })

  const settings = await db().getSettings()
  const minPrice = Number(settings.min_price) || 10000
  if (!isFree && price < minPrice) {
    throw createError({ statusCode: 400, statusMessage: `Giá bán tối thiểu là ${minPrice.toLocaleString('vi-VN')}đ` })
  }
  const maxMb = Number(settings.max_file_mb) || 50
  if (fileSize > maxMb * 1024 * 1024) {
    throw createError({ statusCode: 400, statusMessage: `Kích thước file không được vượt quá ${maxMb}MB` })
  }

  const now = new Date().toISOString()
  const doc = await db().insert<DocumentItem>('documents', {
    id: cryptoId(), title,
    slug: slugify(title) + '-' + Math.random().toString(36).slice(2, 6),
    description, subject, grade, price, is_free: isFree, thumbnail: '',
    file_url: `/files/${fileName}`, preview_url: `/files/preview-${fileName}`,
    file_type: fileType, file_size: fileSize, pages, status: 'pending',
    seller_id: user.id, tags, view_count: 0, download_count: 0, sold_count: 0,
    rating_avg: 0, rating_count: 0, featured: false, created_at: now, updated_at: now
  })

  if (user.role === 'user') await db().update<User>('users', user.id, { role: 'seller' })

  await notify(user.id, 'Tài liệu đã được gửi duyệt', `"${title}" đang chờ quản trị viên phê duyệt.`, 'document', '/dashboard/tai-lieu')
  return { success: true, data: doc, message: 'Đã gửi tài liệu để duyệt' }
})
