<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <section class="bg-primary-500 py-8">
    <div class=" relative w-full overflow-hidden">
      <div class="flex animate-scroll">
        <template v-for="loop in 2" :key="loop">
          <img v-for="(img, n) in sponsors" :key="`${loop}-${n}`" :src="img" class="h-12 sm:h-16 md:h-20 lg:h-24 xl:h-28 w-auto mx-4 rounded-lg" />
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  defineProps<{ sponsors: string[] }>()
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