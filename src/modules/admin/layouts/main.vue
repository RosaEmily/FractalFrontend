<script setup lang="ts">
import { AvatarCore, ImageCore } from "@/shared/components";
import LayoutStructure from "@/modules/components/structure/index.vue";
import NavVertical from "../components/NavVertical/index.vue";
import Logo from "@/assets/fractal.png";

import { useUserStore } from "../stores/useUserStore";

const userStore = useUserStore();
</script>
<template>
  <div class="h-dvh flex flex-col w-full">
    <header
      class="w-full sticky top-0 z-50 px-4 py-2 flex items-center justify-between shadow-card-sm"
    >
      <div>
        <ImageCore image-class="h-10" :src="Logo" />
      </div>
      <div>
        <AvatarCore
          :text="userStore.photo ?? userStore.fullName"
          shape="circle"
        />
      </div>
    </header>
    <LayoutStructure :show-container-footer="false" :show-right="false">
      <template #left>
        <NavVertical
          :avatar="userStore.photo ?? userStore.fullName"
          :full-name="userStore.fullName"
          :role="userStore.role"
        />
      </template>
      <section class="pb-5">
        <router-view />
      </section>
    </LayoutStructure>
  </div>
</template>
