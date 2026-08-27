<script setup lang="ts">
definePageMeta({ layout: false })
const route = useRoute(); const router = useRouter()
const name = computed(() => String(route.query.name || ''))
async function go() {
  if (import.meta.client) localStorage.setItem('mapdocs:isFirstRegister', 'done')
  await router.push('/dashboard')
}
useHead({ title: 'Chào mừng đến MapDocs' })
</script>
<template>
  <div class="mdk min-h-screen relative overflow-hidden grid place-items-center px-5">
    <div class="absolute inset-0" style="background: linear-gradient(160deg, #18181b 0%, #0f172a 55%, #09090b 100%)" />
    <div class="absolute -top-32 left-[15%] w-[480px] h-[480px] rounded-full bg-primary-600/18 blur-[130px] animate-glow-pulse" />
    <div class="absolute bottom-0 right-[10%] w-[400px] h-[400px] rounded-full bg-emerald-500/14 blur-[130px] animate-glow-pulse" style="animation-delay:2s" />
    <div class="relative text-center">
      <UiHelloAnimation :name="name" />
      <p class="mt-4 text-[14.5px] text-zinc-400 max-w-[420px] mx-auto leading-relaxed opacity-0" style="animation: helloFill .7s ease 2.5s forwards">
        Tài khoản của bạn đã được tạo thành công. Hơn 25.000 tài liệu học tập đang chờ bạn khám phá.
      </p>
      <button class="mt-8 inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-white text-[14.5px] font-bold text-zinc-900 hover:bg-zinc-200 transition opacity-0" style="animation: helloFill .7s ease 2.8s forwards" @click="go()">
        Khám phá ngay <AppIcon name="solar:arrow-right-linear" size="18" />
      </button>
    </div>
  </div>
</template>
