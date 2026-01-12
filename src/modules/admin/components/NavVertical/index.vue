<script setup lang="ts">
import { ContentWrapperUi, AvatarCore } from "@/shared/components";
import ListNavVertical from "./list.vue";
import { ref } from "vue";
import { MENU } from "../../constants/menu";
import { useRouter } from "vue-router";
import type { MenuItem } from "../../interface/nav-vertical";
const router = useRouter();

const props = withDefaults(
  defineProps<{
    avatar?: string;
    fullName?: string;
    role?: string;
  }>(),
  {
    avatar: "",
    fullName: "",
    role: "",
  }
);
const isCollapsed = ref(false);
const menu = ref<MenuItem[]>(MENU);

const onRedirect = (item: MenuItem) => {
  if (!item.route) return;
  router.push(item.route);
};
</script>
<template>
  <ContentWrapperUi class="w-72 !h-auto">
    <template #header>
      <div class="flex gap-5 items-center">
        <div>
          <AvatarCore size="large" :text="avatar" shape="circle" />
        </div>
        <div class="text-sm">
          <div>
            {{ fullName }}
          </div>
          <div>
            {{ role }}
          </div>
        </div>
      </div>
    </template>
    <template #container>
      <ListNavVertical
        :menu="menu"
        :isCollapsed="isCollapsed"
        @menu-click="onRedirect"
      />
    </template>
  </ContentWrapperUi>
</template>
