<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <header class="bg-white border-b-2 border-gray-200">
    <nav class="mx-auto flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4" aria-label="Global">
      <div class="flex md:flex-1">
        <a href="#" class="-m-1.5 p-1.5">
          <img class="h-16 w-auto" src="@/assets/fractal.png" alt="" />
        </a>
      </div>
      <div class="flex md:hidden">
        <button type="button" class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400" @click="mobileMenuOpen = true">
          <span class="sr-only">Open main menu</span>
          <Bars3Icon class="size-6" aria-hidden="true" />
        </button>
      </div>
      <PopoverGroup class="hidden gap-x-5 md:flex lg:gap-x-12">
        <a href="#" class="text-md/6 font-semibold text-secondary-800 hover:text-primary-500">Programas</a>
        <a href="#" class="text-md/6 font-semibold text-secondary-800 hover:text-primary-500">Instructores</a>
        <a href="#" class="text-md/6 font-semibold text-secondary-800 hover:text-primary-500">Contacto</a>
      </PopoverGroup>
      <div class="hidden md:flex md:flex-1 md:justify-end">
        <button class="px-5 py-2 text-md/6 font-semibold rounded bg-primary-500 text-white cursor-pointer hover:bg-white hover:text-primary-500 hover:border hover:border-primary-500">Iniciar sesión</button>
      </div>
    </nav>
    <Dialog class="md:hidden" @close="mobileMenuOpen = false" :open="mobileMenuOpen">
      <div class="fixed inset-0 z-50" />
      <DialogPanel class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 md:max-w-sm md:ring-1 md:ring-gray-100/10">
        <div class="flex items-center justify-between">
          <a href="#" class="-m-1.5 p-1.5">
            <img class="h-16 w-auto" src="@/assets/fractal.png" alt="" />
          </a>
          <button type="button" class="-m-2.5 rounded-md p-2.5 text-gray-400 cursor-pointer" @click="mobileMenuOpen = false">
            <span class="sr-only">Close menu</span>
            <XMarkIcon class="size-6" aria-hidden="true" />
          </button>
        </div>
        <div class="mt-6 flow-root">
          <div class="-my-4 divide-y divide-white/10">
            <div class="space-y-2 py-6">
              <a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-md/6 font-semibold text-secondary-800 hover:text-primary-500">Programas</a>
              <a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-md/6 font-semibold text-secondary-800 hover:text-primary-500">Instructores</a>
              <a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-md/6 font-semibold text-secondary-800 hover:text-primary-500">Contacto</a>
            </div>
            <div class="py-4 border-t-2 border-primary-500">
              <a href="#" class="-mx-3 block rounded-lg px-3 py-2.5 text-md/6 font-semibold text-secondary-800 hover:text-primary-500">Iniciar sesión</a>
            </div>
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  </header>
</template>
<script setup lang="ts">
  import { ref } from 'vue'
  import { Dialog, DialogPanel, PopoverGroup } from '@headlessui/vue'
  import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/solid'
  const mobileMenuOpen = ref(false)
</script>