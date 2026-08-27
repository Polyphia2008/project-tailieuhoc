<script setup lang="ts">
const { data: stats } = await useFetch<any>('/api/stats')
const { data: docs } = await useFetch<any>('/api/documents', { query: { limit: 6, sort: 'sold' } })
const { subjects } = useSubjects()

useHead({ title: 'MapDocs - Kho tài liệu học tập chất lượng cao' })
</script>

<template>
  <div>
    <LandingHeroSection :stats="stats" />

    <section class="bg-[#09090b] border-t border-mdk-line py-8">
      <div class="container-x">
        <p class="text-center text-[11.5px] font-semibold text-zinc-600 uppercase tracking-wider">
          Được sử dụng tại hơn 200 trường THPT trên toàn quốc
        </p>
        <div class="mt-5 flex flex-wrap items-center justify-center gap-x-9 gap-y-3 opacity-30">
          <span v-for="n in ['THPT Chu Văn An', 'THPT Lê Hồng Phong', 'THPT Nguyễn Huệ', 'THPT Trần Phú', 'THPT Amsterdam']" :key="n" class="text-[13px] font-bold text-white font-ui">
            {{ n }}
          </span>
        </div>
      </div>
    </section>

    <LandingFeaturesGrid />

    <section class="bg-slate-50 pb-16 lg:pb-20">
      <div class="container-x">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="text-[12px] font-bold text-primary-600 uppercase tracking-wider">Bán chạy nhất</p>
            <h2 class="mt-2.5 text-[28px] sm:text-[34px] font-extrabold text-slate-900 font-ui tracking-tight">Tài liệu nổi bật</h2>
          </div>
          <NuxtLink to="/tai-lieu" class="btn-outline">
            Xem tất cả <AppIcon name="solar:arrow-right-linear" size="16" />
          </NuxtLink>
        </div>

        <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DocumentDocCard v-for="(d, i) in docs?.items || []" :key="d.id" :doc="d" :index="i" />
        </div>

        <div class="mt-10 flex flex-wrap gap-2.5">
          <NuxtLink
            v-for="s in subjects"
            :key="s.key"
            :to="`/tai-lieu?subject=${s.key}`"
            class="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white border border-slate-200 text-[13px] font-medium text-slate-600 hover:border-slate-300 hover:shadow-card transition"
          >
            <AppIcon :name="s.icon" size="16" :style="{ color: s.from }" />
            {{ s.name }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <LandingTestimonials />

    <section class="relative overflow-hidden py-16 lg:py-20" style="background: linear-gradient(120deg, #1d4ed8 0%, #2563eb 45%, #ea580c 100%)">
      <div
        class="absolute inset-0 opacity-[.09]"
        style="background-image: radial-gradient(circle at 22% 30%, #fff 1.6px, transparent 1.8px); background-size: 22px 22px"
      />
      <div class="container-x relative text-center">
        <h2 class="text-[30px] sm:text-[42px] font-extrabold text-white font-ui tracking-tight leading-tight">
          Bạn có tài liệu hay?
        </h2>
        <p class="mt-4 text-[15.5px] sm:text-[17px] text-white/85 max-w-[560px] mx-auto leading-relaxed">
          Đăng bán ngay hôm nay và nhận 85% doanh thu từ mỗi lượt mua. Không phí đăng tải, không giới hạn số lượng.
        </p>
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <NuxtLink to="/dashboard/tai-lieu" class="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-white text-[14.5px] font-bold text-primary-700 hover:bg-slate-100 transition shadow-lg">
            <AppIcon name="solar:cloud-upload-bold" size="18" /> Đăng bán tài liệu
          </NuxtLink>
          <NuxtLink to="/blog/huong-dan-dang-ban-tai-lieu-tren-mapdocs" class="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white/[.14] border border-white/25 text-[14.5px] font-semibold text-white hover:bg-white/25 transition">
            Xem hướng dẫn
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
