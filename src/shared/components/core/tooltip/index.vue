<script lang="ts" setup>
import { computed } from "vue";
import type { TooltipCoreProps } from "./type";

const props = defineProps<TooltipCoreProps>();

const tooltipConfig = computed(() => ({
  value: props.value ?? "",
  disabled: !props.value || props.disabled,
  id: props.id,
  class: props.class,
  escape: props.escape ?? true,
  fitContent: props.fitContent ?? true,
  showDelay: props.showDelay ?? 0,
  hideDelay: props.hideDelay ?? 0,
  autoHide: props.autoHide ?? true,
}));

const position = computed(() => props.position ?? "top");
const tag = computed(() => props.tag ?? "div");
</script>

<template>
  <!-- TOP -->
  <component
    v-if="position === 'top'"
    :is="tag"
    v-tooltip.top="tooltipConfig"
    :class="[{ 'cursor-pointer': !!tooltipConfig.value }, props.class]"
  >
    <slot />
  </component>

  <!-- RIGHT -->
  <component
    v-else-if="position === 'right'"
    :is="tag"
    v-tooltip.right="tooltipConfig"
    :class="[{ 'cursor-pointer': !!tooltipConfig.value }, props.class]"
  >
    <slot />
  </component>

  <!-- BOTTOM -->
  <component
    v-else-if="position === 'bottom'"
    :is="tag"
    v-tooltip.bottom="tooltipConfig"
    :class="[{ 'cursor-pointer': !!tooltipConfig.value }, props.class]"
  >
    <slot />
  </component>

  <!-- LEFT -->
  <component
    v-else-if="position === 'left'"
    :is="tag"
    v-tooltip.left="tooltipConfig"
    :class="[{ 'cursor-pointer': !!tooltipConfig.value }, props.class]"
  >
    <slot />
  </component>
</template>
