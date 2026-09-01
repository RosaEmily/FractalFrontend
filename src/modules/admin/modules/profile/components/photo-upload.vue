<script setup lang="ts">
import { ref } from "vue";
import { useToastStore } from "@/shared/stores/useToastStore";

const emit = defineEmits<{ (e: "select", file: File): void }>();

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png"];

const fileInput = ref<HTMLInputElement | null>(null);
const dragging = ref<boolean>(false);
const fileName = ref<string | null>(null);

const validateAndEmit = (file: File | undefined) => {
  if (!file) return;
  const toastStore = useToastStore();

  if (!ALLOWED.includes(file.type)) {
    toastStore.showToastError({ detail: "La imagen debe ser JPG o PNG." });
    return;
  }
  if (file.size > MAX_BYTES) {
    toastStore.showToastError({ detail: "La imagen no debe superar los 2 MB." });
    return;
  }

  fileName.value = file.name;
  emit("select", file);
};

const onPick = () => fileInput.value?.click();

const onChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  validateAndEmit(target.files?.[0]);
  // Permite volver a elegir el mismo archivo tras un error.
  target.value = "";
};

const onDrop = (event: DragEvent) => {
  dragging.value = false;
  validateAndEmit(event.dataTransfer?.files?.[0]);
};
</script>

<template>
  <div>
    <p
      class="font-mono text-adm-xs text-secondary-400 tracking-widest uppercase"
    >
      Fotografía
    </p>
    <p class="text-adm-base text-secondary-500 mt-2 mb-3.5 leading-relaxed">
      Imagen cuadrada, mínimo 200×200px. JPG o PNG hasta 2MB.
    </p>

    <div
      class="border-2 border-dashed rounded-adm-md px-6 py-6 flex flex-col items-center gap-2.5 bg-admin-bg transition-colors"
      :class="dragging ? 'border-primary-500' : 'border-line'"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <span class="text-primary-500 text-2xl leading-none">+</span>
      <span class="text-adm-base text-secondary-900 font-semibold">
        Arrastra una imagen aquí
      </span>
      <span class="text-adm-sm text-secondary-400">o</span>
      <button
        type="button"
        class="px-4 py-2 bg-secondary-900 text-white border-none rounded-pill text-adm-sm font-semibold cursor-pointer"
        @click="onPick"
      >
        Seleccionar archivo
      </button>

      <span v-if="fileName" class="text-adm-sm text-secondary-500 mt-1">
        {{ fileName }}
      </span>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png"
      class="hidden"
      @change="onChange"
    />
  </div>
</template>
