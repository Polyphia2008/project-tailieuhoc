<script setup lang="ts">
const auth = useAuthStore()
// Tra ve gia tri (khong null) de Nuxt khong canh bao va khong goi lai o client
await useAsyncData('me', async () => {
  await auth.fetchMe()
  return { ok: true }
})
useSeoMeta({
  title: 'MapDocs - Kho tài liệu học tập chất lượng cao',
  description: 'MapDocs: nền tảng chia sẻ & mua bán tài liệu học tập. Hàng nghìn đề thi, chuyên đề, bài giảng 10 môn học từ giáo viên giỏi trên cả nước.',
  ogTitle: 'MapDocs - Kho tài liệu học tập chất lượng cao',
  ogDescription: 'Hàng nghìn tài liệu học tập chất lượng, tải về ngay lập tức.',
  ogType: 'website'
})
</script>
<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UiToaster />
  </div>
</template>
