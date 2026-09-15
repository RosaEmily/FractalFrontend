<script setup lang="ts">
import type { LabelCoreProps } from "./type";
withDefaults(defineProps<LabelCoreProps>(), { htmlFor: "" });
</script>
<template>
  <label
    :for="htmlFor"
    class="flex items-baseline gap-1.5 mb-1.5 text-adm-base font-semibold text-secondary-900"
  >
    {{ text }}
    <span v-if="required" class="text-danger-DEFAULT text-adm-sm">*</span>
    <span
      v-if="hint"
      class="text-adm-sm font-normal text-secondary-400"
    >
      · {{ hint }}
    </span>
  </label>
</template>
