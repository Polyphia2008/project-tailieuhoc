<script setup lang="ts">
import type { DocumentItem } from '~/types'
const props = defineProps<{ doc: DocumentItem }>()
const { meta } = useSubjects()
const { currency, compact } = useFormat()
const s = computed(() => meta(props.doc.subject))
</script>
<template>
  <NuxtLink :to="`/tai-lieu/${doc.slug}`"
    class="group bg-white rounded-xl overflow-hidden shadow-card hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col border border-slate-100">
    <div class="relative h-32 bg-gradient-to-br flex items-center justify-center" :class="s.gradient">
      <i class="fa-solid text-white/90 text-4xl group-hover:scale-110 transition-transform" :class="s.icon" />
      <span v-if="doc.is_free" class="absolute top-2 left-2 bg-green-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">MIỄN PHÍ</span>
      <span v-if="doc.featured" class="absolute top-2 right-2 bg-accent-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full"><i class="fa-solid fa-fire mr-1" />HOT</span>
      <span v-if="doc.grade" class="absolute bottom-2 left-2 bg-black/30 backdrop-blur text-white text-[11px] font-medium px-2 py-0.5 rounded">Lớp {{ doc.grade }}</span>
      <span class="absolute bottom-2 right-2 bg-white/90 text-slate-600 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded">{{ doc.file_type || 'pdf' }}</span>
    </div>
    <div class="p-3.5 flex flex-col flex-1">
      <span class="text-[11px] font-semibold uppercase tracking-wide" :class="s.text">{{ s.label }}</span>
      <h3 class="font-semibold text-slate-800 text-sm mt-1 line-clamp-2 group-hover:text-primary-900 transition-colors leading-snug">{{ doc.title }}</h3>
      <p class="text-xs text-slate-500 mt-1.5 line-clamp-2 flex-1">{{ doc.description }}</p>
      <UiRating :value="doc.rating_avg" :count="doc.rating_count" class="mt-2" />
      <div class="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
        <UiAvatar :name="doc.seller?.name" :src="doc.seller?.avatar" :size="18" />
        <span class="truncate">{{ doc.seller?.name || 'MapDocs' }}</span>
      </div>
      <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <span class="font-bold" :class="doc.is_free ? 'text-green-600' : 'text-accent-500'">{{ currency(doc.price) }}</span>
        <div class="flex items-center gap-2.5 text-[11px] text-slate-400">
          <span><i class="fa-regular fa-eye mr-0.5" />{{ compact(doc.view_count) }}</span>
          <span><i class="fa-solid fa-download mr-0.5" />{{ compact(doc.download_count) }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
