<script setup lang="ts">
import { useUserStore } from "@/modules/admin/stores/useUserStore";
import { computed } from "vue";
import { ImageCore } from "@/shared/components";
import Logo from "@/assets/fractal.png";

const userStore = useUserStore();
const fullName = computed(() => {
  return userStore.fullName;
});
</script>
<template>
  <div class="size-full flex justify-center items-center">
    <div
      class="grid justify-items-center text-center space-y-0 sm:space-y-2 lg:space-y-5"
    >
      <div>
        <h1
          class="text-2xl sm:text-3xl lg:text-6xl font-extrabold leading-relaxed text-gray-900"
        >
          BIENVENIDO <br class="lg:hidden block" />
          <span class="text-primary-500 uppercase">
            {{ fullName }}
          </span>
        </h1>
      </div>
      <div>
        <h1
          class="text-2xl sm:text-3xl lg:text-6xl font-extrabold leading-relaxed text-gray-900"
        >
          AL
          <mark class="px-2 text-white bg-primary-500 rounded">
            PANEL ADMINISTRATIVO</mark
          >
          <br class="lg:hidden block" />
          DE
        </h1>
      </div>
      <div class="w-full flex justify-center items-center">
        <ImageCore image-class="h-5/12" :src="Logo" />
      </div>
    </div>
  </div>
</template>
