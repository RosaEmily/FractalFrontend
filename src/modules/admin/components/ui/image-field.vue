<script setup lang="ts">
import { computed, ref } from "vue";
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
  /**
   * `avatar` muestra la vista previa en círculo y en pequeño: es para fotos de
   * persona, donde una imagen ancha no dice nada. `wide` es el default, para
   * banners y logos.
   */
  variant?: "wide" | "avatar";
  /** Iniciales del nombre, para el hueco del avatar cuando no hay foto. */
  fallbackText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  maxKb: 800,
  accept: "image/jpeg,image/png,image/webp,image/svg+xml",
  variant: "wide",
});

const emit = defineEmits<{
  (e: "select", file: File): void;
  (e: "clear"): void;
}>();

const isAvatar = computed(() => props.variant === "avatar");

/** Quita la selección para volver a la imagen guardada (o al hueco vacío). */
const onClear = () => {
  preview.value = null;
  emit("clear");
};

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
      <!-- Foto de persona: círculo, y con iniciales cuando aún no hay imagen. -->
      <template v-if="isAvatar">
        <img
          v-if="preview || current"
          :src="preview ?? current ?? ''"
          alt=""
          class="size-23 rounded-pill object-cover"
        />
        <span
          v-else
          class="grid size-23 place-items-center rounded-pill bg-surface-cream font-display text-2xl font-bold text-secondary-400"
        >
          {{ fallbackText || "—" }}
        </span>
      </template>

      <img
        v-else-if="preview || current"
        :src="preview ?? current ?? ''"
        alt=""
        class="max-h-24 object-contain"
      />

      <span class="text-adm-base text-secondary-900 font-semibold">
        {{ isAvatar ? "Arrastra la foto aquí" : "Arrastra una imagen aquí" }}
      </span>
      <span class="text-adm-sm text-secondary-400">o</span>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="px-4 py-2 bg-secondary-900 text-white border-none rounded-pill text-adm-sm font-semibold cursor-pointer"
          @click="fileInput?.click()"
        >
          Seleccionar archivo
        </button>
        <!-- Solo tras elegir una: quitar la que ya estaba guardada es otra
             operación (exige mandar el campo vacío al servidor). -->
        <button
          v-if="preview"
          type="button"
          class="px-3 py-2 text-adm-sm font-medium text-secondary-400 underline cursor-pointer hover:text-danger-DEFAULT"
          @click="onClear"
        >
          Quitar
        </button>
      </div>

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
