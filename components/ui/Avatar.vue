<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name?: string
    src?: string
    size?: number
    online?: boolean
    ring?: boolean
    style?: string
    fade?: boolean
  }>(),
  { size: 36, style: 'avataaars', fade: false }
)

const { avatarUrl } = useAvatar()

const PALETTE = [
  ['#a855f7', '#7e22ce'],
  ['#3b82f6', '#1d4ed8'],
  ['#8b5cf6', '#6d28d9'],
  ['#10b981', '#047857'],
  ['#f97316', '#c2410c'],
  ['#f43f5e', '#be123c'],
  ['#06b6d4', '#0e7490'],
  ['#f59e0b', '#b45309']
]

const tone = computed(() => {
  const s = String(props.name || '?')
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997
  return PALETTE[h % PALETTE.length]
})

const generated = computed(() => avatarUrl(props.name, props.style))
const failed = ref(false)
const shown = ref(!props.fade)

onMounted(() => {
  if (props.fade) requestAnimationFrame(() => { shown.value = true })
})
</script>

<template>
  <span class="relative inline-flex shrink-0" :style="{ width: `${size}px`, height: `${size}px` }">
    <img
      v-if="src"
      :src="src"
      :alt="name || 'avatar'"
      class="w-full h-full rounded-full object-cover"
      :class="ring ? 'ring-2 ring-white/15' : ''"
    />
    <img
      v-else-if="!failed"
      :src="generated"
      :alt="name || 'avatar'"
      class="w-full h-full rounded-full object-cover bg-cmstdev/10"
      :class="[ring ? 'ring-2 ring-white/15' : '', fade ? 'transition-opacity duration-[800ms] ease-out' : '']"
      :style="fade ? { opacity: shown ? 1 : 0 } : undefined"
      loading="lazy"
      @error="failed = true"
    />
    <span
      v-else
      class="w-full h-full rounded-full grid place-items-center font-semibold text-white select-none"
      :class="ring ? 'ring-2 ring-white/15' : ''"
      :style="{
        background: `linear-gradient(135deg, ${tone[0]}, ${tone[1]})`,
        fontSize: `${Math.max(10, Math.round(size * 0.38))}px`
      }"
    >
      {{ useFormat().initials(name) }}
    </span>
    <span
      v-if="online"
      class="absolute bottom-0 right-0 rounded-full bg-emerald-500 border-2 border-mdk-bg"
      :style="{ width: `${Math.max(8, size * 0.28)}px`, height: `${Math.max(8, size * 0.28)}px` }"
    />
  </span>
</template>
