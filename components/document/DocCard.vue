<script setup lang="ts">
import type { DocumentItem } from '~/types'

const props = withDefaults(
  defineProps<{
    doc: DocumentItem
    index?: number
    compact?: boolean
    dark?: boolean
  }>(),
  { index: 0 }
)

const { price, compact: kfmt, num } = useFormat()
const { get, gradient, fileIcon } = useSubjects()

const subject = computed(() => get(props.doc.subject))
</script>

<template>
  <NuxtLink
    :to="`/tai-lieu/${doc.slug}`"
    class="group block rounded-xl border overflow-hidden transition-all duration-300 hover:-translate-y-1"
    :class="dark
      ? 'bg-mdk-panel border-mdk-line hover:border-mdk-line2'
      : 'bg-white border-slate-200 shadow-card hover:shadow-lift'"
    v-motion
    :initial="{ opacity: 0, y: 16 }"
    :enter="{ opacity: 1, y: 0, transition: { delay: 40 + index * 45, duration: 400 } }"
  >
    <div
      class="relative overflow-hidden"
      :class="compact ? 'h-[104px]' : 'h-[132px]'"
      :style="{ background: gradient(doc.subject) }"
    >
      <div
        class="absolute inset-0 opacity-[.16]"
        style="background-image: radial-gradient(circle at 18% 22%, #fff 1.4px, transparent 1.6px); background-size: 15px 15px"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />

      <div class="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
        <span class="pill bg-white/22 text-white backdrop-blur-sm text-[10.5px] font-semibold">
          {{ subject.name }}
        </span>
        <span class="pill bg-black/28 text-white/95 backdrop-blur-sm text-[10.5px] font-medium">
          Lớp {{ doc.grade }}
        </span>
      </div>

      <span
        v-if="doc.is_free"
        class="absolute top-2.5 right-2.5 pill bg-emerald-500 text-white text-[10.5px] font-bold shadow-sm"
      >
        MIỄN PHÍ
      </span>
      <span
        v-else-if="doc.featured"
        class="absolute top-2.5 right-2.5 pill bg-amber-400 text-amber-950 text-[10.5px] font-bold shadow-sm"
      >
        <AppIcon name="solar:crown-bold" size="11" /> NỔI BẬT
      </span>

      <AppIcon
        :name="fileIcon(doc.file_type)"
        size="46"
        class="absolute -bottom-1.5 right-2 text-white/25 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
      />

      <div class="absolute bottom-2 left-2.5 flex items-center gap-2.5 text-[11px] text-white/90 font-medium">
        <span class="inline-flex items-center gap-1">
          <AppIcon name="solar:eye-linear" size="12" /> {{ kfmt(doc.view_count) }}
        </span>
        <span class="inline-flex items-center gap-1">
          <AppIcon name="solar:file-text-linear" size="12" /> {{ doc.pages }} tr
        </span>
      </div>
    </div>

    <div class="p-3.5">
      <h3
        class="text-[13.5px] font-semibold leading-snug line-clamp-2 min-h-[38px] transition-colors font-ui"
        :class="dark ? 'text-mdk-text group-hover:text-primary-300' : 'text-slate-800 group-hover:text-primary-600'"
      >
        {{ doc.title }}
      </h3>

      <div class="mt-2 flex items-center gap-2">
        <UiRating :value="doc.rating_avg" :size="12" />
        <span class="text-[11px]" :class="dark ? 'text-mdk-mute' : 'text-slate-400'">
          {{ doc.rating_count > 0 ? `${doc.rating_count} đánh giá` : 'Chưa có đánh giá' }}
        </span>
      </div>

      <div
        class="mt-3 pt-3 flex items-center justify-between gap-2 border-t"
        :class="dark ? 'border-mdk-line' : 'border-slate-100'"
      >
        <div class="min-w-0 flex items-center gap-1.5">
          <UiAvatar :name="doc.seller?.name" :size="22" />
          <span class="text-[11.5px] truncate" :class="dark ? 'text-mdk-sub' : 'text-slate-500'">
            {{ doc.seller?.name || 'MapDocs' }}
          </span>
        </div>
        <span
          class="shrink-0 text-[14px] font-bold font-ui tabular-nums"
          :class="doc.is_free ? 'text-emerald-500' : dark ? 'text-primary-300' : 'text-primary-600'"
        >
          {{ price(doc.price, doc.is_free) }}
        </span>
      </div>

      <div v-if="!compact && doc.sold_count > 0" class="mt-2 text-[11px]" :class="dark ? 'text-mdk-mute' : 'text-slate-400'">
        Đã bán {{ num(doc.sold_count) }} lượt
      </div>
    </div>
  </NuxtLink>
</template>
