<template>
  <TransitionGroup
    tag="div"
    class="fixed top-20 right-4 z-50 flex flex-col gap-2"
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-x-4 opacity-0"
    enter-to-class="translate-x-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-x-0 opacity-100"
    leave-to-class="translate-x-4 opacity-0"
  >
    <div
      v-for="toast in queue"
      :key="toast.id"
      :class="['flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg max-w-sm w-full', typeStyles[toast.type]]"
      role="alert"
    >
      <component :is="typeIcons[toast.type]" class="size-5 shrink-0 mt-0.5" aria-hidden="true" />
      <div class="flex-1 text-sm font-medium">{{ toast.message }}</div>
      <button @click="hide(toast.id)" class="shrink-0 opacity-70 hover:opacity-100 cursor-pointer">
        <XMarkIcon class="size-4" aria-hidden="true" />
      </button>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
  import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/vue/24/solid'
  import { useToast } from '@/modules/landing/composables/useToast'

  const { queue, hide } = useToast()

  const typeStyles = {
    error: 'bg-red-50 text-red-800 border border-red-200',
    success: 'bg-green-50 text-green-800 border border-green-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200',
  }

  const typeIcons = {
    error: ExclamationCircleIcon,
    success: CheckCircleIcon,
    info: InformationCircleIcon,
  }
</script>
