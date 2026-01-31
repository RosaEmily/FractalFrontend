<script setup lang="ts">
import { DatePicketCore } from "@/shared/components";
import { ref } from "vue";

const model = ref();
</script>
<template>
  <DatePicketCore
    v-model="model"
    selection-mode="range"
    date-utc
    dayjsFormatValue="YYYY-MM-DD HH:mm:ss"
    hourFormat="12"
  />
</template>
