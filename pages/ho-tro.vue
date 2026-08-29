<script setup lang="ts">
const { data: s } = await useFetch<{ hotline: string; email: string; address: string; facebook: string }>(
  '/api/settings',
  { default: () => ({ hotline: '1900 6789', email: 'hotro@mapdocs.vn', address: '', facebook: '' }) }
)

const hotline = computed(() => s.value?.hotline || '1900 6789')
const email = computed(() => s.value?.email || 'hotro@mapdocs.vn')
const address = computed(() => s.value?.address || 'Toà nhà MapDocs, Đống Đa, Hà Nội')
const facebook = computed(() => s.value?.facebook || 'https://facebook.com')

const telHref = computed(() => 'tel:' + hotline.value.replace(/\s+/g, ''))

const HOURS = [
  { label: 'Thứ 2 - Thứ 6', value: '8:00 - 22:00', open: true },
  { label: 'Thứ 7', value: '9:00 - 18:00', open: true },
  { label: 'Chủ nhật', value: 'Nghỉ', open: false }
]

useHead({
  title: 'Hỗ trợ MapDocs',
  meta: [{ name: 'description', content: 'Trung tâm hỗ trợ MapDocs: tài khoản, tài liệu, thanh toán và các vấn đề kỹ thuật.' }]
})
</script>

<template>
  <div class="container-x py-8 sm:py-12">
    <nav class="flex items-center gap-1.5 text-[12px] text-muted-foreground">
      <NuxtLink to="/" class="transition-colors hover:text-cmstdev">Trang chủ</NuxtLink>
      <span>/</span>
      <span class="text-foreground/70">Hỗ trợ</span>
    </nav>

    <header class="mt-3 flex items-start gap-3">
      <span class="grid size-11 shrink-0 place-items-center rounded-xl border border-cmstdev/20 bg-cmstdev/10 text-cmstdev">
        <AppIcon name="solar:headphones-round-linear" size="22" />
      </span>
      <div class="min-w-0">
        <h1 class="text-[24px] font-bold tracking-tight text-foreground sm:text-[28px]">Hỗ trợ MapDocs</h1>
        <p class="mt-0.5 text-[13px] text-muted-foreground">
          Quản lý tài khoản, tài liệu, thanh toán và các vấn đề kỹ thuật
        </p>
      </div>
    </header>

    <section
      data-testid="support-hero"
      class="panel-dv relative mt-6 overflow-hidden p-6 sm:p-9"
    >
      <div class="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-cmstdev/12 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-24 -left-20 size-64 rounded-full bg-cmstdev/8 blur-3xl" />

      <div class="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <span class="grid size-20 shrink-0 place-items-center rounded-2xl border border-cmstdev/20 bg-cmstdev/10 text-cmstdev">
          <AppIcon name="solar:headphones-round-linear" size="40" />
        </span>
        <div class="min-w-0">
          <h2 class="text-[22px] font-bold leading-snug text-foreground sm:text-[26px]">
            Bạn cần hỗ trợ?
            <span class="text-cmstdev">Chúng tôi luôn sẵn sàng!</span>
          </h2>
          <p class="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
            Đội ngũ MapDocs hỗ trợ bạn từ khâu tạo tài khoản, đăng bán tài liệu học tập, xử lý giao dịch
            đến khắc phục sự cố tải file. Chọn kênh liên hệ phù hợp nhất bên dưới.
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            <a :href="telHref" class="btn-cmstdev-solid h-10 px-4 text-[13px] font-bold">
              <AppIcon name="solar:phone-calling-linear" size="16" />
              Gọi {{ hotline }}
            </a>
            <a
              :href="'mailto:' + email"
              class="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border/70 px-4 text-[13px] font-semibold text-muted-foreground transition hover:border-cmstdev/40 hover:text-cmstdev"
            >
              <AppIcon name="solar:letter-linear" size="16" />
              Gửi email
            </a>
          </div>
        </div>
      </div>
    </section>

    <div class="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <article class="support-card">
        <div class="flex items-start justify-between gap-3">
          <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-cmstdev/10 text-cmstdev">
            <AppIcon name="solar:phone-calling-linear" size="20" />
          </span>
          <span class="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400">
            <span class="size-1.5 rounded-full bg-emerald-500" />
            24/7
          </span>
        </div>
        <h3 class="mt-3.5 text-[15px] font-bold text-foreground">Hotline</h3>
        <p class="mt-1 text-[20px] font-bold tabular-nums text-cmstdev">{{ hotline }}</p>
        <p class="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          Tổng đài trực tiếp cho các vấn đề cần xử lý ngay.
        </p>
        <a :href="telHref" class="btn-cmstdev mt-4 h-9 w-full text-[12.5px] font-semibold">
          <AppIcon name="solar:phone-linear" size="15" />
          Gọi ngay
        </a>
      </article>

      <article class="support-card">
        <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-cmstdev/10 text-cmstdev">
          <AppIcon name="solar:clock-circle-linear" size="20" />
        </span>
        <h3 class="mt-3.5 text-[15px] font-bold text-foreground">Giờ làm việc</h3>
        <ul class="mt-3 divide-y divide-border/60">
          <li v-for="h in HOURS" :key="h.label" class="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
            <span class="text-[12.5px] text-muted-foreground">{{ h.label }}</span>
            <span
              class="text-[12.5px] font-semibold tabular-nums"
              :class="h.open ? 'text-foreground' : 'text-red-500 dark:text-red-400'"
            >{{ h.value }}</span>
          </li>
        </ul>
      </article>

      <article class="support-card">
        <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-cmstdev/10 text-cmstdev">
          <AppIcon name="solar:map-point-linear" size="20" />
        </span>
        <h3 class="mt-3.5 text-[15px] font-bold text-foreground">Địa chỉ</h3>
        <p class="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">{{ address }}</p>
        <p class="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
          <AppIcon name="solar:info-circle-linear" size="14" class="text-cmstdev" />
          Vui lòng hẹn trước khi đến trực tiếp.
        </p>
      </article>

      <article class="support-card">
        <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-cmstdev/10 text-cmstdev">
          <AppIcon name="solar:letter-linear" size="20" />
        </span>
        <h3 class="mt-3.5 text-[15px] font-bold text-foreground">Email hỗ trợ</h3>
        <p class="mt-1 break-all text-[13.5px] font-semibold text-cmstdev">{{ email }}</p>
        <p class="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          Phản hồi trong vòng 24 giờ làm việc.
        </p>
        <a
          :href="'mailto:' + email"
          class="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-border/70 text-[12.5px] font-semibold text-muted-foreground transition hover:border-cmstdev/40 hover:text-cmstdev"
        >
          <AppIcon name="solar:letter-linear" size="15" />
          Soạn email
        </a>
      </article>

      <article class="support-card">
        <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-cmstdev/10 text-cmstdev">
          <AppIcon name="solar:document-text-linear" size="20" />
        </span>
        <h3 class="mt-3.5 text-[15px] font-bold text-foreground">Blog hướng dẫn</h3>
        <p class="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
          Bài viết chi tiết về cách đăng bán, mua và tải tài liệu học tập trên MapDocs.
        </p>
        <NuxtLink
          to="/blog"
          class="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-border/70 text-[12.5px] font-semibold text-muted-foreground transition hover:border-cmstdev/40 hover:text-cmstdev"
        >
          <AppIcon name="solar:notes-linear" size="15" />
          Xem hướng dẫn
        </NuxtLink>
      </article>

      <article class="support-card">
        <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-cmstdev/10 text-cmstdev">
          <AppIcon name="solar:flag-linear" size="20" />
        </span>
        <h3 class="mt-3.5 text-[15px] font-bold text-foreground">Báo cáo tài liệu</h3>
        <p class="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
          Phát hiện tài liệu sai nội dung hoặc vi phạm bản quyền? Gửi báo cáo ngay trong trang tài liệu.
        </p>
        <NuxtLink
          to="/tai-lieu"
          class="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-border/70 text-[12.5px] font-semibold text-muted-foreground transition hover:border-cmstdev/40 hover:text-cmstdev"
        >
          <AppIcon name="solar:book-2-linear" size="15" />
          Tới thư viện
        </NuxtLink>
      </article>
    </div>

    <section class="support-card mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-start gap-3">
        <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-cmstdev/10 text-cmstdev">
          <AppIcon name="solar:chat-round-line-linear" size="20" />
        </span>
        <div>
          <h3 class="text-[15px] font-bold text-foreground">Kênh mạng xã hội</h3>
          <p class="mt-1 text-[12.5px] text-muted-foreground">
            Theo dõi MapDocs để nhận thông báo tài liệu mới và ưu đãi nạp ví.
          </p>
        </div>
      </div>
      <a
        :href="facebook"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-cmstdev h-9 shrink-0 px-4 text-[12.5px] font-semibold"
      >
        <AppIcon name="simple-icons:facebook" size="15" />
        Facebook MapDocs
      </a>
    </section>
  </div>
</template>
