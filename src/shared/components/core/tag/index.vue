<script setup lang="ts">
import type { TagCoreProps } from "./type";
import { Tag } from "primevue";
const props = withDefaults(defineProps<TagCoreProps>(), {});
</script>
<template>
  <Tag v-bind="props" />
</template>
