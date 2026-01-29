<script setup lang="ts">
import ConfirmDialog from "primevue/confirmdialog";
import { mdiHelp } from "@mdi/js";

import HeroCore from "../hero/index.vue";
import ButtonCore from "../buttons/index.vue";

import { useConfirmStore } from "@/shared/stores/useConfirmStore";
import { computed } from "vue";
const confirmStore = useConfirmStore();

const confirmationOptions = computed(() => confirmStore.confirmationOptions);
</script>
<template>
  <ConfirmDialog />
  <ConfirmDialog group="confirmation">
    <template #container="{ message, acceptCallback, rejectCallback }">
      <div class="flex flex-col gap-4 items-center p-6 rounded">
        <div
          class="rounded-full bg-gray-950 text-primary-contrast inline-flex justify-center items-center size-20 -mt-16"
        >
          <HeroCore :path="mdiHelp" size="40" class="text-white" />
        </div>
        <div class="text-center space-y-1">
          <div class="font-bold text-2xl">
            {{ message.header }}
          </div>
          <div>{{ message.message }}</div>
        </div>
        <div class="grid grid-cols-2 gap-2 items-center w-full">
          <ButtonCore
            :label="confirmationOptions.acceptLabel"
            severity="contrast"
            variant="outlined"
            @click="acceptCallback"
          />
          <ButtonCore
            :label="confirmationOptions.rejectLabel"
            severity="contrast"
            @click="rejectCallback"
          />
        </div>
      </div>
    </template>
  </ConfirmDialog>
</template>
