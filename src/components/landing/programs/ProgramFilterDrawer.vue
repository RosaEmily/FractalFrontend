<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 bg-black/50 z-60 lg:hidden" @click="$emit('update:open', false)" />
    </Transition>

    <!-- Panel -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-300 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div v-if="open"
        class="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-70 lg:hidden flex flex-col shadow-xl">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <span class="text-sm font-semibold uppercase tracking-wider text-gray-700">Filtros</span>
          <button @click="$emit('update:open', false)" class="text-gray-400 hover:text-gray-600 cursor-pointer">
            <XMarkIcon class="size-5" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto px-5 py-2">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { XMarkIcon } from '@heroicons/vue/24/solid'

  defineProps<{ open: boolean }>()
  defineEmits<{ 'update:open': [value: boolean] }>()
</script>
