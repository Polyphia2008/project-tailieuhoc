<script setup lang="ts">
defineProps<{ stats?: Record<string, number> }>()

const { compact } = useFormat()
</script>

<template>
  <section class="relative overflow-hidden bg-[#09090b]">
    <div
      class="absolute inset-0 opacity-[.045]"
      style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 56px 56px; mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 55%, transparent 100%)"
    />
    <div class="absolute -top-32 left-[8%] w-[520px] h-[520px] rounded-full bg-primary-600/18 blur-[130px] animate-glow-pulse" />
    <div class="absolute -top-20 right-[4%] w-[440px] h-[440px] rounded-full bg-accent-500/14 blur-[130px] animate-glow-pulse" style="animation-delay: 2.4s" />

    <div class="container-x relative pt-16 pb-20 lg:pt-24 lg:pb-28">
      <div class="grid lg:grid-cols-[minmax(0,1fr)_400px] gap-14 items-center">
        <div>
          <div
            class="inline-flex items-center gap-2 h-8 pl-1 pr-3.5 rounded-full bg-white/[.06] border border-white/[.1] text-[12px] text-zinc-300"
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 420 } }"
          >
            <span class="pill bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5">MỚI</span>
            Hơn {{ compact(stats?.documents || 26) }} tài liệu đã được kiểm duyệt
          </div>

          <h1
            class="mt-6 text-[38px] sm:text-[52px] lg:text-[62px] leading-[1.05] font-extrabold text-white font-ui tracking-[-.03em]"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 80, duration: 520 } }"
          >
            Kho tài liệu học tập
            <span class="block bg-gradient-to-r from-primary-400 via-primary-300 to-accent-400 bg-clip-text text-transparent">
              chất lượng cao
            </span>
          </h1>

          <p
            class="mt-5 text-[15.5px] sm:text-[17px] text-zinc-400 leading-relaxed max-w-[560px]"
            v-motion
            :initial="{ opacity: 0, y: 16 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 170, duration: 480 } }"
          >
            Đề thi, chuyên đề và bài giảng đầy đủ 8 môn học — miễn phí hoặc trả phí, do chính giáo viên và học sinh biên soạn.
          </p>

          <div
            class="mt-8 flex flex-wrap items-center gap-3"
            v-motion
            :initial="{ opacity: 0, y: 16 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 250, duration: 460 } }"
          >
            <NuxtLink
              to="/tai-lieu"
              class="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-primary-600 text-white text-[14.5px] font-semibold hover:bg-primary-500 transition-all hover:shadow-[0_8px_28px_-6px_rgba(59,130,246,.55)]"
            >
              Khám phá ngay
              <AppIcon name="solar:arrow-right-linear" size="17" />
            </NuxtLink>
            <NuxtLink
              to="/dashboard/tai-lieu"
              class="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white/[.06] border border-white/[.12] text-white text-[14.5px] font-semibold hover:bg-white/[.11] hover:border-white/25 transition"
            >
              <AppIcon name="solar:cloud-upload-linear" size="17" />
              Đăng bán tài liệu
            </NuxtLink>
          </div>

          <div
            class="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1, transition: { delay: 380, duration: 520 } }"
          >
            <div>
              <p class="text-[24px] font-bold text-white font-ui tabular-nums leading-none">{{ compact(stats?.documents || 0) }}+</p>
              <p class="mt-1 text-[12px] text-zinc-500">Tài liệu</p>
            </div>
            <div class="w-px h-9 bg-white/10" />
            <div>
              <p class="text-[24px] font-bold text-white font-ui tabular-nums leading-none">{{ compact(stats?.downloads || 0) }}</p>
              <p class="mt-1 text-[12px] text-zinc-500">Lượt tải</p>
            </div>
            <div class="w-px h-9 bg-white/10" />
            <div>
              <p class="text-[24px] font-bold text-white font-ui tabular-nums leading-none">{{ stats?.free_documents || 0 }}</p>
              <p class="mt-1 text-[12px] text-zinc-500">Miễn phí</p>
            </div>
            <div class="w-px h-9 bg-white/10" />
            <div>
              <p class="text-[24px] font-bold text-white font-ui tabular-nums leading-none">85%</p>
              <p class="mt-1 text-[12px] text-zinc-500">Cho người bán</p>
            </div>
          </div>
        </div>

        <div
          class="relative hidden lg:block"
          v-motion
          :initial="{ opacity: 0, y: 30, scale: 0.96 }"
          :enter="{ opacity: 1, y: 0, scale: 1, transition: { delay: 300, duration: 620 } }"
        >
          <div class="absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary-500/12 to-accent-500/12 blur-2xl" />

          <div class="relative rounded-2xl border border-white/[.1] bg-mdk-panel overflow-hidden shadow-2xl animate-float">
            <div class="relative h-[150px]" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8)">
              <div
                class="absolute inset-0 opacity-[.18]"
                style="background-image: radial-gradient(circle at 20% 25%, #fff 1.5px, transparent 1.7px); background-size: 16px 16px"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div class="absolute top-3 left-3 flex gap-1.5">
                <span class="pill bg-white/22 text-white text-[10.5px] font-semibold backdrop-blur-sm">Toán học</span>
                <span class="pill bg-black/30 text-white/95 text-[10.5px] backdrop-blur-sm">Lớp 12</span>
              </div>
              <span class="absolute top-3 right-3 pill bg-amber-400 text-amber-950 text-[10.5px] font-bold">
                <AppIcon name="solar:crown-bold" size="11" /> NỔI BẬT
              </span>
              <AppIcon name="solar:file-text-bold-duotone" size="54" class="absolute -bottom-2 right-2 text-white/25" />
              <div class="absolute bottom-2.5 left-3 flex items-center gap-3 text-[11.5px] text-white/90 font-medium">
                <span class="inline-flex items-center gap-1"><AppIcon name="solar:eye-linear" size="12" /> 15.4K</span>
                <span class="inline-flex items-center gap-1"><AppIcon name="solar:file-text-linear" size="12" /> 420 tr</span>
              </div>
            </div>
            <div class="p-4">
              <p class="text-[14px] font-semibold text-white leading-snug font-ui">
                Bộ 50 đề thi thử THPT Quốc gia môn Toán 2025 có lời giải chi tiết
              </p>
              <div class="mt-2.5 flex items-center gap-2">
                <UiRating :value="4.9" :size="13" />
                <span class="text-[11.5px] text-zinc-500">128 đánh giá</span>
              </div>
              <div class="mt-3.5 pt-3.5 border-t border-mdk-line flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UiAvatar name="Nguyễn Minh Hoàng" :size="24" />
                  <span class="text-[12px] text-zinc-400">Nguyễn Minh Hoàng</span>
                </div>
                <span class="text-[15px] font-bold text-primary-300 font-ui">149.000đ</span>
              </div>
            </div>
          </div>

          <div
            class="absolute -left-8 -bottom-7 w-[186px] rounded-xl border border-white/[.1] bg-mdk-panel p-3.5 shadow-2xl"
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 620, duration: 500 } }"
          >
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-lg grid place-items-center bg-emerald-500/16 text-emerald-400">
                <AppIcon name="solar:hand-money-bold-duotone" size="17" />
              </span>
              <div>
                <p class="text-[10.5px] text-zinc-500 uppercase tracking-wide font-semibold">Bạn nhận</p>
                <p class="text-[15px] font-bold text-white font-ui tabular-nums">126.650đ</p>
              </div>
            </div>
            <div class="mt-2.5 h-1.5 rounded-full bg-mdk-line overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" style="width: 85%" />
            </div>
            <p class="mt-1.5 text-[10.5px] text-zinc-500">85% giá bán, hoa hồng 15%</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
