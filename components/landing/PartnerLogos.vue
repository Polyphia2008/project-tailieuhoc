<script setup lang="ts">
const ITEMS = [
  { icon: 'solar:map-point-school-bold-duotone', name: 'THPT Chu Văn An' },
  { icon: 'solar:buildings-2-bold-duotone', name: 'THPT Lê Hồng Phong' },
  { icon: 'solar:city-bold-duotone', name: 'THPT Nguyễn Huệ' },
  { icon: 'solar:library-bold-duotone', name: 'Trung tâm MapDocs' },
  { icon: 'solar:diploma-bold-duotone', name: 'Cộng đồng giáo viên' },
  { icon: 'solar:users-group-rounded-bold-duotone', name: 'Học sinh Việt Nam' }
]

const LOOP = [...ITEMS, ...ITEMS]
</script>

<template>
  <section class="partner-section" aria-label="Đối tác và cộng đồng đồng hành cùng MapDocs">
    <div class="container-x">
      <p class="text-center text-[11.5px] font-bold uppercase tracking-[.14em] text-foreground/45">
        Được tin dùng bởi các trường và cộng đồng học tập trên toàn quốc
      </p>
    </div>

    <div class="marquee-mask mt-6" role="list">
      <div class="marquee">
        <span
          v-for="(p, i) in LOOP"
          :key="p.name + '-' + i"
          class="partner-chip"
          role="listitem"
          :aria-hidden="i >= ITEMS.length ? 'true' : undefined"
        >
          <AppIcon :name="p.icon" size="19" class="shrink-0 text-cmstdev-500" />
          {{ p.name }}
        </span>
      </div>
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

:global(html.dark) .partner-section {
  background: rgb(var(--card) / .4);
}
</style>
