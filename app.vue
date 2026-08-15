<script setup lang="ts">
const auth = useAuthStore()
await useAsyncData('me', () => auth.fetchMe())
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
