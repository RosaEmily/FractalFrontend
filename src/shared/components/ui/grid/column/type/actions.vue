<script setup lang="ts" generic="T">
import type { GridUiColumnProps } from "@/shared/components/type";
import ButtonCore from "@/shared/components/core/buttons/index.vue";
import HeroCore from "@/shared/components/core/hero/index.vue";
import { mdiTrashCanOutline, mdiPencil } from "@mdi/js";
import { RouterLink } from "vue-router";
import { buildRedirectPath } from "../../utils/replace";
import type { Action } from "../type";

const props = withDefaults(
  defineProps<{ col: GridUiColumnProps<T>; data: any }>(),
  {},
);

const normalizeAction = (action: Action) => {
  if (action.type === "edit") {
    return {
      ...action,
      icon: action.icon ?? mdiPencil,
      params: action.params ?? "id",
    };
  } else if (action.type === "delete") {
    return {
      ...action,
      icon: action.icon ?? mdiTrashCanOutline,
      buttonProps: {
        severity: "danger",
      },
    };
  }

  return {
    ...action,
  };
};

const getRedirectHref = (action: Action) => {
  const { redirect = "", params = null } = action;
  return buildRedirectPath(redirect, props.data, params);
};
</script>
<template>
  <div class="flex gap-2">
    <template v-for="(rawAction, index) in col.actions" :key="index">
      <ButtonCore
        v-if="rawAction.type == 'delete' || rawAction.type == 'button'"
        v-bind="normalizeAction(rawAction).buttonProps"
        class="!p-1"
      >
        <template #icon v-if="normalizeAction(rawAction).icon">
          <HeroCore :path="normalizeAction(rawAction).icon" size="20" />
        </template>
      </ButtonCore>
      <RouterLink
        v-if="rawAction.type == 'redirect' || rawAction.type == 'edit'"
        :to="getRedirectHref(normalizeAction(rawAction))"
      >
        <ButtonCore
          v-bind="normalizeAction(rawAction).buttonProps"
          class="!p-1"
        >
          <template #icon v-if="normalizeAction(rawAction).icon">
            <HeroCore :path="normalizeAction(rawAction).icon" size="20" />
          </template>
        </ButtonCore>
      </RouterLink>
    </template>
  </div>
</template>
