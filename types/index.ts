export type UserRole = 'admin' | 'seller' | 'user'
export type DocStatus = 'pending' | 'approved' | 'rejected'
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type TxType = 'purchase' | 'sale' | 'withdraw' | 'topup' | 'commission'
export type FileType = 'pdf' | 'docx' | 'xlsx' | 'image' | 'zip'

export interface User {
  id: string
  name: string
  email: string
  password?: string
  salt?: string
  role: UserRole
  avatar?: string
  bio?: string
  phone?: string
  balance: number
  blocked?: boolean
  email_verified?: boolean
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
  description?: string
  doc_count?: number
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
  tags: string[]
  view_count: number
  download_count: number
  sold_count: number
  rating_avg: number
  rating_count: number
  featured: boolean
  created_at: string
  updated_at: string
  revenue?: number
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
  payment_method: string
  status: OrderStatus
  created_at: string
  document?: DocumentItem
  buyer?: PublicUser
}

export interface Review {
  id: string
  document_id: string
  user_id: string
  user?: PublicUser
  rating: number
  comment: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TxType
  amount: number
  balance_after: number
  note: string
  ref_id?: string
  created_at: string
}

export interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover?: string
  author_id: string
  author?: PublicUser
  tags: string[]
  view_count: number
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  type: string
  link?: string
  read: boolean
  created_at: string
}

export interface ReportItem {
  id: string
  document_id: string
  document?: DocumentItem
  user_id: string
  user?: PublicUser
  reason: string
  detail: string
  status: 'open' | 'resolved' | 'dismissed'
  created_at: string
}

export interface Paged<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}
