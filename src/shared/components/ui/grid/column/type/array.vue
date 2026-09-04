<script lang="ts" setup>
import { computed } from "vue";
import { safeJsonStringify } from "@/shared/utils/safe-json";

const props = withDefaults(
  defineProps<{
    items: unknown[];
    keyToRender?: string;
    keySeparator?: string;
    displaySeparator?: string;
    /** Cuántos chips se muestran antes de agrupar el resto en "+N". */
    maxVisible?: number;
    tone?: "accent" | "neutral";
    /** Antepone el índice al chip, para columnas donde el orden importa. */
    numbered?: boolean;
  }>(),
  { maxVisible: 4, tone: "accent", numbered: false },
);

/** Clases literales: Tailwind no detecta nombres construidos en runtime. */
const TONE_CLASS = {
  accent: "text-primary-600 bg-accent-soft",
  neutral: "text-secondary-500 bg-admin-bg border border-line",
} as const;

const getDisplayValue = (
  rawValue: unknown,
  keyToRender?: string,
  keySeparator: string = ",",
  displaySeparator: string = " ",
): string | undefined => {
  if (rawValue == null) return undefined;

  if (keyToRender && typeof rawValue === "object" && rawValue !== null) {
    const keys = keyToRender.split(keySeparator).map((k) => k.trim());
    const source = rawValue as Record<string, unknown>;
    const values = keys.map((k) => source[k]).filter((v) => v !== undefined);
    return values.length
      ? values.join(displaySeparator)
      : safeJsonStringify(rawValue);
  }

  return typeof rawValue === "object"
    ? safeJsonStringify(rawValue)
    : String(rawValue);
};

const labels = computed(() =>
  props.items.map((item) =>
    getDisplayValue(
      item,
      props.keyToRender,
      props.keySeparator,
      props.displaySeparator,
    ),
  ),
);

const visible = computed(() => labels.value.slice(0, props.maxVisible));
const hidden = computed(() => Math.max(0, labels.value.length - props.maxVisible));
</script>

<template>
  <!--
    El diseño muestra los valores como chips (mono, tinte del accent) con un
    contador "+N" punteado para los que no entran, no como lista con viñetas.
  -->
  <span v-if="!labels.length" class="font-mono text-adm-sm text-secondary-400">
    —
  </span>

  <div v-else class="flex flex-wrap gap-1">
    <span
      v-for="(label, idx) in visible"
      :key="idx"
      class="font-mono text-adm-xs font-semibold px-1.5 py-0.5 rounded-adm-sm tracking-wide"
      :class="TONE_CLASS[tone]"
    >
      <span v-if="numbered" class="opacity-60">{{ idx + 1 }}. </span>
      {{ label }}
    </span>

    <span
      v-if="hidden"
      class="font-mono text-adm-xs text-secondary-400 px-1.5 py-0.5 border border-dashed border-line rounded-adm-sm"
    >
      +{{ hidden }}
    </span>
  </div>
</template>
