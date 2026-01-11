<script lang="ts" setup>
import { ModalAlertUi } from "@/shared/components";
import { useAlertStore } from "@/shared/stores/useAlertStore";
import { computed } from "vue";

const alertStore = useAlertStore();
const config = computed(() => alertStore.config);
</script>
<template>
  <ModalAlertUi
    v-model="alertStore.showAlertModal"
    :severity="config.severity"
    :icon="config.icon"
    :show-icon="config.showIcon"
    :class-icon="config.classIcon"
    :title="config.title"
    :content="config.content"
    :label-button="config.labelButton"
    :auto-close="config.autoClose"
    :auto-close-time="config.autoCloseTime"
    class-content="!text-sm !font-normal"
    class-title="!text-[1.625rem] !font-bold"
  />
</template>
