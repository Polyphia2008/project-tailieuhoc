<script setup lang="ts">
/**
 * Trang chuc mung sau khi dang ky lan dau (full screen, khong layout).
 * Duoc dieu huong tu /auth/dang-ky khi la lan dang ky dau tien tren thiet bi.
 */
definePageMeta({ layout: false })
useSeoMeta({ title: 'Chào mừng bạn đến với MapDocs', robots: 'noindex' })

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

/** Ten uu tien: user dang dang nhap -> query ?name= -> mac dinh */
const name = computed(() => auth.user?.name || String(route.query.name || '') || 'bạn')
const redirect = computed(() => String(route.query.redirect || '/dashboard'))

/** Dem nguoc tu dong chuyen trang (dung khi nguoi dung khong bam nut) */
const countdown = ref(12)
let timer: ReturnType<typeof setInterval> | null = null

function go() {
  if (timer) clearInterval(timer)
  router.push(redirect.value)
}

onMounted(() => {
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) go()
  }, 1000)
})
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <div id="welcome-page">
    <UiHelloAnimation :name="name" cta="Khám phá ngay" @cta="go">
      <template #extra>
        <div class="mt-5 flex flex-col items-center gap-3">
          <div class="flex flex-wrap justify-center gap-2">
            <NuxtLink to="/tai-lieu" class="welcome-link">
              <AppIcon name="fa-magnifying-glass" />Xem thư viện
            </NuxtLink>
            <NuxtLink to="/dashboard/dang-ban" class="welcome-link">
              <AppIcon name="fa-cloud-arrow-up" />Đăng bán tài liệu
            </NuxtLink>
          </div>
          <p class="text-xs text-[#52525b]">
            Tự động chuyển tới bảng điều khiển sau {{ countdown }}s
          </p>
        </div>
      </template>
    </UiHelloAnimation>
  </div>
</template>

<style scoped>
.welcome-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 2.125rem;
  padding: 0 0.875rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.05);
  font-size: 12.5px;
  font-weight: 500;
  color: #d4d4d8;
  transition: border-color 0.16s ease, background-color 0.16s ease, color 0.16s ease;
}
.welcome-link:hover {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
</style>
