<script setup lang="ts">
import { Toast } from "primevue";
import { useToastStore } from "@/shared/stores/useToastStore";
import { computed } from "vue";
const toastStore = useToastStore();
const toastOptions = computed(() => toastStore.toastOptions);
</script>
<template>
  <!-- <Toast
    group="notification"
    :position="toastOptions.position"
    :pt="{
      root: {
        class: '!w-[50.25rem]',
      },
    }"
  >
    <template #container="{ message, closeCallback }">
      <NotificationCore
        :label="message.detail"
        :severity="message.severity"
        :closable="toastOptions.closable"
        :showIcon="toastOptions.showIcon"
        @close="closeCallback"
      />
    </template>
  </Toast> -->
  <Toast :position="toastOptions.position" :group="toastOptions.group" />
</template>
