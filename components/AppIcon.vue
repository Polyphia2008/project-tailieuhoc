<script setup lang="ts">
/**
 * AppIcon — cau noi Font Awesome -> Solar Icon Set (@iconify-json/solar)
 *
 * Dung:  <AppIcon name="fa-book-open" />
 *        <AppIcon name="fa-star" variant="bold" />
 *        <AppIcon name="solar:home-2-bold-duotone" />   (truyen thang icon Solar)
 *
 * Mac dinh dung style "linear" (outline) cua Solar cho net, hien dai.
 */
const props = withDefaults(
  defineProps<{
    name: string
    /** linear = outline | bold | duotone = bold-duotone */
    variant?: 'linear' | 'bold' | 'duotone'
    spin?: boolean
  }>(),
  { variant: 'linear', spin: false }
)

/** FA name (khong prefix fa-) -> Solar base name (khong hau to style) */
const MAP: Record<string, string> = {
  // --- Dieu huong / he thong ---
  'house': 'home-2', 'home': 'home-2', 'bars': 'hamburger-menu', 'xmark': 'close-circle',
  'chevron-right': 'alt-arrow-right', 'chevron-left': 'alt-arrow-left',
  'chevron-down': 'alt-arrow-down', 'chevron-up': 'alt-arrow-up',
  'arrow-right': 'arrow-right', 'arrow-left': 'arrow-left',
  'arrow-up': 'arrow-up', 'arrow-down': 'arrow-down',
  'arrow-up-right-from-square': 'square-top-down', 'up-right-from-square': 'square-top-down',
  'arrow-right-from-bracket': 'logout-2', 'right-from-bracket': 'logout-2',
  'right-to-bracket': 'login-2', 'ellipsis': 'menu-dots', 'ellipsis-vertical': 'menu-dots',
  'grip': 'widget-4', 'list': 'list', 'table-cells': 'widget-4', 'layer-group': 'layers',
  'rotate': 'refresh', 'rotate-right': 'refresh', 'rotate-left': 'restart',
  'spinner': 'refresh', 'sliders': 'tuning-2', 'filter': 'filter',

  // --- Tim kiem / hanh dong ---
  'magnifying-glass': 'magnifier', 'search': 'magnifier',
  'plus': 'add-circle', 'minus': 'minus-circle',
  'pen': 'pen-2', 'pen-to-square': 'pen-new-square', 'edit': 'pen-2',
  'trash': 'trash-bin-trash', 'trash-can': 'trash-bin-trash',
  'check': 'check-read', 'floppy-disk': 'diskette', 'copy': 'copy',
  'link': 'link-round', 'share-nodes': 'share', 'paper-plane': 'plain',
  'download': 'download', 'upload': 'upload',
  'cloud-arrow-up': 'cloud-upload', 'cloud-arrow-down': 'cloud-download',
  'file-arrow-up': 'file-send', 'eye': 'eye', 'eye-slash': 'eye-closed',
  'ban': 'forbidden-circle', 'flag': 'flag-2', 'hashtag': 'hashtag',

  // --- Trang thai / thong bao ---
  'circle-check': 'check-circle', 'circle-xmark': 'close-circle',
  'circle-info': 'info-circle', 'circle-exclamation': 'danger-circle',
  'circle-question': 'question-circle', 'triangle-exclamation': 'danger-triangle',
  'bell': 'bell', 'clock': 'clock-circle', 'hourglass-half': 'hourglass',
  'calendar': 'calendar', 'calendar-days': 'calendar-date',

  // --- Tai lieu / hoc tap ---
  'book': 'book-2', 'book-open': 'book-bookmark', 'books': 'book-2',
  'file': 'file', 'file-lines': 'file-text', 'file-pdf': 'file-text',
  'file-word': 'file-text', 'file-excel': 'file-check', 'file-image': 'gallery',
  'file-zipper': 'archive', 'file-circle-question': 'file-corrupted',
  'folder': 'folder', 'folder-open': 'folder-open', 'folder-tree': 'folder-with-files',
  'newspaper': 'notebook', 'note-sticky': 'notes', 'clipboard-list': 'clipboard-list',
  'graduation-cap': 'square-academic-cap', 'school': 'square-academic-cap',
  'chalkboard-user': 'presentation-graph', 'lightbulb': 'lightbulb',
  'square-root-variable': 'calculator', 'calculator': 'calculator',
  'flask': 'test-tube', 'atom': 'atom', 'dna': 'dna',
  'language': 'text-field', 'earth-americas': 'earth', 'globe': 'global',
  'landmark': 'banknote-2', 'scale-balanced': 'scale', 'laptop-code': 'programming',
  'microscope': 'test-tube-minimalistic', 'pen-ruler': 'ruler-pen',

  // --- Nguoi dung ---
  'user': 'user', 'users': 'users-group-rounded', 'user-plus': 'user-plus',
  'user-gear': 'user-id', 'user-shield': 'shield-user', 'user-slash': 'user-block',
  'user-check': 'user-check', 'id-card': 'card-2', 'address-card': 'card-2',
  'address-book': 'notebook-bookmark', 'building-columns': 'banknote-2',
  'clock-rotate-left': 'history',
  'circle-user': 'user-circle', 'shield-halved': 'shield-check', 'shield': 'shield',
  'lock': 'lock-password', 'lock-open': 'lock-keyhole-unlocked', 'key': 'key',
  'envelope': 'letter', 'phone': 'phone', 'location-dot': 'map-point',
  'map-location-dot': 'map-point-search', 'map': 'map',

  // --- Tien / thuong mai ---
  'wallet': 'wallet-money', 'money-bill': 'banknote-2',
  'money-bill-transfer': 'transfer-horizontal', 'money-bill-wave': 'banknote',
  'sack-dollar': 'sale', 'coins': 'dollar-minimalistic', 'dollar-sign': 'dollar',
  'credit-card': 'card', 'receipt': 'bill-list', 'cart-shopping': 'cart-large-2',
  'bag-shopping': 'bag-4', 'basket-shopping': 'cart-3', 'tag': 'tag',
  'tags': 'tag-horizontal', 'percent': 'sale', 'gift': 'gift', 'ticket': 'ticket',

  // --- Thong ke / bieu do ---
  'chart-line': 'chart-2', 'chart-simple': 'chart', 'chart-column': 'chart-square',
  'chart-pie': 'pie-chart-2', 'arrow-trend-up': 'graph-up',
  'arrow-trend-down': 'graph-down', 'gauge': 'speedometer-middle',
  'gauge-high': 'speedometer-max', 'trophy': 'cup-star', 'medal': 'medal-ribbon',
  'fire': 'fire', 'bolt': 'bolt', 'star': 'star', 'star-half-stroke': 'star-shine',
  'heart': 'heart', 'heart-crack': 'heart-crack', 'bookmark': 'bookmark',
  'thumbs-up': 'like', 'thumbs-down': 'dislike', 'comment': 'chat-round',
  'comments': 'chat-round-dots', 'quote-left': 'chat-square-like',

  // --- Thiet bi / khac ---
  'gear': 'settings', 'gears': 'settings-minimalistic', 'wrench': 'settings',
  'mobile-screen': 'smartphone', 'mobile-screen-button': 'smartphone-2',
  'desktop': 'monitor', 'inbox': 'inbox', 'box-open': 'box',
  'circle-nodes': 'sidebar', 'headset': 'headphones-round',
  'shop': 'shop', 'building': 'buildings-2', 'briefcase': 'case',
  'seedling': 'leaf', 'palette': 'palette', 'image': 'gallery',

  'google': 'global', 'stripe-s': 'card-transfer'
}

/**
 * Logo thuong hieu: Solar khong co logo nen dung bo simple-icons.
 * Gia tri la ten Iconify day du.
 */
const BRAND: Record<string, string> = {
  'facebook-f': 'simple-icons:facebook',
  'facebook': 'simple-icons:facebook',
  'youtube': 'simple-icons:youtube',
  'tiktok': 'simple-icons:tiktok',
  'twitter': 'simple-icons:x',
  'x-twitter': 'simple-icons:x',
  'instagram': 'simple-icons:instagram',
  'telegram': 'simple-icons:telegram',
  'zalo': 'simple-icons:zalo',
  'stripe': 'simple-icons:stripe',
  'google-brand': 'simple-icons:google'
}

/** Icon Solar khong co bien the '-bold' */
const NO_BOLD = new Set(['plain'])

/** Hau to style cua Solar */
const SUFFIX: Record<string, string> = {
  linear: 'linear',
  bold: 'bold',
  duotone: 'bold-duotone'
}

const resolved = computed(() => {
  const raw = props.name?.trim() || ''
  // Da la ten Solar / Iconify day du -> dung nguyen
  if (raw.includes(':')) return raw

  // Bo cac class phu tro cua FA
  const key = raw
    .replace(/\b(fa-solid|fa-regular|fa-brands|fa-light|fa-thin|fa-fw|fa-spin)\b/g, '')
    .trim()
    .replace(/^fa-/, '')

  // Logo thuong hieu -> simple-icons (khong co bien the linear/bold)
  const brand = BRAND[key]
  if (brand) return brand

  const base = MAP[key]
  if (!base) return 'solar:question-circle-linear'

  // Mot vai icon Solar khong co bien the 'bold' -> lui ve 'linear'
  const suffix = NO_BOLD.has(base) && props.variant === 'bold' ? 'linear' : SUFFIX[props.variant] || 'linear'
  return `solar:${base}-${suffix}`
})
</script>

<template>
  <Icon :name="resolved" :class="['app-icon', { 'app-icon--spin': spin || name.includes('spinner') }]" />
</template>

<style scoped>
.app-icon { display: inline-block; vertical-align: -0.125em; flex-shrink: 0; }
.app-icon--spin { animation: app-icon-spin 0.9s linear infinite; }
@keyframes app-icon-spin { to { transform: rotate(360deg); } }
</style>
