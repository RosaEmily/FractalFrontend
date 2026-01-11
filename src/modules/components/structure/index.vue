<script lang="ts" setup>
import type { ClassNameValue } from "@/shared/interface/class";

import StructureDefault from "./Default.vue";
import StructureFooterInside from "./FooterInside.vue";

interface StructureProps {
  classMain?: ClassNameValue;
  classContainer?: ClassNameValue;
  classFooter?: ClassNameValue;

  type?: "default" | "footer-inside";
  showLeft?: boolean;
  showHeader?: boolean;
  showContainer?: boolean;
  showRight?: boolean;
  showFooter?: boolean;
  showContainerFooter?: boolean;
}

const props = withDefaults(defineProps<StructureProps>(), {
  type: "default",
  showLeft: true,
  showHeader: true,
  showContainer: true,
  showRight: true,
  showFooter: true,
  showContainerFooter: true,
});

const layoutMap = {
  default: StructureDefault,
  "footer-inside": StructureFooterInside,
};
</script>

<template>
  <component :is="layoutMap[type]" v-bind="props">
    <template #left v-if="showLeft">
      <slot name="left" />
    </template>

    <template #header v-if="showHeader">
      <slot name="header" />
    </template>

    <template #container v-if="showContainer">
      <slot name="container" />
    </template>

    <template #right v-if="showRight">
      <slot name="right" />
    </template>

    <template #footer v-if="showFooter">
      <slot name="footer" />
    </template>

    <template #container-footer v-if="showContainerFooter">
      <slot name="container-footer" />
    </template>

    <slot />
  </component>
</template>
