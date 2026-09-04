<script setup lang="ts">
import { ref } from "vue";
import { LabelCore } from "@/shared/components";
import { useToastStore } from "@/shared/stores/useToastStore";

interface Props {
  label: string;
  hint?: string;
  /** Tamaño máximo en KB, según lo que valida el FormRequest de la API. */
  maxKb?: number;
  /** URL de la imagen ya guardada, al editar. */
  current?: string | null;
  accept?: string;
}

const props = withDefaults(defineProps<Props>(), {
  maxKb: 800,
  accept: "image/jpeg,image/png,image/webp,image/svg+xml",
});

const emit = defineEmits<{ (e: "select", file: File): void }>();

const fileInput = ref<HTMLInputElement | null>(null);
const preview = ref<string | null>(null);
const dragging = ref<boolean>(false);

const validateAndEmit = (file: File | undefined) => {
  if (!file) return;
  const toastStore = useToastStore();

  if (!props.accept.split(",").includes(file.type)) {
    toastStore.showToastError({ detail: "Formato de imagen no permitido." });
    return;
  }
  if (file.size > props.maxKb * 1024) {
    toastStore.showToastError({
      detail: `La imagen no debe superar los ${props.maxKb} KB.`,
    });
    return;
  }

  preview.value = URL.createObjectURL(file);
  emit("select", file);
};

const onChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  validateAndEmit(target.files?.[0]);
  // Permite reintentar con el mismo archivo tras un error.
  target.value = "";
};

const onDrop = (event: DragEvent) => {
  dragging.value = false;
  validateAndEmit(event.dataTransfer?.files?.[0]);
};
</script>

<template>
  <div>
    <LabelCore :text="label" />

    <div
      class="border-2 border-dashed rounded-adm-md px-6 py-5 flex flex-col items-center gap-2.5 bg-admin-bg transition-colors"
      :class="dragging ? 'border-primary-500' : 'border-line'"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <img
        v-if="preview || current"
        :src="preview ?? current ?? ''"
        alt=""
        class="max-h-24 object-contain"
      />

      <span class="text-adm-base text-secondary-900 font-semibold">
        Arrastra una imagen aquí
      </span>
      <span class="text-adm-sm text-secondary-400">o</span>
      <button
        type="button"
        class="px-4 py-2 bg-secondary-900 text-white border-none rounded-pill text-adm-sm font-semibold cursor-pointer"
        @click="fileInput?.click()"
      >
        Seleccionar archivo
      </button>

      <span v-if="hint" class="text-adm-sm text-secondary-400">
        {{ hint }}
      </span>
    </div>

    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      class="hidden"
      @change="onChange"
    />
  </div>
</template>
