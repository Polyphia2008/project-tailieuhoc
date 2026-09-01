<script setup lang="ts">
const { data: stats } = await useFetch<any>('/api/stats', {
  default: () => ({})
})

const { data: docs } = await useFetch<any>('/api/documents', {
  query: { limit: 6, sort: 'sold' },
  default: () => ({ items: [] })
})

const { data: freeDocs } = await useFetch<any>('/api/documents', {
  query: { limit: 3, free: 'true', sort: 'popular' },
  default: () => ({ items: [] })
})

const { subjects } = useSubjects()
const { compact } = useFormat()

function rowsOf(payload: any): any[] {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.rows)) return payload.rows
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.data?.items)) return payload.data.items
  return []
}

const featured = computed<any[]>(() => rowsOf(docs.value))
const freeList = computed<any[]>(() => rowsOf(freeDocs.value))

const STATS = computed(() => [
  { icon: 'solar:documents-bold-duotone', label: 'Tài liệu đã xuất bản', value: compact(Number(stats.value?.documents || 0)) },
  { icon: 'solar:users-group-rounded-bold-duotone', label: 'Thành viên đang học', value: compact(Number(stats.value?.users || 0)) },
  { icon: 'solar:download-minimalistic-bold-duotone', label: 'Lượt tải tài liệu', value: compact(Number(stats.value?.downloads || 0)) },
  { icon: 'solar:wallet-money-bold-duotone', label: 'Giao dịch thành công', value: compact(Number(stats.value?.orders || 0)) }
])

const STEPS = [
  { n: '01', title: 'Tạo tài khoản', desc: 'Đăng ký miễn phí trong 30 giây chỉ với email của bạn.' },
  { n: '02', title: 'Tìm hoặc đăng tài liệu', desc: 'Lọc theo môn học và lớp, hoặc tải tài liệu của bạn lên kho.' },
  { n: '03', title: 'Học tập & nhận doanh thu', desc: 'Tải tài liệu ngay hoặc theo dõi doanh thu trên dashboard.' }
]

useHead({ title: 'MapDocs - Kho tài liệu học tập chất lượng toàn diện' })
</script>

<template>
  <div class="bg-background">
    <LandingHeroSection :stats="stats" />

    <LandingPartnerLogos />

    <LandingFeaturesGrid />

    <section id="featured-documents" class="bg-muted/40 py-16 lg:py-20">
      <div class="container-x">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="section-eyebrow">Bán chạy nhất</p>
            <h2 class="section-title !mt-2">Tài liệu nổi bật</h2>
          </div>
          <NuxtLink to="/tai-lieu" class="btn-brand-outline !h-10 !text-[13.5px]">
            Xem tất cả
            <AppIcon name="solar:arrow-right-bold" size="15" />
          </NuxtLink>
        </div>

        <div v-if="featured.length" class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DocumentDocCard v-for="(d, i) in featured" :key="d.id" :doc="d" :index="i" />
        </div>
        <p v-else class="mt-8 text-center text-[13.5px] text-foreground/50">Chưa có tài liệu nào được xuất bản.</p>

        <div class="mt-10 flex flex-wrap items-center justify-center gap-2">
          <NuxtLink v-for="s in subjects" :key="s.key" :to="`/tai-lieu?subject=${s.key}`" class="subject-chip">
            <AppIcon :name="s.icon" size="16" />
            {{ s.name }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <section v-if="freeList.length" id="free-documents" class="bg-background py-16 lg:py-20">
      <div class="container-x">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="section-eyebrow">Không mất phí</p>
            <h2 class="section-title !mt-2">Tài liệu miễn phí</h2>
          </div>
          <NuxtLink to="/tai-lieu?free=true" class="btn-brand-outline !h-10 !text-[13.5px]">
            Xem thêm
            <AppIcon name="solar:arrow-right-bold" size="15" />
          </NuxtLink>
        </div>

        <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <UiGradientBorder
            v-for="(d, i) in freeList"
            :key="d.id"
            radius="16px"
            :inset="false"
            :duration="10"
            :intensity=".75"
          >
            <DocumentDocCard :doc="d" :index="i" />
          </UiGradientBorder>
        </div>
      </div>
    </section>

    <section id="platform-stats" class="bg-muted/40 py-16 lg:py-20">
      <div class="container-x">
        <div class="mx-auto max-w-[620px] text-center">
          <p class="section-eyebrow">Con số thực tế</p>
          <h2 class="section-title">MapDocs lớn lên mỗi ngày</h2>
          <p class="section-sub">Cùng cộng đồng học tập đóng góp và lan toả tri thức trên khắp Việt Nam.</p>
        </div>

        <div class="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article
            v-for="(s, i) in STATS"
            :key="s.label"
            v-motion
            :initial="{ opacity: 0, y: 24 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 500, delay: 60 + i * 80 } }"
            class="feature-v3 text-center"
          >
            <span class="hero-card-ic mx-auto">
              <AppIcon :name="s.icon" size="23" />
            </span>
            <p class="mt-4 font-ui text-[30px] font-extrabold tabular-nums tracking-tight text-foreground">{{ s.value }}</p>
            <p class="mt-1 text-[12.5px] text-foreground/55">{{ s.label }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="how-it-works" class="bg-background py-16 lg:py-20">
      <div class="container-x">
        <div class="mx-auto max-w-[620px] text-center">
          <p class="section-eyebrow">Bắt đầu dễ dàng</p>
          <h2 class="section-title">Chỉ ba bước để bắt đầu</h2>
        </div>

        <div class="mt-11 grid gap-4 md:grid-cols-3">
          <article
            v-for="(s, i) in STEPS"
            :key="s.n"
            v-motion
            :initial="{ opacity: 0, y: 26 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 520, delay: 70 + i * 100 } }"
            class="step-v3"
          >
            <span class="step-num font-ui">{{ s.n }}</span>
            <h3 class="mt-4 font-ui text-[16px] font-bold text-foreground">{{ s.title }}</h3>
            <p class="mt-2 text-[13.5px] leading-relaxed text-foreground/58">{{ s.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <LandingTestimonials />

    <section id="seller-cta" class="bg-background pb-16 pt-4 lg:pb-20">
      <div class="container-x">
        <UiGradientBorder radius="24px" :inset="false" variant="accent" :duration="8">
          <div class="cta-band px-6 py-12 text-center sm:px-12 lg:py-14">
            <div class="relative z-[1] mx-auto max-w-[680px]">
              <h2 class="font-ui text-[26px] font-extrabold leading-tight tracking-tight text-white sm:text-[34px]">
                Bạn có tài liệu hay? Hãy chia sẻ và kiếm tiền!
              </h2>
              <p class="mx-auto mt-4 max-w-[520px] text-[14px] leading-relaxed text-white/80">
                Nhận tới 85% doanh thu từ mỗi lượt bán, đối soát tự động và minh bạch ngay trên dashboard của bạn.
              </p>
              <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
                <NuxtLink
                  to="/dashboard/tai-lieu"
                  class="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-6 text-[14px] font-bold text-sky-700 transition hover:bg-white/90"
                >
                  <AppIcon name="solar:cloud-upload-bold-duotone" size="18" />
                  Đăng bán ngay
                </NuxtLink>
                <NuxtLink
                  to="/ho-tro"
                  class="inline-flex h-11 items-center gap-2 rounded-xl border border-white/35 px-6 text-[14px] font-semibold text-white transition hover:bg-white/10"
                >
                  Tìm hiểu thêm
                  <AppIcon name="solar:arrow-right-bold" size="16" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </UiGradientBorder>
      </div>
    </section>
  </div>
</template>
