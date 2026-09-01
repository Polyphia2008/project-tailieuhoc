# MapDocs v2.0 — Kho tài liệu học tập chất lượng cao

Nền tảng chia sẻ & mua bán tài liệu học tập (Toán, Lý, Hoá, Sinh, Văn, Anh, Sử, Địa) với dashboard/admin dark theme phong cách thegioidev.com.

## URLs

- **Preview sandbox**: https://3000-iwqu5oi5exjvux525m7sh-8f57ffe2.sandbox.novita.ai
- **GitHub**: https://github.com/Polyphia2008/project-tailieuhoc

## Tech Stack

| Lớp | Công nghệ |
|---|---|
| Framework | Nuxt 3 + Vue 3 + TypeScript |
| UI | TailwindCSS, Radix UI (radix-vue), Sonner toast, Solar Icon Set |
| State | Pinia |
| Animation | @vueuse/motion (stagger fade-up) |
| Chart | Chart.js (dark theme qua `useChartTheme`) |
| Backend | Nuxt Nitro (h3) + jose (JWT) |
| Storage | Cloudflare R2 stub (in-memory khi chưa cấu hình env) |
| Fonts | Inter (UI), Be Vietnam Pro (nội dung), Dancing Script (hello animation) |

## Cài đặt

```bash
git clone https://github.com/Polyphia2008/project-tailieuhoc.git
cd project-tailieuhoc
npm install
cp .env.example .env
pm2 start ecosystem.config.cjs
```

Server chạy tại `http://localhost:3000`. PM2 giới hạn heap 768MB (`--max-old-space-size=768`) phù hợp sandbox RAM thấp.

```bash
pm2 logs mapdocs --nostream    # xem log
pm2 restart mapdocs            # restart
rm -f core                     # xoá core dump sau mỗi lần OOM
```

## Tài khoản demo

| Email | Mật khẩu | Vai trò |
|---|---|---|
| admin@mapdocs.vn | 123456 | Quản trị viên (truy cập `/admin`) |
| seller@mapdocs.vn | 123456 | Người bán |
| user@mapdocs.vn | 123456 | Học sinh |

## Tính năng đã hoàn thành

### Giao diện
- **Landing page hiện đại** (Vercel/Linear style): hero dark với grid + gradient glow, floating DocCard demo, logo cloud, 3 cột tính năng, showcase tài liệu, testimonials, CTA banner gradient, footer 4 cột
- **Dashboard dark theme** (theo thegioidev): sidebar 240px cố định với 3 nhóm menu (SẢN PHẨM & DỊCH VỤ / CUSTOMER / OTHERS) + submenu collapse, topbar search + kbd `⌘K` + chips (hoa hồng, số dư) + notification dropdown + avatar dropdown, 4 stat card có **gradient sparkline** SVG, Chart.js line dark, quick access grid 4 cột với icon gradient tròn
- **Admin panel dark zinc**: sidebar riêng 8 link chia 4 nhóm, 8 stat card sparkline, 2 chart (line GMV/hoa hồng + bar tăng trưởng), top người bán, phân bố theo môn, bảng bulk actions (duyệt/từ chối/xoá) với checkbox
- **Auth layout split**: gradient panel bên trái (logo, 3 điểm mạnh stagger, chips môn học) + form bên phải với input có icon, thanh độ mạnh mật khẩu, divider HOẶC, nút Google brand icon
- **Hello animation** (`/auth/chuc-mung`): check icon SVG scale+rotate → 26 confetti particles toả ra → SVG text "hello" Dancing Script 150px (stroke vẽ trước, fill delay 1.38s) → tên người dùng → button "Khám phá ngay"
- **Scrollbar**: 10px cho public, **6px** trong scope `.mdk` (track trong suốt, thumb `#27272a`, hover `#3f3f46`)

### Backend (40 API routes)
| Nhóm | Endpoints |
|---|---|
| Auth | `register`, `login`, `logout`, `me`, `forgot`, `reset`, `verify`, `google` |
| Documents | `index` GET/POST, `[slug]` GET, `[id]` PUT/DELETE, `review`, `favorite`, `report`, `download` |
| Orders | `checkout`, `confirm`, `index` |
| User | `profile`, `documents`, `transactions`, `favorites`, `notifications` GET/POST, `topup`, `withdraw`, `stats` |
| Admin | `stats`, `documents` GET/POST, `users` GET/POST, `orders`, `categories` GET/POST, `reports` GET/POST, `blogs` GET/POST, `settings` GET/POST, `transactions` |
| Khác | `categories`, `stats`, `blogs` (list + detail), `payment/vnpay-create`, `files/[...key]` |

### Nghiệp vụ
- JWT httpOnly cookie + hash mật khẩu SHA-256 800 vòng có salt
- Ví MapDocs: nạp/rút, hoa hồng 15%, người bán nhận 85%
- Order code format `MD` + base36
- VNPay tích hợp (HMAC-SHA512) + **cổng giả lập** khi chưa có env
- Kiểm duyệt tài liệu (pending → approved/rejected) + thông báo tự động
- Đánh giá, yêu thích, báo cáo vi phạm, thông báo, lịch sử tải

## Data Architecture

11 bảng: `users`, `categories`, `documents`, `orders`, `reviews`, `transactions`, `blogs`, `notifications`, `favorites`, `downloads`, `reports` + `settings`.

**Seed data**: 8 người dùng, 8 danh mục, 30 tài liệu (26 approved / 3 pending / 1 rejected), 29 đơn hàng, 18+ đánh giá, 14 giao dịch, 6 bài blog (đầy đủ nội dung markdown), 8 thông báo, 4 khiếu nại.

Driver hai chế độ (`server/utils/driver.ts`):
- Chưa có env R2 → **in-memory** (mock), reset khi restart
- Có đủ env R2 → hydrate từ `db/*.json` trên R2, ghi lại có debounce 1.2s

## Cấu hình Cloudflare R2 (production)

1. Tạo R2 bucket trên Cloudflare dashboard
2. Tạo API token (R2 → Manage API Tokens) lấy Access Key ID + Secret
3. Thêm vào `.env`:

```env
R2_ACCOUNT_ID=xxxxxxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxx
R2_BUCKET_NAME=mapdocs
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
```

4. Restart: `pm2 restart mapdocs`

`server/utils/r2.ts` đã có **AWS SigV4 signing thật** (Web Crypto API), tự động chuyển từ `MemoryR2` sang `RealR2` khi đủ 4 biến bắt buộc. Kiểm tra trạng thái tại `/admin/cai-dat`.

## Kiểm thử

```
27/27 page route  = 200 (public, auth, dashboard, admin, blog, thanh toán)
24/24 GET API     = 200
Flow end-to-end   = register → topup → checkout → confirm → download → review → favorite  OK
```

## Cấu trúc thư mục

```
webapp/
├── assets/css/main.css          # .mdk dark scope, scrollbar 6px, hello keyframes
├── components/
│   ├── AppIcon.vue              # mapper tên ngắn → Solar/simple-icons
│   ├── dashboard/               # StatCard (sparkline), QuickAction
│   ├── document/                # DocCard, DocSkeleton
│   ├── landing/                 # HeroSection, FeaturesGrid, Testimonials
│   ├── layout/                  # DefaultHeader, DashSidebar, DashTopbar, AdminSidebar, AdminTopbar, FooterPublic
│   └── ui/                      # Toaster, Modal, Avatar, Empty, Spinner, Rating, HelloAnimation
├── composables/                 # useApi, useFormat, useSubjects, useChartTheme, useR2
├── layouts/                     # default, auth, dashboard, admin
├── middleware/                  # auth, admin
├── pages/                       # 27 trang
├── server/
│   ├── api/                     # 40 routes
│   └── utils/                   # auth, helpers, seed, driver, r2
├── stores/                      # auth (useRequestFetch SSR), ui
└── types/index.ts
```

## Chưa hoàn thiện / bước tiếp theo

1. **Upload file thật** — form `/dashboard/tai-lieu` hiện chỉ tạo metadata; cần multipart upload lên R2 và sinh preview PDF
2. **Bảng dashboard/admin chi tiết hơn** — một số trang dùng bảng generic 3-5 cột, nên tách cột riêng theo từng loại dữ liệu (đơn hàng, khiếu nại, bài viết)
3. **Filter tabs trên admin** — biến `filter` đã có nhưng chưa render tab UI (đang lọc qua search)
4. **Modal CRUD** — thêm/sửa danh mục và bài viết qua Radix Dialog (API đã sẵn sàng)
5. **Google OAuth thật** — hiện fallback tạo user demo khi chưa có client ID
6. **Email thật** — `forgot` trả `dev_link` thay vì gửi mail (cần Resend/SendGrid)
7. **Realtime notification** — hiện fetch theo request, có thể chuyển sang polling/SSE

## Deployment

- **Platform**: chạy local qua PM2 (không deploy production theo yêu cầu)
- **Status**: ✅ Active trên port 3000
- **Preset**: `node-server` (Nitro). Muốn deploy Cloudflare: đặt `NITRO_PRESET=cloudflare-pages`
- **Last Updated**: 2026-08-27

## Cộng đồng MapDocs (V3)

### Trang
- `/community` — chat 2 cột: sidebar 320px (tìm thành viên, Tin nhắn chung / Tin nhắn riêng, tạo nhóm, switch nhận tin nhắn riêng, drawer mobile), main panel (header, message list, composer Enter/Shift+Enter), polling 5s
- `/community/leaderboard` — podium top 3 vàng/bạc/đồng, danh sách hạng 4+, filter Tất cả/Tuần/Tháng/Mọi thời gian, sort Theo dõi/Nổi tiếng/Người mới
- `/profile/[id]` — cover gradient cyan, avatar DiceBear, verified, followers/following/popularity, Follow + Nhắn tin + dropdown, 4 tab Giới thiệu/Người theo dõi/Đang theo dõi/Bài viết

### API (12 endpoints)
| Method | Path |
|---|---|
| GET | `/api/community/leaderboard?period=&sort=&page=&limit=&q=` |
| GET | `/api/community/users/search?q=&limit=` (max 20) |
| GET | `/api/community/users/[id]` |
| GET | `/api/community/users/[id]/posts` |
| POST | `/api/community/users/[id]/follow` |
| DELETE | `/api/community/users/[id]/follow` |
| GET | `/api/community/conversations` |
| POST | `/api/community/conversations` |
| GET | `/api/community/conversations/[id]` |
| GET | `/api/community/conversations/[id]/messages` |
| POST | `/api/community/conversations/[id]/messages` (max 2000 ký tự) |
| POST | `/api/community/conversations/[id]/read` |

### Bảo mật
- Không trả về email, password, password_hash, salt, token, bank, balance
- GET leaderboard / search / profile công khai; follow, gửi tin nhắn yêu cầu đăng nhập
- Không tự theo dõi chính mình, không trùng follow, followers_count không âm
- Conversation riêng chỉ thành viên xem được (403 với người ngoài)

### Data layer
`server/utils/community.ts` — COMMUNITY_PROFILES (8 user), follow matrix, 5 conversations (2 public + 3 private), 30 seed messages, lưu tại `globalThis.__mapdocs_community`
