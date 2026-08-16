<script setup lang="ts">
import type { DocumentItem } from '~/types'

const props = withDefaults(
  defineProps<{
    doc: DocumentItem
    /** Thu tu trong luoi - dung de stagger animation fade-up */
    index?: number
  }>(),
  { index: 0 }
)

const { meta } = useSubjects()
const { currency, compact } = useFormat()
const s = computed(() => meta(props.doc.subject))

/** Do tre cua hieu ung fade-up theo vi tri the (toi da 320ms) */
const motionDelay = computed(() => Math.min(props.index * 55, 320))
</script>

<template>
  <NuxtLink
    :to="`/tai-lieu/${doc.slug}`"
    class="doc-card group"
    v-motion
    :initial="{ opacity: 0, y: 18 }"
    :visible-once="{ opacity: 1, y: 0, transition: { duration: 420, delay: motionDelay, ease: 'easeOut' } }"
  >
    <!-- HEADER: gradient diu + pattern overlay -->
    <div class="doc-card__head bg-gradient-to-br" :class="s.gradient">
      <span class="doc-card__pattern" aria-hidden="true" />
      <AppIcon :name="s.icon" class="doc-card__icon" />

      <!-- Badges -->
      <span v-if="doc.is_free" class="doc-badge doc-badge--free">MIỄN PHÍ</span>
      <span v-if="doc.featured" class="doc-badge doc-badge--hot">
        <AppIcon name="fa-fire" variant="bold" class="text-[10px]" />HOT
      </span>
      <span v-if="doc.grade" class="doc-badge doc-badge--grade">Lớp {{ doc.grade }}</span>
      <span class="doc-badge doc-badge--type">{{ doc.file_type || 'pdf' }}</span>
    </div>

    <!-- BODY -->
    <div class="doc-card__body">
      <span class="text-[11px] font-semibold uppercase tracking-wide" :class="s.text">{{ s.label }}</span>

      <h3 class="doc-card__title">{{ doc.title }}</h3>

      <p class="doc-card__desc">{{ doc.description }}</p>

      <UiRating :value="doc.rating_avg" :count="doc.rating_count" class="mt-2" />

      <div class="flex items-center gap-1.5 mt-2 text-xs text-ink-soft">
        <UiAvatar :name="doc.seller?.name" :src="doc.seller?.avatar" :size="18" />
        <span class="truncate">{{ doc.seller?.name || 'MapDocs' }}</span>
      </div>

      <!-- FOOTER -->
      <div class="flex items-center justify-between mt-3 pt-3 border-t border-line">
        <span class="doc-card__price" :class="doc.is_free ? 'text-ok' : 'text-accent-600'">
          {{ doc.is_free ? 'Miễn phí' : currency(doc.price) }}
        </span>
        <div class="flex items-center gap-2.5 text-[11px] text-slate-400">
          <span class="inline-flex items-center gap-1">
            <AppIcon name="fa-eye" />{{ compact(doc.view_count) }}
          </span>
          <span class="inline-flex items-center gap-1">
            <AppIcon name="fa-download" />{{ compact(doc.download_count) }}
          </span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.doc-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease;
  will-change: transform;
}
.doc-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(11, 74, 143, 0.12);
  border-color: rgba(11, 74, 143, 0.18);
}

/* ---- Header ---- */
.doc-card__head {
  position: relative;
  height: 8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
/* Pattern chim nhe: luoi cheo + quang sang goc tren */
.doc-card__pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 22% 18%, rgba(255, 255, 255, 0.22), transparent 55%),
    repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0 1px, transparent 1px 11px);
  opacity: 0.95;
  pointer-events: none;
}
.doc-card__icon {
  position: relative;
  font-size: 2.25rem;
  color: rgba(255, 255, 255, 0.92);
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.18));
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.group:hover .doc-card__icon { transform: scale(1.1) rotate(-3deg); }

/* ---- Badges ---- */
.doc-badge {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  letter-spacing: 0.02em;
  z-index: 1;
}
.doc-badge--free { top: 0.5rem; left: 0.5rem; background: #16a34a; color: #fff; }
.doc-badge--hot  { top: 0.5rem; right: 0.5rem; background: #ff8412; color: #fff; }
.doc-badge--grade {
  bottom: 0.5rem; left: 0.5rem;
  background: rgba(15, 23, 42, 0.42);
  backdrop-filter: blur(3px);
  color: #fff;
  font-weight: 600;
}
.doc-badge--type {
  bottom: 0.5rem; right: 0.5rem;
  background: rgba(248, 250, 252, 0.94);
  color: #475569;
  text-transform: uppercase;
  border-radius: 0.375rem;
}

/* ---- Body ---- */
.doc-card__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0.875rem;
  background: #fff;
}
.doc-card__title {
  margin-top: 0.25rem;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
  color: #0f172a;
  transition: color 0.18s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.group:hover .doc-card__title { color: #0b4a8f; }
.doc-card__desc {
  flex: 1;
  margin-top: 0.375rem;
  font-size: 12px;
  line-height: 1.5;
  color: #475569;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.doc-card__price {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

@media (prefers-reduced-motion: reduce) {
  .doc-card, .doc-card__icon { transition: none; }
  .doc-card:hover { transform: none; }
  .group:hover .doc-card__icon { transform: none; }
}
</style>
