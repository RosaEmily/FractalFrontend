<script lang="ts" setup>
import { safeJsonStringify } from "@/shared/utils/safe-json";

const props = defineProps<{
  items: unknown[];
  keyToRender?: string;
  keySeparator?: string;
  displaySeparator?: string;
}>();

const getDisplayValue = (
  rawValue: unknown,
  keyToRender?: string,
  keySeparator: string = ",",
  displaySeparator: string = " ",
): string | undefined => {
  if (rawValue == null) return undefined;

  if (keyToRender && typeof rawValue === "object" && rawValue !== null) {
    const keys = keyToRender.split(keySeparator).map((k) => k.trim());
    const values = keys.map((k) => rawValue[k]).filter((v) => v !== undefined);
    return values.length
      ? values.join(displaySeparator)
      : safeJsonStringify(rawValue);
  }

  return typeof rawValue === "object"
    ? safeJsonStringify(rawValue)
    : String(rawValue);
};
</script>

<template>
  <span v-if="items.length === 1">
    {{ getDisplayValue(items[0], keyToRender, keySeparator, displaySeparator) }}
  </span>
  <ul v-else class="list-disc pl-4">
    <li v-for="(item, idx) in items" :key="idx">
      {{ getDisplayValue(item, keyToRender, keySeparator, displaySeparator) }}
    </li>
  </ul>
</template>
