<script setup lang="ts">
const { ago, compact } = useFormat()
const page = ref(1)
const { data } = await useFetch<any>('/api/blogs', { query: computed(() => ({ page: page.value, limit: 9 })) })
useHead({ title: 'Blog kiến thức - MapDocs' })
</script>
<template>
  <div class="bg-slate-50 min-h-screen">
    <div class="bg-[#09090b] py-12">
      <div class="container-x">
        <h1 class="text-[30px] sm:text-[38px] font-extrabold text-white font-ui tracking-tight">Blog kiến thức</h1>
        <p class="mt-3 text-[15px] text-zinc-400 max-w-[560px] leading-relaxed">Phương pháp học tập, kinh nghiệm ôn thi và hướng dẫn sử dụng nền tảng.</p>
      </div>
    </div>
    <div class="container-x py-10">
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink v-for="(b, i) in data?.items || []" :key="b.id" :to="`/blog/${b.slug}`" class="card overflow-hidden group hover:shadow-lift transition-all hover:-translate-y-1"
          v-motion :initial="{ opacity: 0, y: 16 }" :enter="{ opacity: 1, y: 0, transition: { delay: i * 60 } }">
          <div class="h-[130px] relative" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8)">
            <div class="absolute inset-0 opacity-[.16]" style="background-image: radial-gradient(circle at 20% 25%, #fff 1.5px, transparent 1.7px); background-size: 16px 16px" />
            <AppIcon name="solar:notes-bold-duotone" size="46" class="absolute bottom-2 right-3 text-white/25" />
          </div>
          <div class="p-4">
            <div class="flex flex-wrap gap-1.5">
              <span v-for="t in (b.tags || []).slice(0, 2)" :key="t" class="pill-blue text-[10.5px]">{{ t }}</span>
            </div>
            <h2 class="mt-2.5 text-[15px] font-bold text-slate-900 font-ui leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">{{ b.title }}</h2>
            <p class="mt-2 text-[13px] text-slate-500 leading-relaxed line-clamp-3">{{ b.excerpt }}</p>
            <div class="mt-3.5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-400">
              <span class="inline-flex items-center gap-1.5"><UiAvatar :name="b.author?.name" :size="20" /> {{ b.author?.name }}</span>
              <span>{{ compact(b.view_count) }} lượt xem</span>
            </div>
          </div>
        </NuxtLink>
      </div>
      <UiEmpty v-if="!data?.items?.length" title="Chưa có bài viết" />
    </div>
  </div>
</template>
