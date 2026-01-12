<script setup lang="ts">
import { mdiChevronUp, mdiChevronDown } from "@mdi/js";
import { HeroCore } from "@/shared/components";
import ListNavVertical from "./list.vue";

import type { MenuItem } from "@/modules/admin/interface/nav-vertical";

import { useRoute } from "vue-router";
import type { RouteLocationRaw } from "vue-router";

import { computed } from "vue";

const route = useRoute();

const props = withDefaults(
  defineProps<{
    item: MenuItem;
    isCollapsed?: boolean;
  }>(),
  {
    isCollapsed: false,
  }
);

const emit = defineEmits<{
  (e: "menu-click", item: MenuItem): void;
}>();

const getRouteName = (route?: RouteLocationRaw | null): string | null => {
  if (!route || typeof route === "string") return null;
  if ("name" in route) return route.name as string;
  return null;
};

const isActive = computed(() => {
  const { item } = props;
  if (!item.route) return false;
  return route.name === getRouteName(item.route);
});

const hasActiveChild = (items?: MenuItem[]): boolean => {
  if (!items?.length) return false;
  return items.some((item) => {
    if (getRouteName(item.route) === route.name) {
      return true;
    }
    return hasActiveChild(item.children);
  });
};

const show = computed(() => {
  const { item } = props;
  if (!item.children?.length) return false;
  if (item.show !== undefined) {
    return item.show;
  }
  return hasActiveChild(item.children);
});

const hasChildren = computed(() => {
  return !!props.item.children?.length;
});

const menuClick = () => {
  const { item, isCollapsed } = props;
  if (item.children?.length) {
    if (!isCollapsed) {
      if (item.show === undefined) {
        item.show = show.value;
      }
      item.show = !item.show;
    }
  } else {
    emit("menu-click", item);
  }
};
</script>

<template>
  <li
    :class="[
      'rounded-lg cursor-pointer flex items-center justify-between p-2',
      {
        'bg-white': hasChildren && show,
        'hover:bg-white': hasChildren && !show,
        'bg-gray-300': !hasChildren && isActive,
        'hover:bg-gray-300': !hasChildren && !isActive,
      },
      ,
    ]"
    @click="menuClick"
  >
    <div class="flex gap-2 items-center">
      <HeroCore v-if="item.icon" :path="item.icon" size="20" />
      <span v-show="!isCollapsed">
        {{ item.label }}
      </span>
    </div>

    <HeroCore
      v-show="!isCollapsed && item.children?.length"
      :path="show ? mdiChevronUp : mdiChevronDown"
      size="20"
    />
  </li>
  <ListNavVertical
    v-show="hasChildren && show && !isCollapsed"
    class="ml-4 pl-3 border-l-[1px] border-gray-400"
    :menu="item.children ?? []"
    :is-collapsed="isCollapsed"
    @menu-click="emit('menu-click', $event)"
  />
</template>
