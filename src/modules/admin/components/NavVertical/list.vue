<script setup lang="ts">
import ItemNavVertical from "./item.vue";
import type { MenuItem } from "@/modules/admin/interface/nav-vertical";

withDefaults(
  defineProps<{
    menu: MenuItem[];
    isCollapsed?: boolean;
  }>(),
  {
    isCollapsed: false,
  }
);

const emit = defineEmits<{
  (e: "menu-click", item: MenuItem): void;
}>();
</script>

<template>
  <ul class="gap-y-2">
    <ItemNavVertical
      v-for="item in menu"
      :key="item.id"
      :item="item"
      :is-collapsed="isCollapsed"
      @menu-click="emit('menu-click', $event)"
    />
  </ul>
</template>
