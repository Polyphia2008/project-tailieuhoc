const H = 'f5f8c50044d40102b5cafae41f11b6a4278522a6e5ae1c6c198f0a1ee6ed0669'

function ago(days: number, hours = 0): string {
  return new Date(Date.now() - days * 864e5 - hours * 36e5).toISOString()
}

export const USERS: any[] = [
  {
    id: 'u_admin',
    name: 'Trần Xuân Lộc',
    email: 'admin@mapdocs.vn',
    password_hash: H,
    salt: 'mapdocs',
    role: 'admin',
    avatar: '',
    bio: 'Quản trị viên hệ thống MapDocs',
    phone: '0987654321',
    balance: 12500000,
    blocked: false,
    email_verified: true,
    provider: 'local',
    created_at: ago(420)
  },
  {
    id: 'u_seller',
    name: 'Nguyễn Minh Hoàng',
    email: 'seller@mapdocs.vn',
    password_hash: H,
    salt: 'mapdocs',
    role: 'seller',
    avatar: '',
    bio: 'Giáo viên Toán 12 năm kinh nghiệm, chuyên đề thi HSG và ôn thi THPT.',
    phone: '0912345678',
    balance: 4820000,
    blocked: false,
    email_verified: true,
    provider: 'local',
    created_at: ago(310)
  },
  {
    id: 'u_user',
    name: 'Lê Thu Hà',
    email: 'user@mapdocs.vn',
    password_hash: H,
    salt: 'mapdocs',
    role: 'user',
    avatar: '',
    bio: 'Học sinh lớp 12 chuyên Lý.',
    phone: '0933221100',
    balance: 350000,
    blocked: false,
    email_verified: true,
    provider: 'local',
    created_at: ago(88)
  },
  {
    id: 'u_s2',
    name: 'Phạm Quốc Anh',
    email: 'quocanh@mapdocs.vn',
    password_hash: H,
    salt: 'mapdocs',
    role: 'seller',
    avatar: '',
    bio: 'Giáo viên Vật lý, tác giả bộ chuyên đề Dao động cơ.',
    balance: 2140000,
    blocked: false,
    email_verified: true,
    provider: 'local',
    created_at: ago(240)
  },
  {
    id: 'u_s3',
    name: 'Vũ Thị Kim Ngân',
    email: 'kimngan@mapdocs.vn',
    password_hash: H,
    salt: 'mapdocs',
    role: 'seller',
    avatar: '',
    bio: 'Giáo viên Ngữ văn, chuyên nghị luận xã hội.',
    balance: 1680000,
    blocked: false,
    email_verified: true,
    provider: 'local',
    created_at: ago(195)
  },
  {
    id: 'u_s4',
    name: 'Đỗ Hải Long',
    email: 'hailong@mapdocs.vn',
    password_hash: H,
    salt: 'mapdocs',
    role: 'seller',
    avatar: '',
    bio: 'Giáo viên Hoá học, chuyên Hoá hữu cơ.',
    balance: 920000,
    blocked: false,
    email_verified: true,
    provider: 'local',
    created_at: ago(150)
  },
  {
    id: 'u_u2',
    name: 'Bùi Gia Bảo',
    email: 'giabao@mapdocs.vn',
    password_hash: H,
    salt: 'mapdocs',
    role: 'user',
    avatar: '',
    balance: 120000,
    blocked: false,
    email_verified: true,
    provider: 'local',
    created_at: ago(52)
  },
  {
    id: 'u_u3',
    name: 'Hoàng Mỹ Duyên',
    email: 'myduyen@mapdocs.vn',
    password_hash: H,
    salt: 'mapdocs',
    role: 'user',
    avatar: '',
    balance: 0,
    blocked: true,
    email_verified: false,
    provider: 'local',
    created_at: ago(21)
  }
]

export const CATEGORIES: any[] = [
  { id: 'c_toan', name: 'Toán học', slug: 'toan', icon: 'solar:calculator-bold-duotone', color: '#3b82f6', parent_id: null, description: 'Đại số, giải tích, hình học không gian', document_count: 0 },
  { id: 'c_ly', name: 'Vật lý', slug: 'ly', icon: 'solar:atom-bold-duotone', color: '#8b5cf6', parent_id: null, description: 'Dao động, điện, quang, hạt nhân', document_count: 0 },
  { id: 'c_hoa', name: 'Hoá học', slug: 'hoa', icon: 'solar:test-tube-bold-duotone', color: '#10b981', parent_id: null, description: 'Hoá vô cơ, hữu cơ, đại cương', document_count: 0 },
  { id: 'c_sinh', name: 'Sinh học', slug: 'sinh', icon: 'solar:leaf-bold-duotone', color: '#22c55e', parent_id: null, description: 'Di truyền, tiến hoá, sinh thái', document_count: 0 },
  { id: 'c_van', name: 'Ngữ văn', slug: 'van', icon: 'solar:book-2-bold-duotone', color: '#f43f5e', parent_id: null, description: 'Nghị luận, phân tích tác phẩm', document_count: 0 },
  { id: 'c_anh', name: 'Tiếng Anh', slug: 'anh', icon: 'solar:global-bold-duotone', color: '#f97316', parent_id: null, description: 'Ngữ pháp, từ vựng, đọc hiểu', document_count: 0 },
  { id: 'c_su', name: 'Lịch sử', slug: 'su', icon: 'solar:notebook-bold-duotone', color: '#a16207', parent_id: null, description: 'Lịch sử Việt Nam và thế giới', document_count: 0 },
  { id: 'c_dia', name: 'Địa lý', slug: 'dia', icon: 'solar:map-point-wave-bold-duotone', color: '#0ea5e9', parent_id: null, description: 'Địa lý tự nhiên, kinh tế, dân cư', document_count: 0 }
]

interface DocSeed {
  t: string
  s: string
  sub: string
  g: number
  p: number
  seller: string
  pages: number
  ft?: string
  st?: string
  feat?: boolean
  tags?: string[]
  v?: number
  sold?: number
  ra?: number
  rc?: number
  day: number
}

const DOC_SEEDS: DocSeed[] = [
  { t: 'Bộ 50 đề thi thử THPT Quốc gia môn Toán 2025 có lời giải chi tiết', s: 'bo-50-de-thi-thu-thpt-toan-2025', sub: 'toan', g: 12, p: 149000, seller: 'u_seller', pages: 420, feat: true, tags: ['đề thi thử', 'THPT QG', 'lời giải'], v: 15420, sold: 386, ra: 4.9, rc: 128, day: 4 },
  { t: 'Chuyên đề Hàm số và ứng dụng đạo hàm - Toán 12', s: 'chuyen-de-ham-so-ung-dung-dao-ham-toan-12', sub: 'toan', g: 12, p: 0, seller: 'u_seller', pages: 86, tags: ['chuyên đề', 'hàm số'], v: 28710, sold: 0, ra: 4.7, rc: 214, day: 12 },
  { t: 'Hình học không gian - 200 bài tập tự luận chọn lọc', s: 'hinh-hoc-khong-gian-200-bai-tap', sub: 'toan', g: 11, p: 89000, seller: 'u_seller', pages: 168, feat: true, tags: ['hình học', 'tự luận'], v: 9240, sold: 174, ra: 4.8, rc: 66, day: 20 },
  { t: 'Tuyển tập đề HSG Toán cấp tỉnh 2020-2024', s: 'tuyen-tap-de-hsg-toan-cap-tinh', sub: 'toan', g: 12, p: 199000, seller: 'u_seller', pages: 312, tags: ['HSG', 'nâng cao'], v: 6180, sold: 92, ra: 4.9, rc: 41, day: 31 },
  { t: 'Toán 10 - Mệnh đề, tập hợp và bất phương trình', s: 'toan-10-menh-de-tap-hop', sub: 'toan', g: 10, p: 0, seller: 'u_seller', pages: 64, tags: ['cơ bản'], v: 18930, sold: 0, ra: 4.5, rc: 97, day: 45 },
  { t: 'Chuyên đề Dao động cơ - Lý thuyết và 300 bài tập phân dạng', s: 'chuyen-de-dao-dong-co-300-bai-tap', sub: 'ly', g: 12, p: 129000, seller: 'u_s2', pages: 246, feat: true, tags: ['dao động cơ', 'phân dạng'], v: 12380, sold: 258, ra: 4.8, rc: 91, day: 7 },
  { t: 'Điện xoay chiều - Tổng ôn công thức nhanh', s: 'dien-xoay-chieu-tong-on-cong-thuc', sub: 'ly', g: 12, p: 69000, seller: 'u_s2', pages: 74, tags: ['công thức', 'tổng ôn'], v: 8420, sold: 142, ra: 4.6, rc: 58, day: 15 },
  { t: 'Vật lý 11 - Dòng điện không đổi (bài giảng slide)', s: 'vat-ly-11-dong-dien-khong-doi', sub: 'ly', g: 11, p: 0, seller: 'u_s2', pages: 52, ft: 'pptx', tags: ['bài giảng', 'slide'], v: 11240, sold: 0, ra: 4.4, rc: 72, day: 28 },
  { t: 'Bộ 30 đề thi thử Vật lý 2025 - bám sát cấu trúc mới', s: 'bo-30-de-thi-thu-vat-ly-2025', sub: 'ly', g: 12, p: 139000, seller: 'u_s2', pages: 288, tags: ['đề thi thử'], v: 7610, sold: 118, ra: 4.7, rc: 44, day: 9 },
  { t: 'Hoá hữu cơ 12 - Este, Lipit, Cacbohidrat toàn tập', s: 'hoa-huu-co-12-este-lipit-cacbohidrat', sub: 'hoa', g: 12, p: 119000, seller: 'u_s4', pages: 198, feat: true, tags: ['hữu cơ', 'toàn tập'], v: 10880, sold: 196, ra: 4.8, rc: 74, day: 6 },
  { t: 'Bài tập kim loại và hợp chất - phân dạng đầy đủ', s: 'bai-tap-kim-loai-hop-chat-phan-dang', sub: 'hoa', g: 12, p: 79000, seller: 'u_s4', pages: 142, tags: ['vô cơ', 'kim loại'], v: 6340, sold: 104, ra: 4.5, rc: 38, day: 18 },
  { t: 'Hoá 10 - Cấu tạo nguyên tử và bảng tuần hoàn', s: 'hoa-10-cau-tao-nguyen-tu', sub: 'hoa', g: 10, p: 0, seller: 'u_s4', pages: 58, tags: ['cơ bản'], v: 14210, sold: 0, ra: 4.6, rc: 88, day: 38 },
  { t: 'Di truyền học - Sơ đồ tư duy và bài tập vận dụng cao', s: 'di-truyen-hoc-so-do-tu-duy', sub: 'sinh', g: 12, p: 99000, seller: 'u_s4', pages: 156, tags: ['di truyền', 'sơ đồ tư duy'], v: 5920, sold: 86, ra: 4.7, rc: 32, day: 14 },
  { t: 'Sinh học 11 - Chuyển hoá vật chất và năng lượng', s: 'sinh-hoc-11-chuyen-hoa-vat-chat', sub: 'sinh', g: 11, p: 0, seller: 'u_s4', pages: 66, tags: ['cơ bản'], v: 9180, sold: 0, ra: 4.3, rc: 54, day: 33 },
  { t: 'Nghị luận xã hội - 100 đề mẫu và dàn ý chi tiết', s: 'nghi-luan-xa-hoi-100-de-mau', sub: 'van', g: 12, p: 109000, seller: 'u_s3', pages: 224, feat: true, tags: ['NLXH', 'dàn ý'], v: 19420, sold: 312, ra: 4.9, rc: 118, day: 3 },
  { t: 'Phân tích tác phẩm Ngữ văn 12 - trọn bộ 18 tác phẩm', s: 'phan-tich-tac-pham-ngu-van-12', sub: 'van', g: 12, p: 129000, seller: 'u_s3', pages: 268, tags: ['phân tích', 'trọn bộ'], v: 13260, sold: 224, ra: 4.8, rc: 86, day: 11 },
  { t: 'Ngữ văn 10 - Kỹ năng đọc hiểu văn bản', s: 'ngu-van-10-ky-nang-doc-hieu', sub: 'van', g: 10, p: 0, seller: 'u_s3', pages: 48, tags: ['đọc hiểu'], v: 8740, sold: 0, ra: 4.4, rc: 46, day: 41 },
  { t: 'Tiếng Anh 12 - 3000 từ vựng theo chủ đề (có audio)', s: 'tieng-anh-12-3000-tu-vung-chu-de', sub: 'anh', g: 12, p: 89000, seller: 'u_s3', pages: 132, feat: true, tags: ['từ vựng', 'audio'], v: 16820, sold: 268, ra: 4.8, rc: 102, day: 5 },
  { t: 'Ngữ pháp tiếng Anh THPT - tổng ôn 24 chuyên đề', s: 'ngu-phap-tieng-anh-thpt-24-chuyen-de', sub: 'anh', g: 12, p: 99000, seller: 'u_s3', pages: 186, tags: ['ngữ pháp'], v: 11340, sold: 178, ra: 4.7, rc: 68, day: 16 },
  { t: 'Đề thi thử tiếng Anh 2025 - 25 đề có transcript', s: 'de-thi-thu-tieng-anh-2025-25-de', sub: 'anh', g: 12, p: 0, seller: 'u_s3', pages: 210, tags: ['đề thi thử'], v: 21460, sold: 0, ra: 4.6, rc: 134, day: 8 },
  { t: 'Lịch sử Việt Nam 1945-1975 - sơ đồ hoá toàn bộ', s: 'lich-su-viet-nam-1945-1975-so-do', sub: 'su', g: 12, p: 79000, seller: 'u_s3', pages: 118, tags: ['sơ đồ', 'lịch sử VN'], v: 7280, sold: 96, ra: 4.6, rc: 34, day: 22 },
  { t: 'Lịch sử thế giới hiện đại - trắc nghiệm phân dạng', s: 'lich-su-the-gioi-hien-dai-trac-nghiem', sub: 'su', g: 12, p: 0, seller: 'u_s3', pages: 92, tags: ['trắc nghiệm'], v: 5140, sold: 0, ra: 4.2, rc: 28, day: 36 },
  { t: 'Địa lý 12 - Atlas và kỹ năng biểu đồ', s: 'dia-ly-12-atlas-ky-nang-bieu-do', sub: 'dia', g: 12, p: 69000, seller: 'u_s2', pages: 104, tags: ['atlas', 'biểu đồ'], v: 6820, sold: 88, ra: 4.5, rc: 30, day: 25 },
  { t: 'Địa lý tự nhiên Việt Nam - tổng ôn nhanh', s: 'dia-ly-tu-nhien-viet-nam-tong-on', sub: 'dia', g: 12, p: 0, seller: 'u_s2', pages: 72, tags: ['tổng ôn'], v: 4930, sold: 0, ra: 4.3, rc: 22, day: 44 },
  { t: 'Toán 12 - 500 câu trắc nghiệm tích phân', s: 'toan-12-500-cau-trac-nghiem-tich-phan', sub: 'toan', g: 12, p: 109000, seller: 'u_seller', pages: 184, tags: ['tích phân', 'trắc nghiệm'], v: 8940, sold: 136, ra: 4.7, rc: 52, day: 19 },
  { t: 'Vật lý 12 - Sóng cơ và sóng âm chuyên sâu', s: 'vat-ly-12-song-co-song-am', sub: 'ly', g: 12, p: 89000, seller: 'u_s2', pages: 138, tags: ['sóng cơ'], v: 5620, sold: 74, ra: 4.6, rc: 26, day: 27 },
  { t: 'Hoá 11 - Nitơ, Photpho và hợp chất', s: 'hoa-11-nito-photpho-hop-chat', sub: 'hoa', g: 11, p: 59000, seller: 'u_s4', pages: 88, st: 'pending', tags: ['vô cơ'], v: 0, sold: 0, ra: 0, rc: 0, day: 1 },
  { t: 'Sinh 12 - Tiến hoá và sinh thái học tổng hợp', s: 'sinh-12-tien-hoa-sinh-thai-hoc', sub: 'sinh', g: 12, p: 89000, seller: 'u_s4', pages: 124, st: 'pending', tags: ['tiến hoá'], v: 0, sold: 0, ra: 0, rc: 0, day: 1 },
  { t: 'Văn 11 - Thơ mới và văn học lãng mạn', s: 'van-11-tho-moi-van-hoc-lang-man', sub: 'van', g: 11, p: 0, seller: 'u_s3', pages: 56, st: 'pending', tags: ['thơ mới'], v: 0, sold: 0, ra: 0, rc: 0, day: 2 },
  { t: 'Tiếng Anh 11 - Bài tập đọc hiểu nâng cao', s: 'tieng-anh-11-doc-hieu-nang-cao', sub: 'anh', g: 11, p: 129000, seller: 'u_s3', pages: 96, st: 'rejected', tags: ['đọc hiểu'], v: 0, sold: 0, ra: 0, rc: 0, day: 5 }
]

export const DOCUMENTS: any[] = DOC_SEEDS.map((d, i) => ({
  id: `d_${String(i + 1).padStart(3, '0')}`,
  title: d.t,
  slug: d.s,
  description: `${d.t}. Tài liệu được biên soạn kỹ lưỡng, bám sát chương trình mới, trình bày rõ ràng theo từng dạng bài kèm đáp án và lời giải chi tiết. Phù hợp cho học sinh tự học và giáo viên tham khảo trong quá trình giảng dạy, ôn tập cho các kỳ thi quan trọng.`,
  subject: d.sub,
  grade: d.g,
  price: d.p,
  is_free: d.p === 0,
  thumbnail: '',
  file_url: `documents/${d.s}.${d.ft || 'pdf'}`,
  preview_url: `previews/${d.s}.pdf`,
  file_type: d.ft || 'pdf',
  file_size: d.pages * 42000 + 180000,
  pages: d.pages,
  status: d.st || 'approved',
  reject_reason: d.st === 'rejected' ? 'Tài liệu trùng lặp với nội dung đã có trên hệ thống.' : undefined,
  seller_id: d.seller,
  tags: d.tags || [],
  featured: Boolean(d.feat),
  view_count: d.v ?? 0,
  download_count: Math.floor((d.v ?? 0) * 0.18),
  sold_count: d.sold ?? 0,
  rating_avg: d.ra ?? 0,
  rating_count: d.rc ?? 0,
  created_at: ago(d.day),
  updated_at: ago(Math.max(0, d.day - 1))
}))

const paidDocs = DOCUMENTS.filter((d) => !d.is_free && d.status === 'approved')

export const ORDERS: any[] = paidDocs.slice(0, 14).flatMap((d, i) => {
  const buyers = ['u_user', 'u_u2', 'u_user', 'u_u2']
  return [0, 1].map((k) => {
    const day = 2 + i * 2 + k
    const commission = Math.round(d.price * 0.15)
    return {
      id: `o_${i}${k}`,
      code: `MD${(Date.now() - day * 864e5).toString(36).toUpperCase().slice(-8)}${k}`,
      buyer_id: buyers[(i + k) % buyers.length],
      document_id: d.id,
      seller_id: d.seller_id,
      amount: d.price,
      commission,
      seller_amount: d.price - commission,
      method: k === 0 ? 'wallet' : 'vnpay',
      status: 'paid',
      paid_at: ago(day, 3),
      created_at: ago(day, 4)
    }
  })
})

ORDERS.push({
  id: 'o_pending',
  code: 'MDPENDING1',
  buyer_id: 'u_user',
  document_id: paidDocs[3]?.id || 'd_001',
  seller_id: paidDocs[3]?.seller_id || 'u_seller',
  amount: paidDocs[3]?.price || 100000,
  commission: Math.round((paidDocs[3]?.price || 100000) * 0.15),
  seller_amount: (paidDocs[3]?.price || 100000) - Math.round((paidDocs[3]?.price || 100000) * 0.15),
  method: 'vnpay',
  status: 'pending',
  created_at: ago(0, 2)
})

const REVIEW_TEXTS = [
  'Tài liệu rất chất lượng, trình bày rõ ràng và dễ hiểu. Lời giải chi tiết từng bước giúp mình tự học hiệu quả.',
  'Nội dung bám sát đề thi, phân dạng khoa học. Rất đáng tiền!',
  'Mình là giáo viên, dùng tài liệu này để soạn giáo án rất tiện. Cảm ơn tác giả.',
  'Khá tốt, tuy nhiên có vài lỗi typo nhỏ. Nhìn chung vẫn đáng mua.',
  'Bài tập từ dễ đến khó, phù hợp ôn thi. Recommend cho các bạn lớp 12.',
  'File PDF nét, mục lục có bookmark tiện tra cứu. 5 sao!',
  'Đầy đủ và hệ thống, giúp mình lấp được nhiều lỗ hổng kiến thức.'
]

export const REVIEWS: any[] = DOCUMENTS.filter((d) => d.rating_count > 0)
  .slice(0, 18)
  .flatMap((d, i) =>
    [0, 1, 2].slice(0, (i % 3) + 1).map((k) => ({
      id: `r_${i}${k}`,
      document_id: d.id,
      user_id: ['u_user', 'u_u2', 'u_u3'][k],
      rating: [5, 5, 4, 5, 4][(i + k) % 5],
      comment: REVIEW_TEXTS[(i + k) % REVIEW_TEXTS.length],
      created_at: ago(3 + i + k * 2)
    }))
  )

export const TRANSACTIONS: any[] = [
  { id: 't_01', user_id: 'u_user', type: 'topup', amount: 500000, balance_after: 500000, ref: 'VNP20250801', note: 'Nạp tiền qua VNPay', status: 'success', created_at: ago(30) },
  { id: 't_02', user_id: 'u_user', type: 'purchase', amount: -149000, balance_after: 351000, ref: 'MDAB12CD3', note: 'Mua: Bộ 50 đề thi thử THPT Quốc gia môn Toán 2025', status: 'success', created_at: ago(26) },
  { id: 't_03', user_id: 'u_user', type: 'purchase', amount: -109000, balance_after: 242000, ref: 'MDBC23DE4', note: 'Mua: Nghị luận xã hội - 100 đề mẫu', status: 'success', created_at: ago(19) },
  { id: 't_04', user_id: 'u_user', type: 'topup', amount: 200000, balance_after: 442000, ref: 'VNP20250815', note: 'Nạp tiền qua VNPay', status: 'success', created_at: ago(12) },
  { id: 't_05', user_id: 'u_user', type: 'purchase', amount: -89000, balance_after: 353000, ref: 'MDCD34EF5', note: 'Mua: Tiếng Anh 12 - 3000 từ vựng', status: 'success', created_at: ago(6) },
  { id: 't_06', user_id: 'u_seller', type: 'sale', amount: 126650, balance_after: 3126650, ref: 'MDAB12CD3', note: 'Bán tài liệu (đã trừ 15% hoa hồng)', status: 'success', created_at: ago(26) },
  { id: 't_07', user_id: 'u_seller', type: 'sale', amount: 75650, balance_after: 3202300, ref: 'MDEF45GH6', note: 'Bán tài liệu (đã trừ 15% hoa hồng)', status: 'success', created_at: ago(20) },
  { id: 't_08', user_id: 'u_seller', type: 'withdraw', amount: -2000000, balance_after: 1202300, ref: 'WD250810', note: 'Rút về Vietcombank ****4521', status: 'success', created_at: ago(14) },
  { id: 't_09', user_id: 'u_seller', type: 'sale', amount: 92650, balance_after: 1294950, ref: 'MDGH56IJ7', note: 'Bán tài liệu (đã trừ 15% hoa hồng)', status: 'success', created_at: ago(9) },
  { id: 't_10', user_id: 'u_seller', type: 'sale', amount: 168300, balance_after: 1463250, ref: 'MDIJ67KL8', note: 'Bán tài liệu (đã trừ 15% hoa hồng)', status: 'success', created_at: ago(4) },
  { id: 't_11', user_id: 'u_seller', type: 'withdraw', amount: -500000, balance_after: 963250, ref: 'WD250825', note: 'Rút về Vietcombank ****4521', status: 'pending', created_at: ago(1) },
  { id: 't_12', user_id: 'u_s2', type: 'sale', amount: 109650, balance_after: 2140000, ref: 'MDKL78MN9', note: 'Bán tài liệu (đã trừ 15% hoa hồng)', status: 'success', created_at: ago(7) },
  { id: 't_13', user_id: 'u_s3', type: 'sale', amount: 92650, balance_after: 1680000, ref: 'MDMN89OP1', note: 'Bán tài liệu (đã trừ 15% hoa hồng)', status: 'success', created_at: ago(3) },
  { id: 't_14', user_id: 'u_u2', type: 'topup', amount: 120000, balance_after: 120000, ref: 'VNP20250820', note: 'Nạp tiền qua VNPay', status: 'success', created_at: ago(8) }
]

export const BLOGS: any[] = [
  {
    id: 'b_01',
    slug: 'chien-luoc-on-thi-thpt-quoc-gia-2025',
    title: 'Chiến lược ôn thi THPT Quốc gia 2025 hiệu quả trong 6 tháng',
    excerpt: 'Lộ trình 6 tháng chia thành 3 giai đoạn rõ ràng giúp bạn hệ thống lại toàn bộ kiến thức và tối ưu điểm số trong kỳ thi quan trọng nhất.',
    cover: '',
    content: `## Giai đoạn 1: Hệ thống lại nền tảng (tháng 1-2)

Đây là giai đoạn quan trọng nhất nhưng thường bị bỏ qua. Bạn cần rà soát lại toàn bộ kiến thức từ lớp 10 đến lớp 12, đặc biệt là các phần kiến thức nền tảng.

- Lập danh sách các chuyên đề theo từng môn
- Đánh giá mức độ nắm vững của bản thân theo thang 1-5
- Ưu tiên các chuyên đề dưới mức 3

## Giai đoạn 2: Luyện dạng bài chuyên sâu (tháng 3-4)

Sau khi có nền tảng, bạn chuyển sang luyện tập theo dạng. Mỗi dạng bài nên làm ít nhất 30-50 câu để hình thành phản xạ.

Kinh nghiệm cho thấy học sinh làm đúng 80% các dạng bài cơ bản sẽ đạt được mức 7-8 điểm mà không cần đến các câu vận dụng cao.

## Giai đoạn 3: Luyện đề và rút kinh nghiệm (tháng 5-6)

Giai đoạn cuối, mỗi tuần nên làm 3-4 đề thi thử trong điều kiện giống thi thật. Quan trọng nhất là **phân tích lỗi sai** sau mỗi đề.

- Ghi lại mọi câu sai vào sổ tay
- Phân loại nguyên nhân: chưa học, học rồi mà quên, hoặc bất cẩn
- Ôn lại nhóm "học rồi mà quên" mỗi tuần

## Lời kết

Không có công thức chung cho tất cả, nhưng một lộ trình rõ ràng sẽ giúp bạn giảm lo lắng và tăng hiệu quả đáng kể. Chúc bạn thành công!`,
    author_id: 'u_admin',
    tags: ['ôn thi', 'THPT QG', 'lộ trình'],
    view_count: 8420,
    published: true,
    published_at: ago(5),
    created_at: ago(5)
  },
  {
    id: 'b_02',
    slug: 'cach-chon-tai-lieu-hoc-tap-chat-luong',
    title: 'Cách chọn tài liệu học tập chất lượng: 7 tiêu chí cần biết',
    excerpt: 'Giữa hàng nghìn tài liệu trên mạng, làm sao biết đâu là tài liệu đáng đầu tư thời gian? Đây là 7 tiêu chí đánh giá thực tế.',
    cover: '',
    content: `## 1. Bám sát chương trình hiện hành

Chương trình giáo dục thay đổi liên tục. Tài liệu tốt phải ghi rõ áp dụng cho chương trình nào, năm nào.

## 2. Có lời giải chi tiết

Đáp án A/B/C/D không đủ. Bạn cần biết **tại sao** đáp án đó đúng và các đáp án khác sai ở đâu.

## 3. Phân dạng khoa học

Tài liệu tốt nhóm bài tập theo dạng, mỗi dạng có phương pháp giải chung rồi mới đến bài tập áp dụng.

## 4. Độ khó tăng dần

Nhảy ngay vào câu vận dụng cao sẽ gây mất động lực. Tài liệu tốt luôn có lộ trình nhận biết → thông hiểu → vận dụng.

## 5. Trình bày rõ ràng

Font dễ đọc, công thức được đánh số, có mục lục và bookmark trong file PDF.

## 6. Tác giả có uy tín

Ưu tiên tài liệu từ giáo viên đang giảng dạy, có thông tin rõ ràng và phản hồi tốt từ người dùng trước.

## 7. Đánh giá từ cộng đồng

Đọc nhận xét thực tế của người đã dùng. Trên MapDocs, mỗi tài liệu đều có phần đánh giá và điểm số minh bạch.`,
    author_id: 'u_admin',
    tags: ['tài liệu', 'kinh nghiệm'],
    view_count: 5240,
    published: true,
    published_at: ago(11),
    created_at: ago(11)
  },
  {
    id: 'b_03',
    slug: 'huong-dan-dang-ban-tai-lieu-tren-mapdocs',
    title: 'Hướng dẫn đăng bán tài liệu trên MapDocs và nhận 85% doanh thu',
    excerpt: 'Bạn là giáo viên hoặc học sinh có tài liệu chất lượng? Đây là hướng dẫn từng bước để bắt đầu kiếm thu nhập từ MapDocs.',
    cover: '',
    content: `## Bước 1: Tạo tài khoản và xác thực

Đăng ký tài khoản miễn phí, sau đó hoàn thiện hồ sơ với thông tin thật. Hồ sơ đầy đủ giúp tăng độ tin cậy và tỷ lệ bán hàng.

## Bước 2: Chuẩn bị tài liệu

- Định dạng PDF là tối ưu nhất (giữ nguyên layout trên mọi thiết bị)
- Kích thước tối đa 50MB
- Nên có trang bìa và mục lục
- Thêm watermark nhẹ để bảo vệ bản quyền

## Bước 3: Đăng tải và định giá

Truy cập **Dashboard → Đăng bán tài liệu**, điền đầy đủ thông tin. Về giá:

| Loại tài liệu | Khoảng giá gợi ý |
|---|---|
| Chuyên đề đơn (50-100 trang) | 59.000đ - 99.000đ |
| Bộ đề thi thử (200+ trang) | 129.000đ - 199.000đ |
| Trọn bộ chương trình | 199.000đ - 299.000đ |

## Bước 4: Chờ duyệt

Đội ngũ kiểm duyệt sẽ xem xét trong vòng 24 giờ. Tài liệu bị từ chối sẽ có lý do cụ thể để bạn chỉnh sửa.

## Bước 5: Nhận doanh thu

Mỗi giao dịch bạn nhận **85%** giá bán, MapDocs giữ 15% cho chi phí vận hành và thanh toán. Số dư có thể rút về ngân hàng khi đạt tối thiểu 200.000đ.

## Mẹo tăng doanh thu

1. Đặt tiêu đề rõ ràng, chứa từ khoá học sinh hay tìm
2. Viết mô tả chi tiết về nội dung bên trong
3. Cung cấp bản preview vài trang đầu
4. Phản hồi nhanh các câu hỏi và đánh giá`,
    author_id: 'u_admin',
    tags: ['đăng bán', 'hướng dẫn', 'thu nhập'],
    view_count: 6810,
    published: true,
    published_at: ago(18),
    created_at: ago(18)
  },
  {
    id: 'b_04',
    slug: 'phuong-phap-so-do-tu-duy-cho-mon-tu-nhien',
    title: 'Phương pháp sơ đồ tư duy áp dụng cho các môn tự nhiên',
    excerpt: 'Sơ đồ tư duy không chỉ dành cho môn xã hội. Đây là cách áp dụng hiệu quả cho Toán, Lý, Hoá, Sinh.',
    cover: '',
    content: `## Vì sao sơ đồ tư duy hiệu quả với môn tự nhiên?

Nhiều người nghĩ môn tự nhiên chỉ cần làm bài tập. Nhưng thực tế, việc **hệ thống hoá công thức và mối liên hệ giữa các khái niệm** là chìa khoá để giải nhanh.

## Áp dụng cho môn Toán

Với mỗi chuyên đề, tạo một sơ đồ gồm:

- Trung tâm: tên chuyên đề
- Nhánh 1: định nghĩa và tính chất cơ bản
- Nhánh 2: các dạng bài thường gặp
- Nhánh 3: công thức và mẹo giải nhanh
- Nhánh 4: lỗi thường mắc

## Áp dụng cho môn Lý và Hoá

Ưu tiên sơ đồ dạng **luồng biến đổi**: từ đại lượng đầu vào đến kết quả, qua các công thức trung gian. Cách này giúp bạn nhìn ra ngay đường đi khi gặp bài mới.

## Áp dụng cho môn Sinh

Sinh học có nhiều quá trình liên hoàn (quang hợp, hô hấp, di truyền). Sơ đồ tư duy dạng chu trình là phù hợp nhất.

## Công cụ đề xuất

Vẽ tay vẫn hiệu quả nhất vì quá trình vẽ là quá trình ghi nhớ. Nếu dùng máy, có thể thử XMind hoặc Miro.`,
    author_id: 'u_admin',
    tags: ['phương pháp học', 'sơ đồ tư duy'],
    view_count: 3920,
    published: true,
    published_at: ago(24),
    created_at: ago(24)
  },
  {
    id: 'b_05',
    slug: 'quan-ly-thoi-gian-cho-hoc-sinh-lop-12',
    title: 'Quản lý thời gian cho học sinh lớp 12: khung giờ vàng',
    excerpt: 'Học 12 tiếng một ngày không hiệu quả bằng học 6 tiếng đúng cách. Tìm hiểu về khung giờ vàng và cách tận dụng.',
    cover: '',
    content: `## Nguyên tắc cốt lõi: chất lượng hơn số lượng

Nghiên cứu cho thấy khả năng tập trung sâu của con người chỉ duy trì được **90-120 phút** mỗi phiên. Sau đó hiệu suất giảm mạnh.

## Khung giờ vàng theo loại nhiệm vụ

| Khung giờ | Trạng thái | Nhiệm vụ phù hợp |
|---|---|---|
| 5h30 - 7h30 | Não tỉnh táo nhất | Học kiến thức mới, môn khó |
| 9h - 11h | Tập trung cao | Giải bài tập phức tạp |
| 14h - 16h | Hơi buồn ngủ | Ôn lại, làm trắc nghiệm nhẹ |
| 19h30 - 21h30 | Ghi nhớ tốt | Học thuộc, ôn từ vựng |

## Kỹ thuật Pomodoro cải tiến

Thay vì 25 phút truyền thống, học sinh lớp 12 nên dùng chu kỳ **50 phút học - 10 phút nghỉ**, sau 3 chu kỳ nghỉ dài 30 phút.

## Đừng bỏ qua giấc ngủ

Ngủ đủ 7-8 tiếng là điều kiện bắt buộc để trí nhớ dài hạn hình thành. Thức đêm học bài thực chất là **phá hoại** kiến thức bạn vừa nạp vào.

## Bảng kế hoạch tuần

Cuối mỗi tuần, hãy dành 20 phút lập kế hoạch cho tuần sau với 3 ưu tiên rõ ràng. Đừng lập kế hoạch quá chi tiết vì bạn sẽ không theo được.`,
    author_id: 'u_admin',
    tags: ['quản lý thời gian', 'lớp 12'],
    view_count: 4570,
    published: true,
    published_at: ago(32),
    created_at: ago(32)
  },
  {
    id: 'b_06',
    slug: 'bao-ve-ban-quyen-tai-lieu-so',
    title: 'Bảo vệ bản quyền tài liệu số: điều người đăng bán cần biết',
    excerpt: 'Tài liệu bị sao chép trái phép là nỗi lo lớn nhất của người bán. Đây là các biện pháp thực tế bạn có thể áp dụng.',
    cover: '',
    content: `## Thực trạng

Tài liệu số rất dễ bị sao chép và phát tán. Tuy nhiên, có nhiều cách để giảm thiểu thiệt hại đáng kể.

## Biện pháp kỹ thuật

### 1. Watermark động

Chèn watermark chứa email hoặc ID người mua vào từng trang. Khi tài liệu bị phát tán, bạn biết ngay nguồn rò rỉ.

### 2. Khoá quyền in và copy

PDF cho phép đặt quyền chỉ đọc. Không tuyệt đối nhưng ngăn được phần lớn trường hợp.

### 3. Phân phối qua nền tảng

Đăng bán qua nền tảng như MapDocs an toàn hơn gửi file trực tiếp, vì có lịch sử tải và cơ chế báo cáo.

## Biện pháp pháp lý

Theo Luật Sở hữu trí tuệ Việt Nam, tài liệu bạn tự biên soạn được bảo hộ tự động. Bạn nên:

- Lưu bản nháp có timestamp làm bằng chứng
- Ghi rõ thông tin bản quyền trên trang bìa
- Đăng ký quyền tác giả nếu tài liệu có giá trị lớn

## Góc nhìn thực tế

Đừng để nỗi lo bản quyền ngăn bạn chia sẻ. Phần lớn người mua là người học chân chính. Việc liên tục cập nhật tài liệu mới sẽ luôn giữ bạn đi trước những bản sao lậu.`,
    author_id: 'u_admin',
    tags: ['bản quyền', 'đăng bán'],
    view_count: 2810,
    published: true,
    published_at: ago(40),
    created_at: ago(40)
  }
]

export const NOTIFICATIONS: any[] = [
  { id: 'n_01', user_id: 'u_user', title: 'Mua tài liệu thành công', body: 'Bạn đã mua "Tiếng Anh 12 - 3000 từ vựng theo chủ đề". Tải về ngay trong mục Kho của tôi.', type: 'success', link: '/dashboard/da-mua', read: false, created_at: ago(6) },
  { id: 'n_02', user_id: 'u_user', title: 'Nạp tiền thành công', body: 'Ví của bạn đã được cộng 200.000đ.', type: 'success', link: '/dashboard/doanh-thu', read: false, created_at: ago(12) },
  { id: 'n_03', user_id: 'u_user', title: 'Tài liệu mới trong môn Toán', body: 'Có 3 tài liệu mới phù hợp với môn học bạn theo dõi.', type: 'info', link: '/tai-lieu?subject=toan', read: true, created_at: ago(18) },
  { id: 'n_04', user_id: 'u_seller', title: 'Bạn có đơn hàng mới', body: 'Tài liệu "Bộ 50 đề thi thử THPT Quốc gia môn Toán 2025" vừa được mua. Bạn nhận 126.650đ.', type: 'success', link: '/dashboard/doanh-thu', read: false, created_at: ago(4) },
  { id: 'n_05', user_id: 'u_seller', title: 'Yêu cầu rút tiền đang xử lý', body: 'Yêu cầu rút 500.000đ đang được xử lý, dự kiến hoàn tất trong 1-2 ngày làm việc.', type: 'warning', link: '/dashboard/doanh-thu', read: false, created_at: ago(1) },
  { id: 'n_06', user_id: 'u_seller', title: 'Đánh giá mới 5 sao', body: 'Tài liệu của bạn nhận được đánh giá 5 sao mới.', type: 'info', link: '/dashboard/dang-ban', read: true, created_at: ago(9) },
  { id: 'n_07', user_id: 'u_admin', title: '3 tài liệu chờ duyệt', body: 'Có 3 tài liệu mới đang chờ kiểm duyệt.', type: 'warning', link: '/admin/tai-lieu', read: false, created_at: ago(1) },
  { id: 'n_08', user_id: 'u_admin', title: 'Khiếu nại mới', body: 'Có 2 khiếu nại mới cần xử lý.', type: 'error', link: '/admin/khieu-nai', read: false, created_at: ago(2) }
]

export const FAVORITES: any[] = [
  { id: 'f_01', user_id: 'u_user', document_id: 'd_001', created_at: ago(10) },
  { id: 'f_02', user_id: 'u_user', document_id: 'd_006', created_at: ago(8) },
  { id: 'f_03', user_id: 'u_user', document_id: 'd_015', created_at: ago(5) },
  { id: 'f_04', user_id: 'u_user', document_id: 'd_018', created_at: ago(3) },
  { id: 'f_05', user_id: 'u_u2', document_id: 'd_001', created_at: ago(7) },
  { id: 'f_06', user_id: 'u_u2', document_id: 'd_010', created_at: ago(4) }
]

export const DOWNLOADS: any[] = [
  { id: 'dl_01', user_id: 'u_user', document_id: 'd_001', created_at: ago(25) },
  { id: 'dl_02', user_id: 'u_user', document_id: 'd_002', created_at: ago(22) },
  { id: 'dl_03', user_id: 'u_user', document_id: 'd_015', created_at: ago(18) },
  { id: 'dl_04', user_id: 'u_user', document_id: 'd_018', created_at: ago(5) },
  { id: 'dl_05', user_id: 'u_u2', document_id: 'd_005', created_at: ago(14) }
]

export const REPORTS: any[] = [
  { id: 'rp_01', document_id: 'd_004', user_id: 'u_user', reason: 'Vi phạm bản quyền', detail: 'Nội dung trùng với sách xuất bản của NXB Giáo dục, trang 45-88.', status: 'open', created_at: ago(2) },
  { id: 'rp_02', document_id: 'd_011', user_id: 'u_u2', reason: 'Sai mô tả', detail: 'Mô tả ghi 142 trang nhưng file thực tế chỉ có 96 trang.', status: 'open', created_at: ago(1) },
  { id: 'rp_03', document_id: 'd_022', user_id: 'u_user', reason: 'Chất lượng kém', detail: 'File scan mờ, nhiều trang không đọc được.', status: 'resolved', admin_note: 'Đã yêu cầu người bán tải lại file chất lượng cao. Đã xử lý xong.', created_at: ago(8) },
  { id: 'rp_04', document_id: 'd_007', user_id: 'u_u2', reason: 'Nội dung không phù hợp', detail: 'Có một số câu ví dụ dùng từ ngữ chưa chuẩn mực.', status: 'dismissed', admin_note: 'Đã kiểm tra, nội dung bình thường, không vi phạm.', created_at: ago(15) }
]

export const SETTINGS: Record<string, any> = {
  id: 'settings',
  commission_rate: 0.15,
  min_withdraw: 200000,
  min_price: 10000,
  max_file_mb: 50,
  hotline: '1900 6868',
  email: 'hotro@mapdocs.vn',
  address: 'Tầng 12, Toà nhà Sunrise, 90 Nguyễn Chí Thanh, Đống Đa, Hà Nội',
  facebook: 'https://facebook.com/mapdocs.vn'
}

for (const c of CATEGORIES) {
  c.document_count = DOCUMENTS.filter((d) => d.subject === c.slug && d.status === 'approved').length
}
