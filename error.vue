<script setup lang="ts">
const props = defineProps<{ error: any }>()
const is404 = computed(() => props.error?.statusCode === 404)
useHead({ title: `${props.error?.statusCode || 500} - MapDocs` })
</script>
<template>
  <div class="mdk min-h-screen grid place-items-center px-5 relative overflow-hidden">
    <div class="absolute inset-0" style="background: linear-gradient(160deg, #18181b 0%, #0f172a 60%, #09090b 100%)" />
    <div class="absolute -top-32 left-[20%] w-[420px] h-[420px] rounded-full bg-primary-600/14 blur-[130px] animate-glow-pulse" />
    <div class="relative text-center max-w-[440px]">
      <p class="text-[86px] font-extrabold font-ui leading-none bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
        {{ error?.statusCode || 500 }}
      </p>
      <h1 class="mt-4 text-[22px] font-bold text-white font-ui tracking-tight">
        {{ is404 ? 'Không tìm thấy trang' : 'Đã xảy ra lỗi' }}
      </h1>
      <p class="mt-3 text-[13.5px] text-zinc-500 leading-relaxed">
        {{ error?.statusMessage || (is404 ? 'Trang bạn tìm không tồn tại hoặc đã được di chuyển.' : 'Vui lòng thử lại sau ít phút.') }}
      </p>
      <div class="mt-7 flex flex-wrap items-center justify-center gap-2.5">
        <NuxtLink to="/" class="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white text-[14px] font-semibold text-zinc-900 hover:bg-zinc-200 transition">
          <AppIcon name="solar:home-2-bold" size="17" /> Về trang chủ
        </NuxtLink>
        <NuxtLink to="/tai-lieu" class="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white/[.07] border border-white/[.12] text-[14px] font-semibold text-white hover:bg-white/[.13] transition">
          Thư viện tài liệu
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
