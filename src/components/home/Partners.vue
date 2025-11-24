<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <section class="bg-primary-500 py-8 md:py-10">
    <div class=" relative w-full overflow-hidden">
      <div class="flex animate-scroll">
        <template v-if="skeleton">
          <div v-for="item in 10" :key="item" class="h-20 md:h-24 lg:h-26 xl:h-28 w-auto mx-24 rounded-lg flex items-center justify-center text-white text-6xl text-center font-extrabold bg-primary-500">
            <span class="blur-md whitespace-nowrap"> Partner{{ item }}</span>
          </div>
        </template>
        <template v-else v-for="loop in 2" :key="loop">
          <img v-for="(item, n) in partners" :key="`${loop}-${n}`" :src="item.image" :alt="item.imageAlt" class="h-20 md:h-24 lg:h-26 xl:h-28 w-auto mx-4 rounded-lg"/>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { Partner } from '@/types/partner';

  defineProps<{ 
    partners: Partner[],
    skeleton: boolean
  }>()
</script>

<style scoped>
  @keyframes scroll {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }

  .animate-scroll {
    display: flex;
    width: 350%;
    animation: scroll 20s linear infinite;
  }

  /*.animate-scroll:hover {
    animation-play-state: paused;
  }*/
</style>