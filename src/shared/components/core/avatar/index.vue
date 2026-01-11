<script setup lang="ts">
import { computed, h } from "vue";
import { Avatar } from "primevue";
import type { AvatarCoreProps } from "./type";

// Props originales
const props = withDefaults(defineProps<AvatarCoreProps>(), {});

const avatarProps = computed(() => {
  const baseProps: Record<string, unknown> = { ...props };
  if (props.text) {
    if (props.text.match(/\.(jpeg|jpg|gif|png|svg)$/)) {
      baseProps.image = props.text;
      baseProps.label = undefined;
    } else if (typeof props.text === "object") {
      baseProps.label = undefined;
      baseProps.image = undefined;
      baseProps.custom = props.text;
    } else if (typeof props.text === "string") {
      const words = props.text.trim().split(/\s+/).filter(Boolean);
      const firstThreeWords = words.slice(0, 2);
      const initials = firstThreeWords
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");
      baseProps.label = initials;
      baseProps.image = undefined;
    }
  }

  return baseProps;
});
</script>

<template>
  <Avatar v-if="!avatarProps.custom" v-bind="avatarProps" />
  <component v-else :is="avatarProps.custom" />
</template>
