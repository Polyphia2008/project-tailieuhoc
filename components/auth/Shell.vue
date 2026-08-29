<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string
    title: string
    subtitle?: string
  }>(),
  { icon: 'solar:user-plus-bold' }
)

const FEATURES = [
  { icon: 'solar:shield-check-bold', title: 'Bảo mật & An toàn', desc: 'Hệ thống bảo mật đa lớp, an toàn dữ liệu tuyệt đối.' },
  { icon: 'solar:rocket-bold', title: 'Tốc độ nhanh chóng', desc: 'Xử lý giao dịch và kích hoạt tài liệu tự động tức thì.' },
  { icon: 'solar:server-square-bold', title: 'Hạ tầng mạnh mẽ', desc: 'Đảm bảo tính ổn định cao nhất cho mọi dịch vụ.' },
  { icon: 'solar:headphones-round-bold', title: 'Hỗ trợ 24/7', desc: 'Đội ngũ chuyên nghiệp luôn sẵn sàng hỗ trợ bạn.' }
]

const BADGES = ['Thanh toán tự động', 'Bảo mật đa lớp', 'Hỗ trợ tận tâm']
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2 bg-background font-sans">
    <aside class="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#0a0a0a] p-10 xl:p-14">
      <div class="pointer-events-none absolute inset-0">
        <div class="absolute inset-0 bg-gradient-to-br from-cmstdev/25 via-transparent to-cmstdev/5" />
        <div
          class="absolute inset-0 opacity-[0.15]"
          style="background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 0px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 0px); background-size: 40px 40px;"
        />
        <div class="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-cmstdev/20 blur-[130px]" />
        <div class="absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full bg-cmstdev/10 blur-[100px]" />
      </div>

      <div class="relative z-10">
        <NuxtLink to="/" class="flex items-center h-10 w-fit">
          <Logo variant="full" :light="true" />
        </NuxtLink>
      </div>

      <div class="relative z-10 space-y-10 my-8">
        <div v-motion :initial="{ opacity: 0, y: 18 }" :enter="{ opacity: 1, y: 0, transition: { delay: 90 } }">
          <h2 class="text-3xl xl:text-4xl font-extrabold leading-tight text-white">
            Kho tài liệu học tập<br>
            <span class="text-cmstdev drop-shadow-sm">chất lượng toàn diện.</span>
          </h2>
          <p class="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
            Chia sẻ, mua bán tài liệu học tập với hệ thống quản lý chuyên nghiệp, an toàn và hoàn toàn tự động.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="(f, i) in FEATURES"
            :key="f.title"
            v-motion
            :initial="{ opacity: 0, y: 16 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 180 + i * 90 } }"
            class="rounded-xl border border-white/[.08] bg-white/[.03] p-4 transition-colors hover:border-cmstdev/40 hover:bg-white/[.05]"
          >
            <span class="grid size-9 place-items-center rounded-lg bg-cmstdev/15 text-cmstdev border border-cmstdev/20">
              <AppIcon :name="f.icon" size="17" />
            </span>
            <p class="mt-3 text-[13px] font-bold text-white">{{ f.title }}</p>
            <p class="mt-1 text-[11.5px] leading-relaxed text-zinc-500">{{ f.desc }}</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span v-for="b in BADGES" :key="b" class="inline-flex items-center gap-1.5 text-[12px] text-zinc-400">
            <AppIcon name="solar:check-circle-bold" size="14" class="text-cmstdev" />
            {{ b }}
          </span>
        </div>
      </div>

      <div class="relative z-10 border-l-2 border-cmstdev/40 pl-4">
        <p class="text-sm italic text-zinc-400">
          "Hệ thống tự động hóa hoàn toàn, mang đến trải nghiệm tốt nhất cho người dùng."
        </p>
      </div>
    </aside>

    <main class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 md:p-10">
      <svg
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 h-full w-full fill-cmstdev/5 stroke-cmstdev/10 [mask-image:radial-gradient(500px_circle_at_center,white,transparent)]"
      >
        <pattern id="grid-pattern" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M.5 50V.5H50" fill="none" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>
      <div class="pointer-events-none absolute inset-0 z-0">
        <div class="absolute left-1/2 top-1/2 hidden md:block h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cmstdev/5 blur-[120px]" />
      </div>

      <div class="relative z-10 mb-8 flex w-full max-w-md justify-center lg:hidden">
        <NuxtLink to="/"><Logo variant="full" /></NuxtLink>
      </div>

      <div class="relative z-10 w-full max-w-md">
        <div class="w-full px-1 sm:px-2">
          <div class="flex flex-col items-center mb-7 text-center">
            <div class="relative mb-4 flex size-14 items-center justify-center rounded-2xl bg-cmstdev/10 text-cmstdev border border-cmstdev/20">
              <AppIcon :name="icon" size="26" />
              <span class="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-cmstdev text-white">
                <AppIcon name="solar:check-circle-bold" size="12" />
              </span>
            </div>
            <h1 class="text-2xl font-black tracking-tight text-foreground">{{ title }}</h1>
            <p v-if="subtitle" class="text-[13px] text-muted-foreground mt-1.5">{{ subtitle }}</p>
            <slot name="head" />
          </div>

          <slot />
        </div>

        <p class="mt-8 text-center text-xs text-muted-foreground/80">
          Tiếp tục đồng nghĩa với việc bạn chấp nhận
          <NuxtLink to="/dieu-khoan" class="text-cmstdev hover:underline">Điều khoản</NuxtLink>
          và
          <NuxtLink to="/bao-mat" class="text-cmstdev hover:underline">Chính sách bảo mật</NuxtLink>.
        </p>
      </div>
    </main>
  </div>
</template>
