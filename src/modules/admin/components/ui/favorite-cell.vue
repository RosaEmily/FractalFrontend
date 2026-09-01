<script setup lang="ts">
import { HeroCore } from "@/shared/components";
import { mdiStar } from "@mdi/js";

/** Columna "Destacado" del diseño: estrella accent, o guion si no lo es. */
defineProps<{ favorite: boolean | number }>();
</script>

<template>
  <HeroCore
    v-if="Number(favorite) === 1"
    :path="mdiStar"
    class="size-4 text-primary-500"
  />
  <span v-else class="text-secondary-400">—</span>
</template>
