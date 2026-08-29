<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string
    title?: string
    description?: string
    compact?: boolean
  }>(),
  {
    icon: 'solar:box-minimalistic-bold-duotone',
    title: 'Chưa có dữ liệu'
  }
)
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center" :class="compact ? 'py-10 px-4' : 'py-16 px-6'">
    <div class="w-16 h-16 rounded-2xl grid place-items-center bg-mdk-line/60 text-mdk-mute mb-4">
      <AppIcon :name="icon" size="30" />
    </div>
    <p class="text-[15px] font-semibold text-slate-900 dark:text-zinc-100 font-ui">{{ title }}</p>
    <p v-if="description" class="mt-1.5 text-[13px] text-slate-500 max-w-sm leading-relaxed">{{ description }}</p>
    <div v-if="$slots.default" class="mt-5">
      <slot />
    </div>
  </div>
</template>
