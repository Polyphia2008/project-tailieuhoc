<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useSeoMeta({ title: 'Tài liệu yêu thích - MapDocs' })

const { data, pending } = await useAsyncData('favorites', () => $fetch<any>('/api/user/favorites'))
</script>

<template>
  <section id="favorites-page">
    <header class="mb-6">
      <h1 class="text-2xl font-extrabold text-slate-800"><i class="fa-solid fa-heart text-red-500 mr-2" />Tài liệu yêu thích</h1>
      <p class="text-slate-500 text-sm mt-1">
        {{ data?.data?.total || 0 }} tài liệu đã được bạn lưu lại để xem sau.
      </p>
    </header>

    <div v-if="pending" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <DocumentDocSkeleton :count="6" />
    </div>

    <template v-else-if="data?.data">
      <UiEmpty v-if="!data.data.items.length" icon="fa-heart-crack" title="Chưa có tài liệu yêu thích"
        desc="Nhấn biểu tượng trái tim ở trang chi tiết tài liệu để lưu lại cho lần sau.">
        <NuxtLink to="/tai-lieu" class="btn btn-primary"><i class="fa-solid fa-book-open mr-2" />Khám phá thư viện</NuxtLink>
      </UiEmpty>
      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <DocumentDocCard v-for="d in data.data.items" :key="d.id" :doc="d" />
      </div>
    </template>
  </section>
</template>
