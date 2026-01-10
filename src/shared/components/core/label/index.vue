<script setup lang="ts">
import type { LabelCoreProps } from "./type";
withDefaults(defineProps<LabelCoreProps>(), { htmlFor: "" });
</script>
<template>
  <label :for="htmlFor" class="block text-xs font-medium text-gray-900">
    {{ text }}
  </label>
</template>
