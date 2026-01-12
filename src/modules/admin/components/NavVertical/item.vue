<script setup lang="ts">
import { mdiChevronUp, mdiChevronDown } from "@mdi/js";
import { HeroCore } from "@/shared/components";
import ListNavVertical from "./list.vue";
import type { MenuItem } from "@/modules/admin/interface/nav-vertical";

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

const menuClick = () => {
  const { item, isCollapsed } = props;
  if (item.children?.length) {
    if (!isCollapsed) {
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
      item.children?.length
        ? item.show
          ? 'bg-white'
          : 'hover:bg-white'
        : item.show
          ? 'bg-green-400'
          : 'hover:bg-green-400',
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
      :path="item.show ? mdiChevronUp : mdiChevronDown"
      size="20"
    />
  </li>
  <ListNavVertical
    v-show="item.children?.length && item.show && !isCollapsed"
    class="ml-6 pl-3 border-l-[1px] border-gray-400"
    :menu="item.children ?? []"
    :is-collapsed="isCollapsed"
    @menu-click="emit('menu-click', $event)"
  />
</template>
