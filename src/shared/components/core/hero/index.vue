<script setup lang="ts">
import SvgIcon from "@jamescoyle/vue-icon";
import type { HeroCoreProps } from "../hero/type";

withDefaults(defineProps<HeroCoreProps>(), {});
</script>
<template>
  <SvgIcon type="mdi" :path="path" />
</template>
