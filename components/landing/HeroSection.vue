<script setup lang="ts">
const props = defineProps<{ stats?: Record<string, any> | null }>()

const { compact } = useFormat()

const CARDS = [
  { icon: 'solar:shield-keyhole-bold-duotone', title: 'Bảo mật', desc: 'Tài liệu và giao dịch được mã hoá, chống sao chép trái phép.' },
  { icon: 'solar:bolt-circle-bold-duotone', title: 'Tốc độ', desc: 'Tải tài liệu tức thì với hạ tầng phân phối tối ưu.' },
  { icon: 'solar:database-bold-duotone', title: 'Hạ tầng', desc: 'Kho lưu trữ mở rộng, sao lưu tự động mỗi ngày.' },
  { icon: 'solar:headphones-round-sound-bold-duotone', title: 'Hỗ trợ', desc: 'Đội ngũ đồng hành phản hồi nhanh mỗi ngày làm việc.' }
]

const CHIPS = computed(() => [
  { label: 'Tài liệu', value: compact(Number(props.stats?.documents || 0)) },
  { label: 'Thành viên', value: compact(Number(props.stats?.users || 0)) },
  { label: 'Lượt tải', value: compact(Number(props.stats?.downloads || 0)) },
  { label: 'Miễn phí', value: compact(Number(props.stats?.free_documents || 0)) }
])

const FLOAT_ROWS = [
  { icon: 'solar:notebook-bold-duotone', name: 'Đề cương Toán 12', meta: 'PDF · 48 trang', w: '86%' },
  { icon: 'solar:documents-bold-duotone', name: 'Ngữ pháp Tiếng Anh', meta: 'DOCX · 32 trang', w: '64%' },
  { icon: 'solar:diploma-bold-duotone', name: 'Đề thi thử Vật lý', meta: 'PDF · 12 trang', w: '92%' }
]
</script>

<template>
  <section class="hero-v3 relative overflow-hidden">
    <SvgGrid :cell="54" :opacity="0.5" fade />

    <ClientOnly>
      <LandingBlockchainCanvas :density="66" :speed="0.13" />
    </ClientOnly>

    <SvgBlob :size="500" from="#38bdf8" to="#22d3ee" :opacity="0.18" class="-left-32 -top-28" />
    <SvgBlob :size="420" from="#0ea5e9" to="#0369a1" :opacity="0.15" :delay="1.4" class="-right-24 top-20" />

    <div class="container-x relative z-[2] pb-20 pt-14 sm:pt-20 lg:pb-28 lg:pt-24">
      <div class="mx-auto max-w-[860px] text-center">
        <div v-motion :initial="{ opacity: 0, y: 14 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">
          <span class="hero-badge">
            <AppIcon name="solar:verified-check-bold" size="14" class="text-cmstdev-500" />
            MapDocs V3 · Nền tảng tài liệu học tập
          </span>
        </div>

        <h1
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 90 } }"
          class="mt-6 font-ui text-[34px] font-extrabold leading-[1.14] tracking-tight text-foreground sm:text-[48px] lg:text-[58px]"
        >
          Kho tài liệu học tập
          <span class="block text-gradient-brand">chất lượng toàn diện.</span>
        </h1>

        <p
          v-motion
          :initial="{ opacity: 0, y: 16 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 180 } }"
          class="mx-auto mt-5 max-w-[640px] text-[14.5px] leading-relaxed text-foreground/60 sm:text-[16px]"
        >
          Chia sẻ, mua bán tài liệu học tập với hệ thống quản lý chuyên nghiệp, an toàn và hoàn toàn tự động.
        </p>

        <div
          v-motion
          :initial="{ opacity: 0, y: 16 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 260 } }"
          class="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <UiGradientBorder radius="13px" :inset="false">
            <NuxtLink to="/tai-lieu" class="btn-brand">
              Khám phá ngay
              <AppIcon name="solar:arrow-right-bold" size="16" />
            </NuxtLink>
          </UiGradientBorder>

          <NuxtLink to="/dashboard/tai-lieu" class="btn-brand-outline">
            <AppIcon name="solar:cloud-upload-bold-duotone" size="17" />
            Đăng bán tài liệu
          </NuxtLink>
        </div>

        <div
          v-motion
          :initial="{ opacity: 0, y: 14 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 340 } }"
          class="mt-10 flex flex-wrap items-center justify-center gap-2.5"
        >
          <span v-for="c in CHIPS" :key="c.label" class="stat-chip">
            <b>{{ c.value }}</b>
            <span>{{ c.label }}</span>
          </span>
        </div>
      </div>

      <div class="mt-14 grid gap-8 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_352px] lg:items-start">
        <div class="grid gap-4 sm:grid-cols-2">
          <article
            v-for="(c, i) in CARDS"
            :key="c.title"
            v-motion
            :initial="{ opacity: 0, y: 26 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 520, delay: 80 + i * 90 } }"
            class="hero-card"
          >
            <span class="hero-card-ic">
              <AppIcon :name="c.icon" size="22" />
            </span>
            <h3 class="mt-4 font-ui text-[15.5px] font-bold text-foreground">{{ c.title }}</h3>
            <p class="mt-1.5 text-[13px] leading-relaxed text-foreground/58">{{ c.desc }}</p>
          </article>
        </div>

        <aside
          v-motion
          :initial="{ opacity: 0, y: 34 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 620, delay: 200 } }"
          class="mx-auto w-full max-w-[352px] animate-float"
          aria-label="Minh hoạ bảng điều khiển MapDocs"
        >
          <UiGradientBorder radius="18px">
            <div class="float-card p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="grid h-8 w-8 place-items-center rounded-lg bg-cmstdev-500/12 text-cmstdev-500">
                    <AppIcon name="solar:widget-5-bold-duotone" size="17" />
                  </span>
                  <div>
                    <p class="font-ui text-[12.5px] font-bold text-foreground">Kho của tôi</p>
                    <p class="text-[10.5px] text-foreground/45">Cập nhật hôm nay</p>
                  </div>
                </div>
                <span class="rounded-md bg-emerald-500/12 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Đã duyệt
                </span>
              </div>

              <div class="mt-3.5 space-y-2">
                <div v-for="r in FLOAT_ROWS" :key="r.name" class="float-row">
                  <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cmstdev-500/10 text-cmstdev-500">
                    <AppIcon :name="r.icon" size="16" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-[12px] font-semibold text-foreground">{{ r.name }}</p>
                    <p class="text-[10.5px] text-foreground/45">{{ r.meta }}</p>
                    <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-foreground/10">
                      <div class="float-bar !h-1.5" :style="{ width: r.w }" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-3.5 flex items-center justify-between rounded-xl bg-cmstdev-500/8 px-3 py-2.5">
                <div>
                  <p class="text-[10.5px] font-semibold uppercase tracking-wide text-foreground/50">Doanh thu tháng</p>
                  <p class="font-ui text-[16px] font-extrabold tabular-nums text-foreground">4.850.000 đ</p>
                </div>
                <AppIcon name="solar:graph-up-bold-duotone" size="26" class="text-cmstdev-500" />
              </div>
            </div>
          </UiGradientBorder>
        </aside>
      </div>
    </div>

    <SvgWave tone="background" :height="70" />
  </section>
</template>
