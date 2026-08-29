<script setup lang="ts">
withDefaults(defineProps<{ light?: boolean }>(), { light: false })

const { toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    aria-label="Đổi giao diện sáng tối"
    class="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-cmstdev/10 hover:text-cmstdev"
    :class="light ? 'text-zinc-400' : 'text-muted-foreground'"
    @click="toggle()"
  >
    <AppIcon name="solar:sun-2-bold" size="17" class="dark:hidden" />
    <AppIcon name="solar:moon-bold" size="17" class="hidden dark:block" />
  </button>
</template>
