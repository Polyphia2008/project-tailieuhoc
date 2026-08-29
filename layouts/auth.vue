<script setup lang="ts">
const route = useRoute()

const title = computed(() => String(route.meta.authTitle || 'Đăng nhập hệ thống'))
const subtitle = computed(() => String(route.meta.authSubtitle || 'Vui lòng nhập thông tin tài khoản của bạn.'))
const icon = computed(() => String(route.meta.authIcon || 'solar:login-3-bold'))
</script>

<template>
  <AuthShell :icon="icon" :title="title" :subtitle="subtitle">
    <slot />
  </AuthShell>
</template>
