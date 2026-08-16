<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const MAP: Record<number, { icon: string; title: string; desc: string; color: string }> = {
  400: { icon: 'fa-circle-exclamation', title: 'Yêu cầu không hợp lệ', desc: 'Dữ liệu gửi lên không đúng định dạng. Vui lòng thử lại.', color: '#ff8412' },
  401: { icon: 'fa-lock', title: 'Chưa đăng nhập', desc: 'Bạn cần đăng nhập để truy cập nội dung này.', color: '#0b4a8f' },
  403: { icon: 'fa-ban', title: 'Không có quyền truy cập', desc: 'Tài khoản của bạn không được phép xem trang này.', color: '#dc2626' },
  404: { icon: 'fa-map-location-dot', title: 'Không tìm thấy trang', desc: 'Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển.', color: '#0b4a8f' },
  500: { icon: 'fa-triangle-exclamation', title: 'Lỗi máy chủ', desc: 'Đã có sự cố xảy ra ở phía chúng tôi. Vui lòng thử lại sau ít phút.', color: '#dc2626' }
}

const code = computed(() => Number(props.error?.statusCode) || 500)
const info = computed(() => MAP[code.value] || MAP[500])

const QUICK = [
  { to: '/tai-lieu', icon: 'fa-book-open', label: 'Thư viện tài liệu' },
  { to: '/blog', icon: 'fa-newspaper', label: 'Tin tức & Blog' },
  { to: '/dashboard', icon: 'fa-gauge-high', label: 'Bảng điều khiển' },
  { to: '/auth/dang-nhap', icon: 'fa-right-to-bracket', label: 'Đăng nhập' }
]

const handleError = () => clearError({ redirect: '/' })
const goBack = () => {
  if (import.meta.client && window.history.length > 1) window.history.back()
  else handleError()
}

useHead({ title: `${code.value} — ${info.value.title} | MapDocs` })
</script>

<template>
  <div class="err-wrap">
    <div class="err-card">
      <a href="/" class="err-logo">
        <span class="err-logo-mark">M</span>
        <span class="err-logo-text">MapDocs</span>
      </a>

      <div class="err-icon" :style="{ background: info.color + '18', color: info.color }">
        <i class="fa-solid" :class="info.icon"></i>
      </div>

      <div class="err-code" :style="{ color: info.color }">{{ code }}</div>
      <h1 class="err-title">{{ info.title }}</h1>
      <p class="err-desc">{{ info.desc }}</p>

      <p v-if="error?.message && code >= 500" class="err-detail">{{ error.message }}</p>

      <div class="err-actions">
        <button class="err-btn err-btn-primary" @click="handleError">
          <i class="fa-solid fa-house mr-2"></i> Về trang chủ
        </button>
        <button class="err-btn err-btn-outline" @click="goBack">
          <i class="fa-solid fa-arrow-left mr-2"></i> Quay lại
        </button>
      </div>

      <div class="err-quick">
        <p class="err-quick-label">Hoặc truy cập nhanh</p>
        <div class="err-quick-grid">
          <a v-for="q in QUICK" :key="q.to" :href="q.to" class="err-quick-item">
            <i class="fa-solid" :class="q.icon"></i>
            <span>{{ q.label }}</span>
          </a>
        </div>
      </div>

      <p class="err-foot">
        Cần hỗ trợ? Liên hệ <a href="mailto:hotro@mapdocs.vn">hotro@mapdocs.vn</a> hoặc hotline <strong>1900 6789</strong>
      </p>
    </div>
  </div>
</template>

<style scoped>
.err-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: linear-gradient(160deg, #f5f8fc 0%, #eaf1f9 60%, #fff5ec 100%);
  font-family: 'Be Vietnam Pro', system-ui, -apple-system, sans-serif;
}
.err-card {
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 20px;
  padding: 40px 28px 28px;
  text-align: center;
  box-shadow: 0 12px 40px rgba(11, 74, 143, .12);
}
.err-logo { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; margin-bottom: 24px; }
.err-logo-mark {
  width: 34px; height: 34px; border-radius: 9px; background: #0b4a8f; color: #fff;
  display: grid; place-items: center; font-weight: 800; font-size: 18px;
}
.err-logo-text { font-weight: 800; font-size: 20px; color: #0b4a8f; letter-spacing: -.3px; }
.err-icon {
  width: 84px; height: 84px; border-radius: 50%; margin: 0 auto 18px;
  display: grid; place-items: center; font-size: 34px;
}
.err-code { font-size: 56px; font-weight: 800; line-height: 1; letter-spacing: -2px; }
.err-title { font-size: 22px; font-weight: 700; color: #111827; margin-top: 10px; }
.err-desc { font-size: 15px; color: #6b7280; margin-top: 8px; line-height: 1.6; }
.err-detail {
  margin-top: 12px; padding: 10px 12px; background: #fef2f2; color: #b91c1c;
  border-radius: 10px; font-size: 13px; word-break: break-word; text-align: left;
}
.err-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 24px; }
.err-btn {
  padding: 11px 22px; border-radius: 11px; font-weight: 600; font-size: 15px;
  cursor: pointer; border: 1px solid transparent; transition: all .18s;
}
.err-btn-primary { background: #0b4a8f; color: #fff; }
.err-btn-primary:hover { background: #0a2d5c; transform: translateY(-1px); }
.err-btn-outline { background: #fff; color: #0b4a8f; border-color: #cfdcea; }
.err-btn-outline:hover { background: #f3f7fb; }
.err-quick { margin-top: 30px; padding-top: 22px; border-top: 1px solid #eef2f6; }
.err-quick-label { font-size: 12px; text-transform: uppercase; letter-spacing: .6px; color: #9ca3af; font-weight: 600; }
.err-quick-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
.err-quick-item {
  display: flex; align-items: center; gap: 9px; padding: 11px 13px;
  border: 1px solid #e6ecf3; border-radius: 11px; text-decoration: none;
  color: #374151; font-size: 14px; font-weight: 500; transition: all .18s;
}
.err-quick-item i { color: #ff8412; width: 16px; text-align: center; }
.err-quick-item:hover { border-color: #0b4a8f; background: #f5f9fd; color: #0b4a8f; }
.err-foot { margin-top: 22px; font-size: 13px; color: #9ca3af; }
.err-foot a { color: #0b4a8f; text-decoration: none; font-weight: 600; }
.mr-2 { margin-right: 6px; }
@media (max-width: 480px) {
  .err-code { font-size: 46px; }
  .err-card { padding: 30px 18px 22px; }
  .err-quick-grid { grid-template-columns: 1fr; }
}
</style>
