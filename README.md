# MapDocs — Nền tảng chia sẻ & mua bán tài liệu học tập

MapDocs là nền tảng cho phép học sinh, sinh viên và giáo viên **chia sẻ, mua bán và tải về tài liệu học tập** một cách nhanh chóng, an toàn. Người bán đăng tài liệu lên hệ thống, được kiểm duyệt trước khi hiển thị công khai, và nhận **85% doanh thu** cho mỗi lượt bán (nền tảng giữ 15% hoa hồng).

Toàn bộ hệ thống được xây dựng trên **Nuxt 3** với kiến trúc full-stack: giao diện Vue 3 + Tailwind CSS ở phía client, API server-side bằng Nitro, dữ liệu lưu trên **Supabase (PostgreSQL)**. Hệ thống có sẵn **Mock Database in-memory**, nên bạn có thể chạy demo đầy đủ ngay mà **không cần cấu hình Supabase**.

---

## ✨ Tính năng chính

### 👤 Tài khoản & xác thực
- Đăng ký / đăng nhập bằng email + mật khẩu (JWT lưu trong httpOnly cookie, hạn 7 ngày)
- Đăng nhập nhanh bằng **Google OAuth**
- Quên mật khẩu / đặt lại mật khẩu
- Ba vai trò: `user` (người mua) — `seller` (người bán) — `admin` (quản trị)
- Trang hồ sơ: đổi thông tin cá nhân, ảnh đại diện, trường học, mật khẩu

### 📚 Thư viện tài liệu
- Lọc theo **môn học** (10 môn), **khối lớp** (1–12), **miễn phí / trả phí**
- Tìm kiếm theo tiêu đề, mô tả, tags
- Sắp xếp: mới nhất, bán chạy, đánh giá cao, giá tăng/giảm
- Phân trang, skeleton loading, đồng bộ bộ lọc lên URL query
- Trang chi tiết: ảnh bìa, mô tả, thông tin file (số trang, dung lượng, định dạng), thông tin người bán, danh sách đánh giá, tài liệu liên quan

### 💰 Bán tài liệu & kiểm duyệt
- Người bán đăng tài liệu: tiêu đề, mô tả, môn, lớp, giá, file, ảnh bìa, tags
- Trạng thái: `pending` → admin duyệt → `approved` / `rejected` (kèm lý do)
- **Hoa hồng 15%** tự động khấu trừ khi có đơn hàng thành công
- Người bán theo dõi tài liệu của mình, lượt xem, lượt bán, doanh thu

### 💳 Ví điện tử & thanh toán
- Nạp tiền vào ví, rút tiền (tối thiểu 200.000₫, admin duyệt)
- Thanh toán bằng **số dư ví** (trừ trực tiếp) hoặc cổng **VNPay / Momo / Stripe**
- Trang cổng thanh toán mô phỏng (`/thanh-toan/gia-lap`) với đếm ngược 10 phút
- Trang kết quả thanh toán (`/thanh-toan/ket-qua`) đọc mã phản hồi chuẩn VNPay
- Lịch sử giao dịch đầy đủ: nạp, rút, mua, thu nhập, hoàn tiền

### ⭐ Tương tác
- Đánh giá tài liệu (1–5 sao + bình luận), chỉ người đã mua mới được đánh giá
- Yêu thích / bỏ yêu thích tài liệu
- Báo cáo (khiếu nại) tài liệu vi phạm, admin xử lý và ghi chú

### 📊 Dashboard người bán
- Tổng quan: doanh thu, số đơn, số tài liệu, biểu đồ **Chart.js**
- Tài liệu đã mua, tài liệu của tôi, đăng bán tài liệu mới
- Trang doanh thu chi tiết, danh sách yêu thích, hồ sơ cá nhân

### 🛡️ Admin panel
- **Tổng quan**: KPI toàn hệ thống, biểu đồ doanh thu
- **Tài liệu**: duyệt / từ chối / gắn nổi bật / xoá
- **Người dùng**: khoá / mở khoá, đổi vai trò
- **Danh mục**: thêm / sửa / xoá môn học
- **Giao dịch**: GMV, hoa hồng, số đơn, lọc theo trạng thái, tìm kiếm
- **Khiếu nại**: xử lý / từ chối kèm mẫu ghi chú sẵn
- **Bài viết**: CRUD blog (tự sinh slug, tags, ảnh bìa, publish)
- **Cài đặt**: tỉ lệ hoa hồng, hạn mức rút/giá tối thiểu, thông tin liên hệ

### 📰 Blog / Tin tức
- Danh sách bài viết có bài nổi bật, tìm kiếm, phân trang
- Trang chi tiết: nội dung HTML định dạng đẹp, tags, chia sẻ Facebook, sao chép link, bài viết liên quan

---

## 🛠 Công nghệ sử dụng

| Lớp | Công nghệ |
|---|---|
| Framework | **Nuxt 3** (SSR + Nitro server) |
| UI | **Vue 3** Composition API, `<script setup lang="ts">` |
| Ngôn ngữ | **TypeScript** |
| CSS | **Tailwind CSS** (màu chủ đạo `#0b4a8f`, nhấn `#ff8412`) |
| State | **Pinia** (`useAuthStore`, `useUiStore`) |
| Database | **Supabase / PostgreSQL** (có Mock DB dự phòng) |
| Biểu đồ | **Chart.js 4** |
| Auth | JWT (`jose`) + Google OAuth |
| Font / Icon | Be Vietnam Pro, Font Awesome 6 |
| Deploy | **Vercel** |

---

## 🚀 Cài đặt nhanh

```bash
git clone https://github.com/Polyphia2008/project-tailieuhoc.git
cd project-tailieuhoc
npm install
npm run dev
```

Mở trình duyệt tại **http://localhost:3000**

> Không cần cấu hình `.env` để chạy demo — hệ thống tự dùng **Mock Database** với đầy đủ dữ liệu mẫu (8 người dùng, 10 môn học, 39 tài liệu, 93 đánh giá, 4 bài blog…).

### Các lệnh khác

```bash
npm run build                        # build production
npm run preview                      # xem thử bản build
npm run seed -- --dry                # kiểm tra dữ liệu mẫu (không ghi DB)
npm run seed                         # đẩy dữ liệu mẫu lên Supabase
npm run seed -- --truncate           # xoá sạch rồi seed lại
```

---

## 🔑 Tài khoản demo

```
Admin:  admin@mapdocs.vn  / 123456
Seller: seller@mapdocs.vn / 123456
User:   user@mapdocs.vn   / 123456
```

---

## ⚙️ Biến môi trường

Sao chép `.env.example` thành `.env` rồi điền thông tin:

```bash
cp .env.example .env
```

| Biến | Mô tả |
|---|---|
| `SUPABASE_URL` | URL project Supabase — **để trống ⇒ dùng Mock DB** |
| `SUPABASE_ANON_KEY` | Khoá public của Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Khoá service role (bắt buộc để seed & ghi dữ liệu) |
| `JWT_SECRET` | Chuỗi bí mật ký JWT — **phải đổi khi lên production** |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Thông tin Google OAuth |
| `VNP_TMN_CODE` / `VNP_HASH_SECRET` / `VNP_URL` | Cấu hình cổng VNPay |
| `COMMISSION_RATE` | Tỉ lệ hoa hồng, mặc định `0.15` |
| `SITE_URL` / `NUXT_PUBLIC_SITE_URL` | Địa chỉ site |
| `NITRO_PRESET` | Preset build, mặc định `node-server` |

### Dùng Supabase thật

1. Tạo project trên [supabase.com](https://supabase.com)
2. Mở **SQL Editor**, chạy toàn bộ file `supabase/schema.sql` (tạo 12 bảng, index, trigger, view, RLS)
3. Điền `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` vào `.env`
4. Chạy `npm run seed` để nạp dữ liệu mẫu

---

## ☁️ Deploy lên Vercel

1. Truy cập [vercel.com/new](https://vercel.com/new) → **Import** repo `project-tailieuhoc`
2. Vercel tự nhận diện Nuxt 3 (đã có sẵn `vercel.json`)
3. Thêm các biến môi trường trong **Settings → Environment Variables**
4. Nhấn **Deploy**

Build command `npm run build` · Output `.output` · Region `sin1` (Singapore)

---

## 📁 Cấu trúc thư mục

```
project-tailieuhoc/
├── assets/css/main.css        # Tailwind + class dùng chung (.btn, .card, .input…)
├── components/
│   ├── ui/                    # Modal, Pagination, Empty, Avatar, Toast…
│   ├── document/              # DocCard, DocFilter, ReviewList…
│   └── layout/                # Header, Footer, Sidebar
├── composables/               # useApi, useFormat, useSubjects
├── layouts/                   # default.vue, admin.vue, auth.vue
├── middleware/                # auth.ts, admin.ts, guest.ts
├── pages/
│   ├── index.vue              # Trang chủ
│   ├── tai-lieu/              # Thư viện + chi tiết tài liệu
│   ├── auth/                  # Đăng nhập, đăng ký, quên mật khẩu
│   ├── dashboard/             # 7 trang người bán
│   ├── admin/                 # 8 trang quản trị
│   ├── blog/                  # Danh sách + chi tiết bài viết
│   └── thanh-toan/            # Cổng giả lập + kết quả thanh toán
├── server/
│   ├── api/                   # Toàn bộ REST API
│   └── utils/                 # driver.ts (Mock/Supabase), seed.ts, auth.ts
├── stores/                    # Pinia: auth.ts, ui.ts
├── supabase/schema.sql        # Schema PostgreSQL đầy đủ
├── scripts/seed-supabase.mjs  # Script nạp dữ liệu mẫu
├── error.vue                  # Trang lỗi 404 / 403 / 500
└── vercel.json                # Cấu hình deploy
```

---

## 🔌 API chính

Tất cả API trả về định dạng `{ success, data, message? }`.

### Xác thực — `/api/auth`
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/logout` | Đăng xuất |
| GET  | `/api/auth/me` | Thông tin phiên hiện tại |
| GET  | `/api/auth/google` | Bắt đầu Google OAuth |
| POST | `/api/auth/forgot` | Quên mật khẩu |

### Tài liệu — `/api/documents`
| Method | Endpoint | Mô tả |
|---|---|---|
| GET  | `/api/documents` | Danh sách (lọc `category`, `grade`, `free`, `q`, `sort`, `page`) |
| GET  | `/api/documents/:slug` | Chi tiết tài liệu |
| POST | `/api/documents` | Đăng tài liệu mới |
| PUT  | `/api/documents/:id` | Cập nhật |
| DELETE | `/api/documents/:id` | Xoá |
| GET  | `/api/categories` | Danh sách môn học |

### Đơn hàng & thanh toán — `/api/orders`
| Method | Endpoint | Mô tả |
|---|---|---|
| GET  | `/api/orders` | Đơn hàng của tôi |
| POST | `/api/orders/checkout` | Tạo đơn (`wallet` trừ ngay, cổng khác trả `redirect`) |
| POST | `/api/orders/confirm` | Xác nhận kết quả `success` / `cancel` |

### Người dùng — `/api/user`
`GET /api/user/profile` · `PUT /api/user/profile` · `GET /api/user/transactions` · `POST /api/user/topup` · `POST /api/user/withdraw` · `GET /api/user/favorites` · `POST /api/user/favorites` · `GET /api/user/notifications`

### Đánh giá & báo cáo
`GET|POST /api/reviews` · `POST /api/reports`

### Blog — `/api/blogs`
`GET /api/blogs` (chỉ bài `published`) · `GET /api/blogs/:slug` (kèm 3 bài liên quan)

### Quản trị — `/api/admin`
`/api/admin/stats` · `/api/admin/documents` · `/api/admin/users` · `/api/admin/categories` · `/api/admin/orders` · `/api/admin/reports` · `/api/admin/blogs` · `/api/admin/settings` · `/api/admin/transactions`

---

## 📄 Giấy phép

Dự án phục vụ mục đích học tập. Dữ liệu mẫu và hình ảnh chỉ mang tính minh hoạ.
