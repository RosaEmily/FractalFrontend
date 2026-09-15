<script setup lang="ts">
import ItemNavVertical from "./item.vue";
import type { MenuItem } from "@/modules/admin/interface/nav-vertical";

withDefaults(
  defineProps<{
    menu: MenuItem[];
    isCollapsed?: boolean;
    openGroups: Set<string | number>;
  }>(),
  {
    isCollapsed: false,
  }
);

const emit = defineEmits<{
  (e: "menu-click", item: MenuItem): void;
  (e: "toggle-group", id: string | number): void;
}>();
</script>

<template>
  <ul class="space-y-2">
    <ItemNavVertical
      v-for="item in menu"
      :key="item.id"
      :item="item"
      :is-collapsed="isCollapsed"
      :open-groups="openGroups"
      @menu-click="emit('menu-click', $event)"
      @toggle-group="emit('toggle-group', $event)"
    />
  </ul>
</template>
