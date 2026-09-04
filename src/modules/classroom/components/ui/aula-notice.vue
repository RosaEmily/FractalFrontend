<script setup lang="ts">
import { computed } from "vue";
import { HeroCore } from "@/shared/components";
import { mdiFlagOutline } from "@mdi/js";

const props = withDefaults(
  defineProps<{
    title?: string;
    tone?: "info" | "warning" | "danger" | "success";
    icon?: string;
  }>(),
  { tone: "warning", icon: mdiFlagOutline },
);

const TONES: Record<string, string> = {
  info: "bg-info-soft border-info-DEFAULT/25 text-info-DEFAULT",
  warning: "bg-amber-soft border-amber-DEFAULT/25 text-amber-DEFAULT",
  danger: "bg-danger-soft border-danger-DEFAULT/25 text-danger-DEFAULT",
  success: "bg-success-soft border-success-DEFAULT/25 text-success-DEFAULT",
};

const toneClass = computed(() => TONES[props.tone] ?? TONES.warning);
</script>

<template>
  <div class="flex items-start gap-3 px-4 py-3 border rounded-adm-md" :class="toneClass">
    <HeroCore :path="icon" class="size-4 shrink-0 mt-0.5" />
    <div class="min-w-0 flex-1">
      <p v-if="title" class="font-semibold text-adm-base">{{ title }}</p>
      <div class="text-adm-sm leading-relaxed" :class="title ? 'mt-1' : ''">
        <slot />
      </div>
    </div>
    <div class="shrink-0"><slot name="action" /></div>
  </div>
</template>
