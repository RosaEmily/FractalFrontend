<script setup lang="ts">
import { Image } from "primevue";
import type { ImageCoreProps } from "./type";

const props = withDefaults(defineProps<ImageCoreProps>(), {});
</script>

<template>
  <Image v-bind="props" />
</template>
