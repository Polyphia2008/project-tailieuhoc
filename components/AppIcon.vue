<script setup lang="ts">
const props = defineProps<{
  name: string
  size?: string | number
  class?: string
}>()

const MAP: Record<string, string> = {
  home: 'solar:home-2-bold-duotone',
  dashboard: 'solar:widget-5-bold-duotone',
  search: 'solar:magnifer-linear',
  bell: 'solar:bell-bold-duotone',
  user: 'solar:user-circle-bold-duotone',
  users: 'solar:users-group-rounded-bold-duotone',
  wallet: 'solar:wallet-money-bold-duotone',
  cart: 'solar:cart-large-4-bold-duotone',
  heart: 'solar:heart-bold-duotone',
  'heart-o': 'solar:heart-linear',
  star: 'solar:star-bold',
  'star-o': 'solar:star-linear',
  file: 'solar:file-text-bold-duotone',
  folder: 'solar:folder-with-files-bold-duotone',
  download: 'solar:download-minimalistic-bold-duotone',
  upload: 'solar:cloud-upload-bold-duotone',
  eye: 'solar:eye-bold-duotone',
  edit: 'solar:pen-new-square-bold-duotone',
  trash: 'solar:trash-bin-trash-bold-duotone',
  check: 'solar:check-circle-bold',
  close: 'solar:close-circle-bold',
  clock: 'solar:clock-circle-bold-duotone',
  chart: 'solar:chart-square-bold-duotone',
  settings: 'solar:settings-bold-duotone',
  logout: 'solar:logout-3-bold-duotone',
  menu: 'solar:hamburger-menu-linear',
  chevron: 'solar:alt-arrow-right-linear',
  'chevron-down': 'solar:alt-arrow-down-linear',
  'arrow-right': 'solar:arrow-right-linear',
  'arrow-up': 'solar:arrow-up-linear',
  'arrow-down': 'solar:arrow-down-linear',
  plus: 'solar:add-circle-bold-duotone',
  filter: 'solar:filter-bold-duotone',
  tag: 'solar:tag-bold-duotone',
  book: 'solar:book-2-bold-duotone',
  blog: 'solar:notes-bold-duotone',
  flag: 'solar:flag-bold-duotone',
  shield: 'solar:shield-check-bold-duotone',
  lock: 'solar:lock-password-bold-duotone',
  mail: 'solar:letter-bold-duotone',
  phone: 'solar:phone-bold-duotone',
  location: 'solar:map-point-bold-duotone',
  info: 'solar:info-circle-bold-duotone',
  warning: 'solar:danger-triangle-bold-duotone',
  moon: 'solar:moon-bold-duotone',
  sun: 'solar:sun-bold-duotone',
  help: 'solar:question-circle-bold-duotone',
  share: 'solar:share-bold-duotone',
  copy: 'solar:copy-bold-duotone',
  link: 'solar:link-round-angle-bold-duotone',
  spinner: 'solar:refresh-circle-linear',
  google: 'simple-icons:google',
  facebook: 'simple-icons:facebook',
  youtube: 'simple-icons:youtube',
  tiktok: 'simple-icons:tiktok'
}

const resolved = computed(() => (props.name?.includes(':') ? props.name : MAP[props.name] || MAP.info))
</script>

<template>
  <Icon :name="resolved" :size="size" :class="props.class" />
</template>
