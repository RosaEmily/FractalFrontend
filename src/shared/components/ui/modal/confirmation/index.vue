<script setup lang="ts">
import { computed } from "vue";

import ButtonForm from "@/shared/components/core/buttons/index.vue";
import ModalCore from "@/shared/components/core/modal/index.vue";

import IconX from "@/shared/icons/X.vue";
import type { ModalConfirmationProps, ModalConfirmationEmits } from "./type";
import { DEFAULT_CANCEL, DEFAULT_CONFIRM } from "./constants";

const props = withDefaults(defineProps<ModalConfirmationProps>(), {
  iconShow: true,
  closeShow: true,
  buttonCancelShow: true,
  buttonConfirmShow: true,
  customHeight: "",
});

const closeIcon = computed(() => props.closeIcon ?? IconX);

const show = defineModel<boolean | undefined>({
  default: false,
});

const emit = defineEmits<ModalConfirmationEmits>();

const iconShow = computed(() => props.iconShow && props.icon);

const wrapperClasses = computed(() => {
  let base = "absolute cursor-pointer z-50";

  base += props.closeIsOutside ? " -top-12 right-0" : " top-4 right-4";

  if (props.closeHasBg) {
    base += " bg-secondary-600 p-3 rounded-full";
  }

  return `${base} ${props.closeWrapperClass ?? ""}`;
});

const iconClasses = computed(() => {
  let base = props.closeHasBg ? " fill-white" : " fill-secondary-500";

  return `!size-3 ${base} ${props.closeIconClass ?? ""}`;
});

const cancelButtonProps = computed(() => ({
  ...DEFAULT_CANCEL,
  ...props.buttonCancel,
}));

const confirmButtonProps = computed(() => ({
  ...DEFAULT_CONFIRM,
  ...props.buttonConfirm,
}));

const headerContainerClasses = computed(
  () => props.headerContainerClass ?? "px-8 pt-10 space-y-5"
);

const descriptionContainerClasses = computed(
  () =>
    props.descriptionContainerClass ??
    "pl-8 pr-6 py-2 my-2 overflow-y-auto min-h-0 space-y-5 mr-2"
);
</script>

<template>
  <ModalCore
    v-model="show"
    class="w-[30rem] rounded-3xl text-2xl font-bold text-secondary-600"
    modal
    :show-header="false"
    :closable="false"
    :pt="{
      mask: {
        style: {
          zIndex: '9999',
        },
      },
    }"
  >
    <template #container>
      <div v-if="closeShow" :class="wrapperClasses" @click="show = false">
        <component :is="closeIcon" :class="iconClasses" />
      </div>
      <div
        class="flex flex-col max-h-dvh"
        :class="props.customHeight ? props.customHeight : ''"
      >
        <div :class="headerContainerClasses">
          <slot name="icon">
            <div class="flex items-center justify-center" v-if="iconShow">
              <component :is="icon" class="!size-10" :class="iconClass" />
            </div>
          </slot>

          <slot name="title">
            <div
              v-if="title"
              class="text-center text-secondary-600 text-2xl"
              :class="titleClass"
            >
              {{ title }}
            </div>
          </slot>
        </div>

        <div
          :class="[
            descriptionContainerClasses,
            props.customHeight ? 'flex-1 min-h-0' : '',
          ]"
        >
          <slot name="description">
            <div
              v-if="description"
              class="text-base font-normal text-secondary-600"
              :class="descriptionClass"
            >
              {{ description }}
            </div>
          </slot>

          <slot name="content-extra-description" />
        </div>

        <slot name="content-extra" />

        <slot name="buttons">
          <div
            class="flex gap-2 py-6 px-8"
            :class="[
              footerContainerClass,
              {
                'shadow-[0_0.125rem_1.5rem_0.0625rem_#373C414D] rounded-tr-2xl rounded-tl-2xl':
                  footerBorderShadow,
              },
            ]"
          >
            <ButtonForm
              v-if="buttonCancelShow && cancelButtonProps"
              v-bind="cancelButtonProps"
              @click="emit('cancel')"
            />

            <ButtonForm
              v-if="buttonConfirmShow && confirmButtonProps"
              v-bind="confirmButtonProps"
              @click="emit('confirm')"
            />
          </div>
        </slot>
      </div>
    </template>
  </ModalCore>
</template>
