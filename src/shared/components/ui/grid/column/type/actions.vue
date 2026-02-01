<script setup lang="ts" generic="T">
import { inject } from "vue";

import { GridKey, type GridUiColumnProps } from "@/shared/components/type";
import ButtonCore from "@/shared/components/core/buttons/index.vue";
import HeroCore from "@/shared/components/core/hero/index.vue";
import ToggleCore from "@/shared/components/core/toggle/index.vue";

import { useToastStore } from "@/shared/stores/useToastStore";
import { useConfirmStore } from "@/shared/stores/useConfirmStore";

import { mdiTrashCanOutline, mdiPencil } from "@mdi/js";
import { RouterLink } from "vue-router";
import { buildRedirectPath } from "../../utils/replace";
import type { Action } from "../type";
import { safeRequest } from "@/shared/utils/request";

const gridKey = inject(GridKey);

const toastStore = useToastStore();
const confirmStore = useConfirmStore();

const props = withDefaults(
  defineProps<{ col: GridUiColumnProps<T>; data: any }>(),
  {},
);

const normalizeAction = (action: Action): Action => {
  const base = {
    ...action,
    columnKeyId: "id",
  };
  const configByType: Record<string, Partial<Action>> = {
    edit: {
      icon: action.icon ?? mdiPencil,
      params: action.params ?? "id",
    },
    delete: {
      icon: action.icon ?? mdiTrashCanOutline,
      buttonProps: {
        severity: "danger",
      },
    },
    state: {
      columnKey: "status",
    },
  };
  return {
    ...base,
    ...(configByType[action.type] ?? {}),
  };
};

const getRedirectHref = (action: Action) => {
  const { redirect = "", params = null } = action;
  return buildRedirectPath(redirect, props.data, params);
};

const onChangeState = async (action: Action, state?: string | boolean) => {
  if (state == undefined) return;

  const { columnKey = "status", columnKeyId = "id" } = action;

  gridKey?.setLoading(true);

  const ids = [props.data[columnKeyId]];
  const normalizedState = state === "1" || state === true ? 1 : 0;

  const { status, error } = await safeRequest(() => {
    if (!action?.handler) {
      return Promise.resolve(null);
    }
    return Promise.resolve(action.handler(ids, normalizedState));
  });

  if (status && !error) {
    props.data[columnKey] = String(normalizedState);
    normalizedState === 1
      ? toastStore.showToastSuccess({
          summary: "Actualización de estado",
          detail: "El registro fue habilitado correctamente.",
        })
      : toastStore.showToastError({
          summary: "Actualización de estado",
          detail: "El registro fue deshabilitado.",
        });
  }

  gridKey?.setLoading(false);
};

const onClick = async (action: Action) => {
  const { columnKeyId = "id" } = action;
  const ids = [props.data[columnKeyId]];
  if (action.type == "delete") {
    confirmStore.confirmDelete({
      accept: async () => {
        const { status, error } = await safeRequest(() => {
          if (!action?.handler) {
            return Promise.resolve(null);
          }
          return Promise.resolve(action.handler(ids));
        });
        if (status && !error) {
          toastStore.showToastError({
            summary: "Eliminación",
            detail: "El registro fue eliminado correctamente.",
          });
          gridKey?.refreshData();
        }
      },
    });
  } else {
    action?.handler?.(ids);
  }
};
</script>
<template>
  <div class="flex gap-2 items-center">
    <template v-for="(rawAction, index) in col.actions" :key="index">
      <ButtonCore
        v-if="rawAction.type == 'delete' || rawAction.type == 'button'"
        v-bind="normalizeAction(rawAction).buttonProps"
        @click="onClick(normalizeAction(rawAction))"
        class="!p-1"
      >
        <template #icon v-if="normalizeAction(rawAction).icon">
          <HeroCore :path="normalizeAction(rawAction).icon" size="20" />
        </template>
      </ButtonCore>
      <ButtonCore
        v-if="rawAction.type == 'redirect' || rawAction.type == 'edit'"
        v-bind="normalizeAction(rawAction).buttonProps"
        :to="getRedirectHref(normalizeAction(rawAction))"
        as="RouterLink"
        class="!p-1"
      >
        <template #icon v-if="normalizeAction(rawAction).icon">
          <HeroCore :path="normalizeAction(rawAction).icon" size="20" />
        </template>
      </ButtonCore>
      <ToggleCore
        v-if="rawAction.type == 'state'"
        :model-value="
          String(data[normalizeAction(rawAction).columnKey ?? 'status'])
        "
        @update:model-value="onChangeState(normalizeAction(rawAction), $event)"
        :true-value="'1'"
        :false-value="'0'"
      />
    </template>
  </div>
</template>
