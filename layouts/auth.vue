<script setup lang="ts">
const { subjects } = useSubjects()

const POINTS = [
  { icon: 'solar:documents-bold-duotone', title: '25.000+ tài liệu', desc: 'Đề thi, chuyên đề, bài giảng đầy đủ 8 môn học' },
  { icon: 'solar:gift-bold-duotone', title: 'Hàng nghìn tài liệu miễn phí', desc: 'Tải về không giới hạn, không cần trả phí' },
  { icon: 'solar:hand-money-bold-duotone', title: 'Nhận 85% doanh thu', desc: 'Đăng bán tài liệu của bạn và kiếm thu nhập' }
]
</script>

<template>
  <div class="mdk min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_520px]">
    <div class="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
      <div class="absolute inset-0" style="background: linear-gradient(140deg, #0c1a3a 0%, #0f172a 45%, #1a0f0a 100%)" />
      <div class="absolute -left-24 -top-24 w-[420px] h-[420px] rounded-full bg-primary-600/22 blur-[110px] animate-glow-pulse" />
      <div class="absolute right-0 bottom-0 w-[380px] h-[380px] rounded-full bg-accent-500/16 blur-[110px] animate-glow-pulse" style="animation-delay: 2s" />
      <div
        class="absolute inset-0 opacity-[.055]"
        style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 52px 52px"
      />

      <NuxtLink to="/" class="relative flex items-center gap-3 group w-fit">
        <span
          class="w-11 h-11 rounded-xl grid place-items-center text-white transition-transform group-hover:scale-105"
          style="background: linear-gradient(135deg, #3b82f6, #f97316)"
        >
          <AppIcon name="solar:book-bookmark-bold" size="23" />
        </span>
        <span>
          <span class="block text-[21px] font-extrabold text-white font-ui tracking-tight leading-tight">MapDocs</span>
          <span class="block text-[12px] text-zinc-400">Kho tài liệu học tập chất lượng cao</span>
        </span>
      </NuxtLink>

      <div class="relative max-w-[460px]">
        <h2 class="text-[34px] leading-[1.15] font-extrabold text-white font-ui tracking-tight">
          Học tập hiệu quả hơn với tài liệu chất lượng
        </h2>
        <p class="mt-4 text-[14.5px] text-zinc-400 leading-relaxed">
          Tham gia cùng hơn 12.000 học sinh và giáo viên đang chia sẻ, mua bán tài liệu học tập trên MapDocs.
        </p>

        <ul class="mt-8 space-y-4">
          <li v-for="(p, i) in POINTS" :key="p.title" class="flex items-start gap-3.5" v-motion :initial="{ opacity: 0, x: -14 }" :enter="{ opacity: 1, x: 0, transition: { delay: 180 + i * 110 } }">
            <span class="shrink-0 w-10 h-10 rounded-xl grid place-items-center bg-white/[.07] border border-white/[.1] text-primary-300">
              <AppIcon :name="p.icon" size="20" />
            </span>
            <span>
              <span class="block text-[14px] font-semibold text-white font-ui">{{ p.title }}</span>
              <span class="block mt-0.5 text-[12.5px] text-zinc-500 leading-relaxed">{{ p.desc }}</span>
            </span>
          </li>
        </ul>
      </div>

      <div class="relative flex flex-wrap gap-2">
        <span
          v-for="s in subjects"
          :key="s.key"
          class="pill text-[11px] font-medium border border-white/[.09] bg-white/[.05]"
          :style="{ color: s.text }"
        >
          {{ s.name }}
        </span>
      </div>
    </div>

    <div class="flex flex-col min-h-screen bg-mdk-bg">
      <div class="lg:hidden flex items-center justify-between px-5 h-[62px] border-b border-mdk-line">
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <span class="w-8 h-8 rounded-lg grid place-items-center text-white" style="background: linear-gradient(135deg, #3b82f6, #f97316)">
            <AppIcon name="solar:book-bookmark-bold" size="17" />
          </span>
          <span class="text-[16px] font-extrabold text-white font-ui tracking-tight">MapDocs</span>
        </NuxtLink>
        <NuxtLink to="/" class="text-[12.5px] text-zinc-500 hover:text-white transition">Về trang chủ</NuxtLink>
      </div>

      <div class="flex-1 flex items-center justify-center px-5 sm:px-10 py-10">
        <div class="w-full max-w-[400px]">
          <slot />
        </div>
      </div>

      <p class="px-5 pb-6 text-center text-[11.5px] text-zinc-600">
        © {{ new Date().getFullYear() }} MapDocs. Bảo mật bởi SSL.
      </p>
    </div>
  </div>
</template>
