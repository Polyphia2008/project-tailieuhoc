<script setup lang="ts">
import { Carousel, Slide, Navigation } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'

const ITEMS = [
  { icon: 'solar:map-point-school-bold-duotone', name: 'THPT Chu Văn An' },
  { icon: 'solar:buildings-2-bold-duotone', name: 'THPT Lê Hồng Phong' },
  { icon: 'solar:city-bold-duotone', name: 'THPT Nguyễn Huệ' },
  { icon: 'solar:library-bold-duotone', name: 'MapDocs Teacher' },
  { icon: 'solar:diploma-bold-duotone', name: 'Cộng đồng giáo viên' },
  { icon: 'solar:users-group-rounded-bold-duotone', name: 'Học sinh Việt Nam' }
]

const paused = ref(false)

const settings = {
  itemsToShow: 2,
  snapAlign: 'start' as const,
  wrapAround: true,
  transition: 600,
  autoplay: 3000,
  pauseAutoplayOnHover: true
}

const breakpoints = {
  640: { itemsToShow: 3, snapAlign: 'start' as const },
  1024: { itemsToShow: 5, snapAlign: 'start' as const },
  1280: { itemsToShow: 6, snapAlign: 'start' as const }
}
</script>

<template>
  <section class="partner-section" aria-label="Đối tác và cộng đồng đồng hành cùng MapDocs">
    <div class="container-x">
      <p class="text-center text-[11.5px] font-bold uppercase tracking-[.14em] text-foreground/45">
        Được tin dùng bởi các trường và cộng đồng học tập trên toàn quốc
      </p>
    </div>

    <div class="partner-wrap mt-6">
      <ClientOnly>
        <Carousel
          v-bind="settings"
          :breakpoints="breakpoints"
          class="partner-carousel"
          @mouseenter="paused = true"
          @mouseleave="paused = false"
        >
          <Slide v-for="p in ITEMS" :key="p.name">
            <div class="partner-slide">
              <span class="partner-chip">
                <AppIcon :name="p.icon" size="19" class="shrink-0 text-cmstdev-500" />
                {{ p.name }}
              </span>
            </div>
          </Slide>

          <template #addons>
            <Navigation />
          </template>
        </Carousel>

        <template #fallback>
          <div class="partner-fallback">
            <span v-for="p in ITEMS" :key="p.name" class="partner-chip">
              <AppIcon :name="p.icon" size="19" class="shrink-0 text-cmstdev-500" />
              {{ p.name }}
            </span>
          </div>
        </template>
      </ClientOnly>
    </div>
  </section>
</template>

<style scoped>
.partner-section {
  max-width: 100%;
  overflow: hidden;
  border-top: 1px solid rgb(var(--border));
  border-bottom: 1px solid rgb(var(--border));
  background: rgb(var(--muted) / .35);
  padding-top: 2.25rem;
  padding-bottom: 2.25rem;
}

html.dark .partner-section {
  background: rgb(var(--card) / .4);
}

.partner-wrap {
  position: relative;
  max-width: 100%;
  overflow: hidden;
}

.partner-wrap::before,
.partner-wrap::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 88px;
  z-index: 3;
  pointer-events: none;
}

.partner-wrap::before {
  left: 0;
  background: linear-gradient(90deg, rgb(var(--background)) 8%, rgb(var(--background) / 0) 100%);
}

.partner-wrap::after {
  right: 0;
  background: linear-gradient(270deg, rgb(var(--background)) 8%, rgb(var(--background) / 0) 100%);
}

.partner-slide {
  display: flex;
  width: 100%;
  justify-content: center;
  padding: 0 7px;
}

.partner-fallback {
  display: flex;
  gap: 14px;
  overflow: hidden;
  padding: 0 1rem;
}

.partner-carousel :deep(.carousel__viewport) {
  overflow: hidden;
}

.partner-carousel :deep(.carousel__track) {
  align-items: stretch;
}

.partner-carousel :deep(.carousel__prev),
.partner-carousel :deep(.carousel__next) {
  display: none;
  height: 34px;
  width: 34px;
  border-radius: 9999px;
  border: 1px solid rgb(var(--border));
  background: rgb(var(--card) / .9);
  color: rgb(var(--foreground) / .7);
  box-shadow: 0 6px 18px -8px rgba(0, 0, 0, .3);
  transition: color .18s ease, border-color .18s ease;
  z-index: 4;
}

.partner-carousel :deep(.carousel__prev:hover),
.partner-carousel :deep(.carousel__next:hover) {
  color: #0ea5e9;
  border-color: rgba(14, 165, 233, .55);
}

.partner-carousel :deep(.carousel__icon) {
  width: 17px;
  height: 17px;
  fill: currentColor;
}

@media (min-width: 1024px) {
  .partner-carousel :deep(.carousel__prev),
  .partner-carousel :deep(.carousel__next) {
    display: grid;
    place-items: center;
  }
}
</style>
