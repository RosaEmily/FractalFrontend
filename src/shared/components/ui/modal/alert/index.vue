<script setup lang="ts">
import { computed, watch } from "vue";

import ButtonForm from "@/shared/components/core/buttons/index.vue";
import ModalCore from "@/shared/components/core/modal/index.vue";

import type { ModalAlertProps } from "./type";
import { SEVERITY } from "../constants";

const props = withDefaults(defineProps<ModalAlertProps>(), {
  showIcon: true,
  labelButton: "Cerrar",
  autoClose: true,
  autoCloseTime: 5000,
  buttonSize: "sm",
});

const show = defineModel<boolean | undefined>({
  default: false,
});

let timeoutId: ReturnType<typeof setTimeout> | null = null;

watch(
  () => show.value,
  (value) => {
    if (value && props.autoClose) {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        show.value = false;
      }, props.autoCloseTime);
    }
    if (!value && timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }
);

const config = computed(() => {
  const base = SEVERITY[props.severity];

  return {
    icon: props.icon ?? base.icon,
    title: props.title ?? base.title,
    content: props.content ?? base.content,
  };
});

const showIcon = computed(() => props.showIcon && config.value.icon);
</script>

<template>
  <ModalCore
    v-model="show"
    :class="'w-[20.5rem] rounded-3xl p-8 text-2xl font-bold'"
    modal
    :closable="false"
    :show-header="false"
    :pt="{
      mask: {
        style: {
          zIndex: '9999',
        },
      },
    }"
  >
    <template #container>
      <div class="space-y-5" :class="props.classContainer">
        <!-- 🔥 ICON -->
        <slot name="icon">
          <div class="flex items-center justify-center" v-if="showIcon">
            <Component
              :is="config.icon"
              :class="props.classIcon"
              class="!size-10"
            />
          </div>
        </slot>

        <!-- 🔥 TITLE -->
        <slot name="title">
          <div
            v-if="config.title"
            :class="classTitle"
            class="text-center text-secondary-600"
          >
            {{ config.title }}
          </div>
        </slot>

        <!-- 🔥 CONTENT -->
        <slot name="content">
          <div
            v-if="config.content"
            :class="classContent"
            class="text-lg font-normal text-secondary-600"
          >
            {{ config.content }}
          </div>
        </slot>

        <!-- BUTTON -->
        <ButtonForm
          :label="labelButton"
          :size="props.buttonSize"
          @click="show = false"
        />
      </div>
    </template>
  </ModalCore>
</template>
