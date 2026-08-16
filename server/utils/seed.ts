import type {
  User, Category, DocumentItem, Order, Review, Transaction, Blog, Notification, ReportItem
} from '~/types'

export const DEMO_PASSWORD = '123456'

const now = Date.now()
const d = (daysAgo: number) => new Date(now - daysAgo * 86400000).toISOString()

export const USERS: User[] = [
  { id: 'u1', name: 'Quản trị viên MapDocs', email: 'admin@mapdocs.vn', password: DEMO_PASSWORD, role: 'admin', balance: 0, email_verified: true, provider: 'local', bio: 'Quản trị hệ thống MapDocs', created_at: d(400) },
  { id: 'u2', name: 'Thầy Vũ Ngọc Anh', email: 'seller@mapdocs.vn', password: DEMO_PASSWORD, role: 'seller', balance: 4850000, email_verified: true, provider: 'local', bio: 'Giáo viên Vật lý - 12 năm kinh nghiệm luyện thi THPT Quốc gia. Tác giả nhiều bộ chuyên đề Vật lý 10-11-12.', phone: '0987654321', created_at: d(360) },
  { id: 'u3', name: 'Nguyễn Minh Anh', email: 'user@mapdocs.vn', password: DEMO_PASSWORD, role: 'user', balance: 500000, email_verified: true, provider: 'local', bio: 'Học sinh lớp 12', created_at: d(120) },
  { id: 'u4', name: 'Cô Nguyễn Thu Hằng', email: 'hang.toan@mapdocs.vn', password: DEMO_PASSWORD, role: 'seller', balance: 3120000, email_verified: true, provider: 'local', bio: 'Thạc sĩ Toán học - Chuyên luyện thi Toán THPT & Đánh giá năng lực.', created_at: d(300) },
  { id: 'u5', name: 'Thầy Phạm Ngọc Lam Trường', email: 'truong.hoa@mapdocs.vn', password: DEMO_PASSWORD, role: 'seller', balance: 2260000, email_verified: true, provider: 'local', bio: 'Giáo viên Hoá học - Tác giả sách "Công phá Hoá học hữu cơ".', created_at: d(280) },
  { id: 'u6', name: 'Cô Trần Thị Bích Ngọc', email: 'ngoc.van@mapdocs.vn', password: DEMO_PASSWORD, role: 'seller', balance: 1580000, email_verified: true, provider: 'local', bio: 'Giáo viên Ngữ văn - 10 năm ôn thi THPT Quốc gia.', created_at: d(200) },
  { id: 'u7', name: 'Mr. David Nguyen', email: 'david.eng@mapdocs.vn', password: DEMO_PASSWORD, role: 'seller', balance: 980000, email_verified: true, provider: 'local', bio: 'IELTS 8.5 - Giáo viên Tiếng Anh luyện thi THPT & IELTS.', created_at: d(150) },
  { id: 'u8', name: 'Tài khoản vi phạm', email: 'blocked@mapdocs.vn', password: DEMO_PASSWORD, role: 'user', balance: 0, blocked: true, email_verified: false, provider: 'local', created_at: d(60) }
]

export const CATEGORIES: Category[] = [
  { id: 'c1', name: 'Toán học', slug: 'toan', icon: 'fa-square-root-variable', color: '#0b4a8f', description: 'Đại số, hình học, giải tích' },
  { id: 'c2', name: 'Vật lý', slug: 'ly', icon: 'fa-atom', color: '#ff8412', description: 'Cơ, nhiệt, điện, quang, hạt nhân' },
  { id: 'c3', name: 'Hoá học', slug: 'hoa', icon: 'fa-flask', color: '#16a34a', description: 'Vô cơ, hữu cơ, đại cương' },
  { id: 'c4', name: 'Sinh học', slug: 'sinh', icon: 'fa-dna', color: '#0891b2', description: 'Di truyền, tiến hoá, sinh thái' },
  { id: 'c5', name: 'Ngữ văn', slug: 'van', icon: 'fa-book-open', color: '#dc2626', description: 'Nghị luận văn học, xã hội' },
  { id: 'c6', name: 'Tiếng Anh', slug: 'anh', icon: 'fa-language', color: '#7c3aed', description: 'Ngữ pháp, từ vựng, đề thi' },
  { id: 'c7', name: 'Lịch sử', slug: 'su', icon: 'fa-landmark', color: '#b45309', description: 'Lịch sử Việt Nam & thế giới' },
  { id: 'c8', name: 'Địa lý', slug: 'dia', icon: 'fa-earth-asia', color: '#059669', description: 'Địa lý tự nhiên, kinh tế xã hội' },
  { id: 'c9', name: 'Tin học', slug: 'tin', icon: 'fa-laptop-code', color: '#4f46e5', description: 'Lập trình, tin học ứng dụng' },
  { id: 'c10', name: 'GDCD', slug: 'gdcd', icon: 'fa-scale-balanced', color: '#db2777', description: 'Giáo dục công dân, pháp luật' }
]

function slugify(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90)
}

interface DocSeed {
  t: string; s: string; g: number; p: number; sid: string; pg: number;
  feat?: boolean; tags?: string[]; st?: any; days: number; views: number; dls: number; sold: number
}

const DOC_SEEDS: DocSeed[] = [
  { t: 'Tổng ôn Vật lý 12 - Dao động cơ học (200 bài có lời giải)', s: 'ly', g: 12, p: 89000, sid: 'u2', pg: 156, feat: true, days: 5, views: 4820, dls: 612, sold: 318, tags: ['dao động cơ', 'ôn thi THPT', 'có lời giải'] },
  { t: 'Chuyên đề Sóng cơ và sóng âm - Lý thuyết & 150 bài tập', s: 'ly', g: 12, p: 79000, sid: 'u2', pg: 128, feat: true, days: 12, views: 3610, dls: 445, sold: 226, tags: ['sóng cơ', 'sóng âm', 'chuyên đề'] },
  { t: 'Đề thi thử THPT Quốc gia môn Vật lý 2025 - Đợt 1 (Có đáp án)', s: 'ly', g: 12, p: 0, sid: 'u2', pg: 12, days: 3, views: 8930, dls: 3120, sold: 0, tags: ['đề thi thử', 'miễn phí', '2025'] },
  { t: 'Công thức giải nhanh Vật lý 12 - Tổng hợp 8 trang', s: 'ly', g: 12, p: 0, sid: 'u2', pg: 8, days: 18, views: 12400, dls: 5240, sold: 0, tags: ['công thức', 'giải nhanh', 'miễn phí'] },
  { t: 'Điện xoay chiều - Phương pháp giản đồ vector nâng cao', s: 'ly', g: 12, p: 99000, sid: 'u2', pg: 184, days: 25, views: 2140, dls: 260, sold: 141, tags: ['điện xoay chiều', 'nâng cao'] },
  { t: 'Vật lý 11 - Trọn bộ chuyên đề Điện trường & Dòng điện', s: 'ly', g: 11, p: 69000, sid: 'u2', pg: 142, days: 40, views: 1890, dls: 210, sold: 98, tags: ['vật lý 11', 'điện trường'] },
  { t: 'Vật lý 10 - Động học & Động lực học chất điểm', s: 'ly', g: 10, p: 59000, sid: 'u2', pg: 118, days: 55, views: 1420, dls: 180, sold: 76, tags: ['vật lý 10', 'động học'] },
  { t: 'Chuyên đề Hàm số và ứng dụng đạo hàm - 300 bài VD-VDC', s: 'toan', g: 12, p: 119000, sid: 'u4', pg: 245, feat: true, days: 7, views: 6210, dls: 780, sold: 412, tags: ['hàm số', 'đạo hàm', 'VD-VDC'] },
  { t: 'Hình học không gian Oxyz - Toàn tập phương pháp toạ độ', s: 'toan', g: 12, p: 109000, sid: 'u4', pg: 210, feat: true, days: 15, views: 4530, dls: 520, sold: 289, tags: ['oxyz', 'hình học không gian'] },
  { t: 'Đề minh hoạ Toán THPT 2025 - Giải chi tiết từng câu', s: 'toan', g: 12, p: 0, sid: 'u4', pg: 24, days: 2, views: 15200, dls: 6840, sold: 0, tags: ['đề minh hoạ', 'miễn phí', '2025'] },
  { t: 'Nguyên hàm - Tích phân: 250 bài tập phân dạng', s: 'toan', g: 12, p: 95000, sid: 'u4', pg: 196, days: 22, views: 3320, dls: 390, sold: 198, tags: ['tích phân', 'nguyên hàm'] },
  { t: 'Số phức - Lý thuyết trọng tâm & bài tập trắc nghiệm', s: 'toan', g: 12, p: 65000, sid: 'u4', pg: 96, days: 33, views: 2110, dls: 245, sold: 112, tags: ['số phức'] },
  { t: 'Toán 11 - Dãy số, cấp số cộng, cấp số nhân', s: 'toan', g: 11, p: 55000, sid: 'u4', pg: 88, days: 48, views: 1670, dls: 195, sold: 87, tags: ['toán 11', 'dãy số'] },
  { t: 'Toán 10 - Mệnh đề, tập hợp và bất phương trình', s: 'toan', g: 10, p: 0, sid: 'u4', pg: 62, days: 60, views: 4310, dls: 1820, sold: 0, tags: ['toán 10', 'miễn phí'] },
  { t: 'Ôn thi Đánh giá năng lực ĐHQG - Phần Toán logic', s: 'toan', g: 12, p: 129000, sid: 'u4', pg: 268, days: 29, views: 2890, dls: 310, sold: 165, tags: ['ĐGNL', 'tư duy logic'] },
  { t: 'Công phá Hoá hữu cơ 12 - Este, Lipit, Amin, Protein', s: 'hoa', g: 12, p: 105000, sid: 'u5', pg: 228, feat: true, days: 9, views: 5140, dls: 640, sold: 331, tags: ['hoá hữu cơ', 'este', 'amin'] },
  { t: 'Bài toán kim loại tác dụng với axit - Phương pháp bảo toàn', s: 'hoa', g: 12, p: 85000, sid: 'u5', pg: 164, days: 20, views: 3020, dls: 350, sold: 178, tags: ['kim loại', 'bảo toàn electron'] },
  { t: 'Sơ đồ tư duy Hoá học 12 - Trọn bộ 9 chương', s: 'hoa', g: 12, p: 0, sid: 'u5', pg: 18, days: 6, views: 9820, dls: 4210, sold: 0, tags: ['sơ đồ tư duy', 'miễn phí'] },
  { t: 'Hoá học 11 - Nitơ, Photpho, Cacbon, Silic', s: 'hoa', g: 11, p: 62000, sid: 'u5', pg: 124, days: 44, views: 1560, dls: 175, sold: 82, tags: ['hoá 11', 'phi kim'] },
  { t: 'Đề thi thử Hoá học 2025 - Bộ 10 đề chuẩn cấu trúc', s: 'hoa', g: 12, p: 99000, sid: 'u5', pg: 120, feat: true, days: 11, views: 4110, dls: 480, sold: 245, tags: ['đề thi thử', '10 đề'] },
  { t: 'Hoá học 10 - Cấu tạo nguyên tử & Bảng tuần hoàn', s: 'hoa', g: 10, p: 48000, sid: 'u5', pg: 92, days: 66, views: 1240, dls: 140, sold: 61, tags: ['hoá 10', 'nguyên tử'] },
  { t: 'Di truyền học quần thể - Chuyên đề Sinh 12 nâng cao', s: 'sinh', g: 12, p: 88000, sid: 'u5', pg: 172, days: 17, views: 2740, dls: 310, sold: 158, tags: ['di truyền', 'quần thể'] },
  { t: 'Sinh học 12 - Tóm tắt lý thuyết toàn tập 40 trang', s: 'sinh', g: 12, p: 0, sid: 'u5', pg: 40, days: 8, views: 7620, dls: 3140, sold: 0, tags: ['tóm tắt', 'miễn phí'] },
  { t: 'Bài tập quy luật di truyền Menđen - 180 câu có giải', s: 'sinh', g: 12, p: 75000, sid: 'u5', pg: 148, days: 31, views: 2010, dls: 230, sold: 118, tags: ['menđen', 'quy luật di truyền'] },
  { t: 'Nghị luận văn học 12 - Bộ 25 đề mẫu điểm cao', s: 'van', g: 12, p: 92000, sid: 'u6', pg: 188, feat: true, days: 10, views: 4890, dls: 570, sold: 296, tags: ['nghị luận văn học', 'văn mẫu'] },
  { t: 'Tổng hợp mở bài - kết bài hay cho 12 tác phẩm trọng tâm', s: 'van', g: 12, p: 0, sid: 'u6', pg: 32, days: 4, views: 11300, dls: 4920, sold: 0, tags: ['mở bài', 'kết bài', 'miễn phí'] },
  { t: 'Nghị luận xã hội - 40 chủ đề nóng & dàn ý chi tiết', s: 'van', g: 12, p: 78000, sid: 'u6', pg: 156, days: 19, views: 3410, dls: 400, sold: 205, tags: ['nghị luận xã hội', 'dàn ý'] },
  { t: 'Ngữ văn 11 - Phân tích các tác phẩm trọng tâm', s: 'van', g: 11, p: 58000, sid: 'u6', pg: 132, days: 50, views: 1480, dls: 170, sold: 74, tags: ['văn 11'] },
  { t: 'Ngữ pháp Tiếng Anh THPT - 3000 câu trắc nghiệm phân dạng', s: 'anh', g: 12, p: 96000, sid: 'u7', pg: 232, feat: true, days: 13, views: 5320, dls: 610, sold: 312, tags: ['ngữ pháp', 'trắc nghiệm'] },
  { t: '600 từ vựng Tiếng Anh thi THPT theo chủ đề', s: 'anh', g: 12, p: 0, sid: 'u7', pg: 28, days: 7, views: 10200, dls: 4380, sold: 0, tags: ['từ vựng', 'miễn phí'] },
  { t: 'Đọc hiểu Tiếng Anh - Chiến thuật & 50 bài luyện', s: 'anh', g: 12, p: 82000, sid: 'u7', pg: 168, days: 26, views: 2630, dls: 300, sold: 152, tags: ['đọc hiểu', 'reading'] },
  { t: 'Tiếng Anh 11 - Bài tập theo từng Unit (SGK mới)', s: 'anh', g: 11, p: 52000, sid: 'u7', pg: 108, days: 58, views: 1320, dls: 155, sold: 68, tags: ['tiếng anh 11', 'SGK mới'] },
  { t: 'Lịch sử 12 - Sơ đồ hoá toàn bộ chương trình', s: 'su', g: 12, p: 45000, sid: 'u6', pg: 76, days: 36, views: 1920, dls: 220, sold: 96, tags: ['lịch sử 12', 'sơ đồ'] },
  { t: 'Atlat Địa lý - Hướng dẫn khai thác & 200 câu vận dụng', s: 'dia', g: 12, p: 55000, sid: 'u6', pg: 98, days: 28, views: 2340, dls: 270, sold: 124, tags: ['atlat', 'địa lý 12'] },
  { t: 'Tin học 11 - Lập trình Python căn bản cho học sinh', s: 'tin', g: 11, p: 0, sid: 'u4', pg: 84, days: 21, views: 3820, dls: 1420, sold: 0, tags: ['python', 'lập trình', 'miễn phí'] },
  { t: 'GDCD 12 - Pháp luật & đời sống: 300 câu trắc nghiệm', s: 'gdcd', g: 12, p: 42000, sid: 'u6', pg: 88, days: 39, views: 1680, dls: 190, sold: 84, tags: ['gdcd', 'pháp luật'] },
  { t: 'Chuyên đề Cơ học chất lưu (đang chờ duyệt)', s: 'ly', g: 10, p: 45000, sid: 'u2', pg: 64, st: 'pending', days: 1, views: 0, dls: 0, sold: 0, tags: ['chờ duyệt'] },
  { t: 'Bộ đề Toán ôn tập hè lớp 10 (đang chờ duyệt)', s: 'toan', g: 10, p: 38000, sid: 'u4', pg: 72, st: 'pending', days: 2, views: 0, dls: 0, sold: 0, tags: ['ôn hè'] },
  { t: 'Tài liệu sao chép không rõ nguồn (đã từ chối)', s: 'hoa', g: 12, p: 30000, sid: 'u5', pg: 20, st: 'rejected', days: 14, views: 0, dls: 0, sold: 0, tags: [] }
]

function buildDescription(s: DocSeed): string {
  const subjName = CATEGORIES.find((c) => c.slug === s.s)?.name || s.s
  return `Tài liệu "${s.t}" thuộc môn ${subjName} lớp ${s.g}, được biên soạn công phu bởi đội ngũ giáo viên giàu kinh nghiệm luyện thi THPT Quốc gia.

NỘI DUNG CHÍNH:
• Hệ thống lý thuyết trọng tâm được trình bày ngắn gọn, dễ nhớ, bám sát chương trình SGK và cấu trúc đề thi mới nhất.
• Phân dạng bài tập từ cơ bản đến vận dụng cao (VD - VDC), mỗi dạng có phương pháp giải mẫu chi tiết.
• Bài tập tự luyện có đáp án và lời giải đầy đủ, giúp học sinh tự kiểm tra và rút kinh nghiệm.
• Tổng hợp các lỗi sai thường gặp và mẹo giải nhanh giúp tiết kiệm thời gian làm bài.

ĐỐI TƯỢNG SỬ DỤNG:
• Học sinh lớp ${s.g} đang ôn tập kiến thức và luyện thi.
• Giáo viên cần nguồn tài liệu tham khảo để soạn giáo án, ra đề kiểm tra.
• Phụ huynh muốn đồng hành cùng con trong quá trình học tập.

Tài liệu gồm ${s.pg} trang, định dạng PDF chất lượng cao, in ấn rõ nét, có thể đọc trên mọi thiết bị.`
}

export const DOCUMENTS: DocumentItem[] = DOC_SEEDS.map((s, i) => {
  const isFree = s.p === 0
  const rc = s.st ? 0 : Math.max(0, Math.round(s.sold * 0.28) + (isFree ? Math.round(s.dls * 0.02) : 0))
  const ra = rc === 0 ? 0 : Math.round((4.1 + ((i * 37) % 9) / 10) * 10) / 10
  return {
    id: `d${i + 1}`,
    title: s.t,
    slug: slugify(s.t) + '-' + (i + 1),
    description: buildDescription(s),
    subject: s.s,
    grade: s.g,
    price: s.p,
    is_free: isFree,
    thumbnail: '',
    file_url: `/files/mapdocs-${i + 1}.pdf`,
    preview_url: `/files/preview-${i + 1}.pdf`,
    file_type: 'pdf' as const,
    file_size: Math.round((s.pg * 0.09 + 0.6) * 1024 * 1024),
    pages: s.pg,
    status: (s.st || 'approved') as any,
    reject_reason: s.st === 'rejected' ? 'Tài liệu vi phạm bản quyền, không rõ nguồn gốc. Vui lòng đăng tài liệu do bạn tự biên soạn.' : undefined,
    seller_id: s.sid,
    tags: s.tags || [],
    view_count: s.views,
    download_count: s.dls,
    sold_count: s.sold,
    rating_avg: ra > 5 ? 5 : ra,
    rating_count: rc,
    featured: !!s.feat,
    created_at: d(s.days),
    updated_at: d(Math.max(0, s.days - 1))
  }
})

const REVIEW_TEXTS = [
  'Tài liệu rất chi tiết, lời giải dễ hiểu. Mình đã cải thiện điểm số rõ rệt sau khi luyện bộ này.',
  'Nội dung bám sát đề thi, phân dạng khoa học. Rất đáng đồng tiền!',
  'Chất lượng file rõ nét, trình bày đẹp mắt. Cảm ơn thầy cô đã biên soạn.',
  'Bài tập từ dễ đến khó, phù hợp cho học sinh tự học tại nhà.',
  'Phần lý thuyết tóm tắt cực kỳ hữu ích, tiết kiệm thời gian ôn tập.',
  'Có một vài lỗi chính tả nhỏ nhưng nhìn chung tài liệu rất tốt.',
  'Mình mua cho con ôn thi, con bảo dễ hiểu hơn sách tham khảo ngoài hiệu sách.',
  'Đề bám cấu trúc mới 2025, giải chi tiết từng câu. Recommend!',
  'Tài liệu ổn, mong tác giả cập nhật thêm phần vận dụng cao.',
  'Đúng thứ mình cần cho giai đoạn nước rút. 5 sao!'
]

export const REVIEWS: Review[] = (() => {
  const out: Review[] = []
  let n = 1
  const reviewers = ['u3', 'u4', 'u5', 'u6', 'u7', 'u2']
  DOCUMENTS.filter((x) => x.rating_count > 0).forEach((doc, di) => {
    const cnt = Math.min(5, Math.max(2, doc.rating_count % 6))
    for (let i = 0; i < cnt; i++) {
      const uid = reviewers[(di + i) % reviewers.length]
      if (uid === doc.seller_id) continue
      out.push({
        id: `r${n++}`,
        document_id: doc.id,
        user_id: uid,
        rating: [5, 5, 4, 5, 4, 3][(di + i) % 6],
        comment: REVIEW_TEXTS[(di * 3 + i) % REVIEW_TEXTS.length],
        created_at: d(Math.max(0, 30 - di - i * 2))
      })
    }
  })
  return out
})()

export const ORDERS: Order[] = [
  { id: 'o1', code: 'MD24A1B2C3', buyer_id: 'u3', document_id: 'd1', seller_id: 'u2', amount: 89000, commission: 13350, seller_amount: 75650, payment_method: 'wallet', status: 'paid', created_at: d(20) },
  { id: 'o2', code: 'MD24D4E5F6', buyer_id: 'u3', document_id: 'd8', seller_id: 'u4', amount: 119000, commission: 17850, seller_amount: 101150, payment_method: 'vnpay', status: 'paid', created_at: d(14) },
  { id: 'o3', code: 'MD24G7H8I9', buyer_id: 'u3', document_id: 'd16', seller_id: 'u5', amount: 105000, commission: 15750, seller_amount: 89250, payment_method: 'wallet', status: 'paid', created_at: d(9) },
  { id: 'o4', code: 'MD24J1K2L3', buyer_id: 'u7', document_id: 'd9', seller_id: 'u4', amount: 109000, commission: 16350, seller_amount: 92650, payment_method: 'momo', status: 'paid', created_at: d(5) },
  { id: 'o5', code: 'MD24M4N5O6', buyer_id: 'u3', document_id: 'd25', seller_id: 'u6', amount: 92000, commission: 13800, seller_amount: 78200, payment_method: 'vnpay', status: 'pending', created_at: d(1) }
]

export const TRANSACTIONS: Transaction[] = [
  { id: 't1', user_id: 'u3', type: 'topup', amount: 1000000, balance_after: 1000000, note: 'Nạp tiền vào ví qua VNPay', created_at: d(25) },
  { id: 't2', user_id: 'u3', type: 'purchase', amount: -89000, balance_after: 911000, note: 'Mua tài liệu: Tổng ôn Vật lý 12 - Dao động cơ học', ref_id: 'o1', created_at: d(20) },
  { id: 't3', user_id: 'u2', type: 'sale', amount: 75650, balance_after: 4775650, note: 'Bán tài liệu (đã trừ 15% hoa hồng)', ref_id: 'o1', created_at: d(20) },
  { id: 't4', user_id: 'u3', type: 'purchase', amount: -119000, balance_after: 792000, note: 'Mua tài liệu: Chuyên đề Hàm số và ứng dụng đạo hàm', ref_id: 'o2', created_at: d(14) },
  { id: 't5', user_id: 'u4', type: 'sale', amount: 101150, balance_after: 3120000, note: 'Bán tài liệu (đã trừ 15% hoa hồng)', ref_id: 'o2', created_at: d(14) },
  { id: 't6', user_id: 'u2', type: 'withdraw', amount: -2000000, balance_after: 2775650, note: 'Rút tiền về Vietcombank ****4321', created_at: d(10) },
  { id: 't7', user_id: 'u3', type: 'purchase', amount: -105000, balance_after: 687000, note: 'Mua tài liệu: Công phá Hoá hữu cơ 12', ref_id: 'o3', created_at: d(9) },
  { id: 't8', user_id: 'u5', type: 'sale', amount: 89250, balance_after: 2260000, note: 'Bán tài liệu (đã trừ 15% hoa hồng)', ref_id: 'o3', created_at: d(9) },
  { id: 't9', user_id: 'u3', type: 'topup', amount: 500000, balance_after: 500000, note: 'Nạp tiền vào ví qua Momo', created_at: d(3) }
]

const BLOG_CONTENT_1 = `## Vì sao giai đoạn nước rút lại quan trọng?

Ba tháng cuối trước kỳ thi THPT Quốc gia là khoảng thời gian quyết định. Đây không còn là lúc học kiến thức mới, mà là lúc **hệ thống hoá, luyện đề và tối ưu chiến thuật làm bài**.

## 1. Xây dựng lộ trình theo tuần

Thay vì học dàn trải, hãy chia nhỏ mục tiêu:

- **Tuần 1-4**: Rà soát toàn bộ lý thuyết trọng tâm. Mỗi môn dành 3 buổi/tuần.
- **Tuần 5-8**: Luyện đề theo chuyên đề. Mỗi ngày 1 chuyên đề + 20 câu vận dụng.
- **Tuần 9-12**: Luyện đề tổng hợp đúng giờ thi. Tối thiểu 3 đề/tuần/môn.

## 2. Kỹ thuật "3 lần chạm" với mỗi dạng bài

Nghiên cứu cho thấy học sinh chỉ thực sự nhớ một dạng bài sau khi tiếp xúc 3 lần ở các thời điểm khác nhau:

1. Lần 1: Học phương pháp giải mẫu.
2. Lần 2: Tự làm lại sau 2 ngày.
3. Lần 3: Gặp lại trong đề tổng hợp sau 1 tuần.

## 3. Sổ tay lỗi sai — vũ khí bí mật

Mỗi khi làm sai một câu, hãy ghi lại vào sổ tay theo mẫu: *Đề bài → Lỗi sai → Nguyên nhân → Cách tránh*. Trước ngày thi, đọc lại sổ tay này còn hiệu quả hơn đọc lại toàn bộ sách.

## 4. Chiến thuật phòng thi

- Quét đề 2 phút đầu, đánh dấu câu dễ - trung bình - khó.
- Làm câu dễ trước, không sa đà quá 90 giây cho một câu trắc nghiệm.
- Dành 10 phút cuối để rà soát và tô lại phiếu trả lời.

## 5. Giữ sức khoẻ và tinh thần

Ngủ đủ 7 tiếng vẫn hiệu quả hơn thức đến 2 giờ sáng. Não bộ củng cố trí nhớ trong lúc ngủ sâu — đây là điều nhiều học sinh bỏ qua.

> **Kết luận**: Điểm số không đến từ việc học nhiều nhất, mà từ việc học đúng cách nhất.`

const BLOG_CONTENT_2 = `## Cấu trúc đề thi 2025 có gì mới?

Bộ GD&ĐT đã công bố đề minh hoạ theo Chương trình GDPT 2018 với nhiều thay đổi đáng chú ý về **định dạng câu hỏi**.

## Ba dạng câu hỏi mới

### Dạng 1: Trắc nghiệm nhiều lựa chọn
Vẫn giữ 4 phương án A/B/C/D, chọn 1 đáp án đúng. Chiếm khoảng 50% số câu.

### Dạng 2: Trắc nghiệm đúng/sai
Mỗi câu có 4 ý a), b), c), d). Thí sinh phải xác định đúng/sai cho từng ý. Điểm được tính theo số ý trả lời đúng: 1 ý = 0,1đ; 2 ý = 0,25đ; 3 ý = 0,5đ; 4 ý = 1,0đ.

Đây là dạng **dễ mất điểm nhất** vì đòi hỏi hiểu bản chất, không thể đoán mò.

### Dạng 3: Trả lời ngắn
Thí sinh tự tính và điền đáp số. Không có phương án gợi ý, loại bỏ hoàn toàn khả năng khoanh bừa.

## Chiến lược ôn tập tương ứng

- **Với dạng đúng/sai**: Luyện đọc kỹ từng mệnh đề, chú ý các từ khoá "luôn luôn", "chỉ khi", "không bao giờ".
- **Với trả lời ngắn**: Rèn kỹ năng tính toán chính xác, chú ý đơn vị và làm tròn.
- **Tổng thể**: Học bản chất thay vì học mẹo.

## Tài liệu nên dùng

Ưu tiên các bộ đề đã cập nhật cấu trúc mới. Trên MapDocs, các tài liệu có tag **"2025"** đều đã được biên soạn theo định dạng này.`

const BLOG_CONTENT_3 = `## Bán tài liệu online — nguồn thu nhập mới cho giáo viên

Nhiều thầy cô đã dành hàng trăm giờ biên soạn giáo án, bộ đề, chuyên đề nhưng chúng chỉ nằm trong ổ cứng. MapDocs giúp bạn biến kho tài liệu đó thành thu nhập ổn định.

## Bước 1: Chuẩn bị tài liệu chất lượng

- Xuất file PDF để giữ nguyên định dạng trên mọi thiết bị.
- Đặt tiêu đề rõ ràng: *[Môn] + [Lớp] + [Chuyên đề] + [Đặc điểm nổi bật]*.
- Chèn watermark nhẹ ở góc trang để bảo vệ bản quyền.

## Bước 2: Định giá hợp lý

Khảo sát trên MapDocs cho thấy mức giá bán chạy nhất:

- Tài liệu 20-50 trang: **30.000đ - 60.000đ**
- Tài liệu 50-150 trang: **60.000đ - 100.000đ**
- Bộ tài liệu > 150 trang: **100.000đ - 150.000đ**

## Bước 3: Tối ưu mô tả

Mô tả tốt cần trả lời 3 câu hỏi: *Tài liệu này có gì? Dành cho ai? Người học sẽ đạt được gì?*

## Bước 4: Hiểu về hoa hồng

MapDocs thu **15% hoa hồng** trên mỗi giao dịch. Bạn nhận **85%** giá bán, cộng thẳng vào ví và có thể rút về tài khoản ngân hàng bất cứ lúc nào (tối thiểu 200.000đ).

## Bước 5: Duy trì và phát triển

- Cập nhật tài liệu mỗi năm theo cấu trúc đề mới.
- Trả lời đánh giá của người mua để tăng độ tin cậy.
- Đăng đều đặn 2-4 tài liệu/tháng.`

const BLOG_CONTENT_4 = `## Học nhóm hay tự học?

Câu trả lời không phải "chọn một" mà là **kết hợp đúng tỷ lệ**. Nghiên cứu giáo dục chỉ ra tỷ lệ lý tưởng là 70% tự học và 30% học nhóm.

## Khi nào nên tự học?

- Tiếp thu kiến thức mới cần tập trung sâu.
- Luyện đề tính giờ để mô phỏng điều kiện phòng thi.
- Rà soát lỗi sai cá nhân.

## Khi nào học nhóm phát huy tác dụng?

- **Giảng lại cho bạn**: Phương pháp Feynman — bạn chỉ thực sự hiểu khi giải thích được cho người khác.
- **Tranh luận đáp án**: Đặc biệt hiệu quả với dạng câu đúng/sai của đề thi 2025.
- **Chia sẻ tài liệu**: Mỗi người phụ trách tóm tắt một chuyên đề rồi trao đổi.

## Mô hình nhóm 4 người hiệu quả

1. **Người điều phối**: Đặt lịch, chọn chủ đề buổi học.
2. **Người ra đề**: Chuẩn bị 10 câu kiểm tra nhanh đầu buổi.
3. **Người tổng hợp**: Ghi lại kiến thức và lỗi sai chung.
4. **Người phản biện**: Đặt câu hỏi "tại sao" để đào sâu.

Vai trò nên luân phiên mỗi tuần.

## Những sai lầm cần tránh

- Nhóm quá đông (> 6 người) dễ mất tập trung.
- Học nhóm nhưng mỗi người làm việc riêng.
- Không có mục tiêu cụ thể cho từng buổi.`

export const BLOGS: Blog[] = [
  { id: 'b1', title: 'Lộ trình ôn thi THPT Quốc gia 3 tháng cuối hiệu quả nhất', slug: 'lo-trinh-on-thi-thpt-quoc-gia-3-thang-cuoi', excerpt: 'Ba tháng cuối là giai đoạn quyết định. Bài viết chia sẻ lộ trình chi tiết theo tuần, kỹ thuật "3 lần chạm" và chiến thuật phòng thi giúp bạn bứt phá điểm số.', content: BLOG_CONTENT_1, author_id: 'u1', tags: ['ôn thi', 'lộ trình', 'THPT Quốc gia'], published: true, view_count: 5240, created_at: d(6) },
  { id: 'b2', title: 'Cấu trúc đề thi THPT 2025: 3 dạng câu hỏi mới và cách chinh phục', slug: 'cau-truc-de-thi-thpt-2025-ba-dang-cau-hoi-moi', excerpt: 'Đề thi theo Chương trình GDPT 2018 bổ sung dạng đúng/sai và trả lời ngắn. Phân tích chi tiết cách tính điểm và chiến lược ôn tập tương ứng.', content: BLOG_CONTENT_2, author_id: 'u1', tags: ['2025', 'cấu trúc đề', 'đổi mới'], published: true, view_count: 8910, created_at: d(12) },
  { id: 'b3', title: 'Hướng dẫn giáo viên kiếm thu nhập từ việc bán tài liệu online', slug: 'huong-dan-giao-vien-ban-tai-lieu-online', excerpt: 'Từ chuẩn bị file, định giá, viết mô tả đến hiểu về hoa hồng 15% — tất cả những gì thầy cô cần biết để bắt đầu kiếm thu nhập trên MapDocs.', content: BLOG_CONTENT_3, author_id: 'u1', tags: ['giáo viên', 'thu nhập', 'hướng dẫn'], published: true, view_count: 3670, created_at: d(20) },
  { id: 'b4', title: 'Học nhóm hay tự học: tỷ lệ vàng 70/30 và mô hình nhóm 4 người', slug: 'hoc-nhom-hay-tu-hoc-ty-le-vang-70-30', excerpt: 'Không phải chọn một trong hai. Bài viết phân tích khi nào nên tự học, khi nào học nhóm và mô hình nhóm 4 người với vai trò luân phiên.', content: BLOG_CONTENT_4, author_id: 'u1', tags: ['phương pháp học', 'học nhóm'], published: true, view_count: 2480, created_at: d(30) }
]

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', user_id: 'u2', title: 'Tài liệu được duyệt', body: 'Tài liệu "Tổng ôn Vật lý 12 - Dao động cơ học" của bạn đã được duyệt và hiển thị công khai.', type: 'document', link: '/dashboard/tai-lieu', read: false, created_at: d(5) },
  { id: 'n2', user_id: 'u2', title: 'Bạn có đơn hàng mới', body: 'Một người dùng vừa mua tài liệu của bạn. Bạn nhận được 75.650đ vào ví.', type: 'order', link: '/dashboard/doanh-thu', read: false, created_at: d(20) },
  { id: 'n3', user_id: 'u3', title: 'Mua tài liệu thành công', body: 'Bạn đã mua thành công "Công phá Hoá hữu cơ 12". Vào mục Tài liệu đã mua để tải xuống.', type: 'order', link: '/dashboard/da-mua', read: true, created_at: d(9) },
  { id: 'n4', user_id: 'u3', title: 'Chào mừng đến MapDocs!', body: 'Cảm ơn bạn đã đăng ký. Khám phá hơn 30 tài liệu chất lượng, trong đó có nhiều tài liệu miễn phí.', type: 'system', link: '/tai-lieu', read: true, created_at: d(120) },
  { id: 'n5', user_id: 'u5', title: 'Tài liệu bị từ chối', body: 'Tài liệu của bạn bị từ chối do vi phạm bản quyền. Xem chi tiết lý do trong mục Tài liệu của tôi.', type: 'document', link: '/dashboard/tai-lieu', read: false, created_at: d(14) }
]

export const REPORTS: ReportItem[] = [
  { id: 'rp1', document_id: 'd5', user_id: 'u3', reason: 'Nội dung sai lệch', detail: 'Câu 45 và 46 trong phần điện xoay chiều có đáp án không chính xác, mong tác giả kiểm tra lại.', status: 'open', created_at: d(4) },
  { id: 'rp2', document_id: 'd12', user_id: 'u7', reason: 'Vi phạm bản quyền', detail: 'Tài liệu này giống hệt sách "Chinh phục số phức" đang bán trên thị trường.', status: 'open', created_at: d(8) },
  { id: 'rp3', document_id: 'd19', user_id: 'u3', reason: 'Chất lượng file kém', detail: 'File scan bị mờ, nhiều trang không đọc được chữ.', status: 'resolved', created_at: d(16) }
]

export const FAVORITES = [
  { id: 'f1', user_id: 'u3', document_id: 'd8', created_at: d(15) },
  { id: 'f2', user_id: 'u3', document_id: 'd16', created_at: d(11) },
  { id: 'f3', user_id: 'u3', document_id: 'd25', created_at: d(6) },
  { id: 'f4', user_id: 'u3', document_id: 'd3', created_at: d(2) }
]

export const DOWNLOADS = [
  { id: 'dl1', user_id: 'u3', document_id: 'd1', created_at: d(19) },
  { id: 'dl2', user_id: 'u3', document_id: 'd3', created_at: d(3) },
  { id: 'dl3', user_id: 'u3', document_id: 'd10', created_at: d(2) }
]

export const SETTINGS: Record<string, any> = {
  commission_rate: 0.15,
  min_withdraw: 200000,
  min_price: 10000,
  max_file_mb: 50,
  hotline: '1900 6789',
  email: 'hotro@mapdocs.vn',
  address: 'Tầng 5, Toà nhà Sông Đà, Phạm Hùng, Nam Từ Liêm, Hà Nội',
  facebook: 'https://facebook.com/mapdocs'
}
