<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src: string
    alt?: string
    width?: number | string
    height?: number | string
    ratio?: string
    rounded?: string
    cover?: boolean
    eager?: boolean
  }>(),
  { alt: '', ratio: '', rounded: 'rounded-xl', cover: true, eager: false }
)

const root = ref<HTMLElement | null>(null)
const shouldLoad = ref(props.eager)
const loaded = ref(false)

let io: IntersectionObserver | null = null

onMounted(() => {
  if (shouldLoad.value) return
  if (!('IntersectionObserver' in window)) {
    shouldLoad.value = true
    return
  }
  io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        shouldLoad.value = true
        io?.disconnect()
        io = null
      }
    },
    { rootMargin: '260px 0px' }
  )
  if (root.value) io.observe(root.value)
})

onBeforeUnmount(() => {
  io?.disconnect()
  io = null
})
</script>

<template>
  <span
    ref="root"
    class="ui-img relative block overflow-hidden bg-muted"
    :class="rounded"
    :style="{
      aspectRatio: props.ratio || undefined,
      width: typeof width === 'number' ? width + 'px' : width,
      height: typeof height === 'number' ? height + 'px' : height
    }"
  >
    <span v-if="!loaded" class="absolute inset-0 skel" :class="rounded" />
    <img
      v-if="shouldLoad"
      :src="src"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      class="ui-img-el h-full w-full transition-opacity duration-500"
      :class="[cover ? 'object-cover' : 'object-contain', loaded ? 'opacity-100' : 'opacity-0']"
      @load="loaded = true"
      @error="loaded = true"
    />
  </span>
</template>

<style scoped>
.ui-img-el {
  display: block;
}
</style>
