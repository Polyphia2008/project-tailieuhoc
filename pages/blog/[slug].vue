<script setup lang="ts">
const route = useRoute()
const { date, compact } = useFormat()
const { data } = await useFetch<any>(() => `/api/blogs/${route.params.slug}`)
if (!data.value?.blog) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy bài viết' })
const b = computed(() => data.value.blog)

const html = computed(() => {
  let s = String(b.value.content || '')
  s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  s = s.replace(/^### (.+)$/gm, '<h3>$1</h3>').replace(/^## (.+)$/gm, '<h2>$1</h2>')
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  s = s.split(/\n{2,}/).map((p) => (/^<h[23]>/.test(p.trim()) || p.trim().startsWith('|') || p.trim().startsWith('-') || /^\d\./.test(p.trim()) ? p : `<p>${p.replace(/\n/g, '<br>')}</p>`)).join('\n')
  return s
})
useHead(() => ({ title: `${b.value?.title} - MapDocs Blog` }))
</script>
<template>
  <div class="bg-slate-50 min-h-screen pb-14">
    <div class="bg-[#09090b] py-12">
      <div class="container-x max-w-[780px]">
        <nav class="flex items-center gap-1.5 text-[12.5px] text-zinc-500"><NuxtLink to="/" class="hover:text-zinc-300">Trang chủ</NuxtLink> / <NuxtLink to="/blog" class="hover:text-zinc-300">Blog</NuxtLink></nav>
        <div class="mt-4 flex flex-wrap gap-2"><span v-for="t in b.tags || []" :key="t" class="pill bg-white/[.08] text-zinc-300 text-[11px] border border-white/[.1]">{{ t }}</span></div>
        <h1 class="mt-4 text-[28px] sm:text-[38px] font-extrabold text-white font-ui tracking-tight leading-tight">{{ b.title }}</h1>
        <div class="mt-5 flex items-center gap-3 text-[13px] text-zinc-500">
          <UiAvatar :name="b.author?.name" :size="34" />
          <span class="text-zinc-300 font-medium">{{ b.author?.name }}</span> ·
          <span>{{ date(b.published_at || b.created_at) }}</span> ·
          <span>{{ compact(b.view_count) }} lượt xem</span>
        </div>
      </div>
    </div>
    <div class="container-x max-w-[780px] mt-8">
      <article class="card p-6 sm:p-8 prose prose-slate max-w-none prose-headings:font-ui prose-h2:text-[22px] prose-h3:text-[18px] prose-p:text-[15px] prose-p:leading-relaxed prose-table:text-[14px]" v-html="html" />
      <div v-if="data.related?.length" class="mt-8">
        <h2 class="text-[19px] font-bold text-slate-900 font-ui">Bài viết liên quan</h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <NuxtLink v-for="r in data.related" :key="r.id" :to="`/blog/${r.slug}`" class="card p-4 hover:shadow-lift transition group">
            <h3 class="text-[14px] font-semibold text-slate-900 dark:text-zinc-100 font-ui leading-snug line-clamp-2 group-hover:text-primary-600">{{ r.title }}</h3>
            <p class="mt-1.5 text-[12.5px] text-slate-500 line-clamp-2">{{ r.excerpt }}</p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
