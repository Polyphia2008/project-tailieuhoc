<script setup lang="ts">
withDefaults(defineProps<{ light?: boolean }>(), { light: false })

const { isDark, toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    aria-label="Đổi giao diện sáng tối"
    :aria-pressed="isDark"
    :title="isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'"
    class="group/button inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-transparent transition-colors hover:bg-cmstdev/10 hover:text-cmstdev focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cmstdev/30"
    :class="light ? 'text-mdk-sub' : 'text-muted-foreground'"
    @click="toggle"
  >
    <AppIcon name="solar:sun-2-linear" size="16" class="dark:hidden" />
    <AppIcon name="solar:moon-stars-bold" size="16" class="hidden dark:block" />
  </button>
</template>
