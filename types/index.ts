export type UserRole = 'admin' | 'seller' | 'user'
export type DocStatus = 'pending' | 'approved' | 'rejected'
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type TxType = 'purchase' | 'sale' | 'withdraw' | 'topup' | 'commission'
export type FileType = 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'image' | 'zip'
export type ReportStatus = 'open' | 'resolved' | 'dismissed'

export interface User {
  id: string
  name: string
  email: string
  password_hash?: string
  salt?: string
  role: UserRole
  avatar?: string
  bio?: string
  phone?: string
  balance: number
  blocked?: boolean
  email_verified?: boolean
  google_id?: string
  provider?: 'local' | 'google'
  created_at: string
}

export interface PublicUser {
  id: string
  name: string
  avatar?: string
  role: UserRole
  bio?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  parent_id?: string | null
  description?: string
  document_count?: number
}

export interface DocumentItem {
  id: string
  title: string
  slug: string
  description: string
  subject: string
  grade: number
  price: number
  is_free: boolean
  thumbnail?: string
  file_url?: string
  preview_url?: string
  file_type: FileType
  file_size: number
  pages: number
  status: DocStatus
  reject_reason?: string
  seller_id: string
  seller?: PublicUser
  tags?: string[]
  featured?: boolean
  view_count: number
  download_count: number
  sold_count: number
  rating_avg: number
  rating_count: number
  created_at: string
  updated_at?: string
}

export interface Order {
  id: string
  code: string
  buyer_id: string
  document_id: string
  seller_id: string
  amount: number
  commission: number
  seller_amount: number
  method: 'wallet' | 'vnpay' | 'mock'
  status: OrderStatus
  paid_at?: string
  created_at: string
  document?: DocumentItem
  buyer?: PublicUser
}

export interface Review {
  id: string
  document_id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
  user?: PublicUser
}

export interface Transaction {
  id: string
  user_id: string
  type: TxType
  amount: number
  balance_after: number
  ref?: string
  note?: string
  status: 'pending' | 'success' | 'failed'
  created_at: string
}

export interface Blog {
  id: string
  slug: string
  title: string
  excerpt: string
  cover?: string
  content: string
  author_id: string
  author?: PublicUser
  tags?: string[]
  view_count: number
  published: boolean
  published_at?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  type: 'info' | 'success' | 'warning' | 'error'
  link?: string
  read: boolean
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  document_id: string
  created_at: string
}

export interface Download {
  id: string
  user_id: string
  document_id: string
  created_at: string
}

export interface Report {
  id: string
  document_id: string
  user_id: string
  reason: string
  detail?: string
  status: ReportStatus
  admin_note?: string
  created_at: string
  document?: DocumentItem
  user?: PublicUser
}

export interface Settings {
  id: string
  commission_rate: number
  min_withdraw: number
  min_price: number
  max_file_mb: number
  hotline: string
  email: string
  address: string
  facebook: string
}

export interface Paged<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface Subject {
  key: string
  name: string
  icon: string
  from: string
  to: string
  text: string
}
