<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { num } = useFormat()
const { data } = await useFetch<any>('/api/admin/categories')
useHead({ title: 'Danh mục - MapDocs Admin' })
</script>
<template>
  <div>
    <nav class="flex items-center gap-1.5 text-[12px] text-mdk-mute"><NuxtLink to="/admin" class="hover:text-mdk-sub">Admin</NuxtLink> / <span class="text-mdk-sub">Danh mục</span></nav>
    <h1 class="mt-3 text-[22px] font-bold text-mdk-text font-ui tracking-tight">Danh mục môn học</h1>
    <p class="mt-1 text-[13px] text-mdk-mute">{{ data?.categories?.length || 0 }} danh mục đang hoạt động</p>
    <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div v-for="(c, i) in data?.categories || []" :key="c.id" class="card p-5" v-motion :initial="{ opacity: 0, y: 14 }" :enter="{ opacity: 1, y: 0, transition: { delay: i * 60 } }">
        <div class="flex items-start justify-between gap-3">
          <span class="w-10 h-10 rounded-xl grid place-items-center text-white" :style="{ background: c.color }"><AppIcon :name="c.icon" size="21" /></span>
          <span class="pill-slate text-[11px]">{{ c.slug }}</span>
        </div>
        <p class="mt-3 text-[15px] font-bold text-mdk-text font-ui">{{ c.name }}</p>
        <p class="mt-1 text-[12px] text-mdk-mute leading-relaxed line-clamp-2">{{ c.description }}</p>
        <dl class="mt-4 pt-4 border-t border-mdk-line grid grid-cols-3 gap-2 text-center">
          <div><dt class="text-[10.5px] text-mdk-mute uppercase">Tổng</dt><dd class="text-[15px] font-bold text-mdk-text tabular-nums">{{ num(c.document_count) }}</dd></div>
          <div><dt class="text-[10.5px] text-mdk-mute uppercase">Duyệt</dt><dd class="text-[15px] font-bold text-emerald-400 tabular-nums">{{ num(c.approved_count) }}</dd></div>
          <div><dt class="text-[10.5px] text-mdk-mute uppercase">Free</dt><dd class="text-[15px] font-bold text-primary-400 tabular-nums">{{ num(c.free_count) }}</dd></div>
        </dl>
      </div>
    </div>
  </div>
</template>
