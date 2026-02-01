<script setup lang="ts">
import type { HeaderProps } from "./type";

defineProps<HeaderProps>();
</script>

<template>
  <h1 class="text-xl font-bold text-secondary-600">
    <slot name="title">
      {{ title }}
    </slot>
  </h1>
</template>
