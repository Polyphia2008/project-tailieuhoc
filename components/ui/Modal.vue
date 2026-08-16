<script setup lang="ts">
const props = withDefaults(defineProps<{ modelValue: boolean; title?: string; width?: string }>(), { title: '', width: 'max-w-lg' })
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
const close = () => emit('update:modelValue', false)
watch(() => props.modelValue, (v) => { if (import.meta.client) document.body.style.overflow = v ? 'hidden' : '' })
onUnmounted(() => { if (import.meta.client) document.body.style.overflow = '' })
</script>
<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" leave-active-class="transition duration-150" leave-to-class="opacity-0">
      <div v-if="modelValue" class="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50" @click.self="close">
        <div class="bg-white rounded-2xl shadow-hover w-full flex flex-col max-h-[90vh]" :class="width">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 class="font-bold text-slate-800"><slot name="title">{{ title }}</slot></h3>
            <button class="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500" @click="close"><AppIcon name="fa-xmark" /></button>
          </div>
          <div class="px-5 py-4 overflow-y-auto"><slot /></div>
          <div v-if="$slots.footer" class="px-5 py-4 border-t border-slate-100 flex justify-end gap-2"><slot name="footer" /></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
