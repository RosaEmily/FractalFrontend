<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { HeroCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import { mdiUploadOutline, mdiClose, mdiClockOutline } from "@mdi/js";
import teacherService from "../services/teacher.service";
import type { MaterialDTO } from "../dto/classroom.dto";
import { AulaBar, AulaCard, AulaPill } from "./ui";
import { formatBytes, formatDate } from "../utils/format";

const props = defineProps<{
  classSessionId: number;
  /** Fecha de la clase, para el atajo de "publicar el día de la clase". */
  sessionDate?: string | null;
}>();

const toastStore = useToastStore();

const materials = ref<MaterialDTO[]>([]);
const loading = ref(false);
const uploading = ref(false);
const dragging = ref(false);

/** Difiere la publicación hasta el día de la clase. */
const scheduled = ref(false);

const fileInput = ref<HTMLInputElement | null>(null);

const totalSize = computed(() =>
  materials.value.reduce((total, m) => total + (m.size ?? 0), 0),
);

const load = async () => {
  loading.value = true;
  const { data } = await safeRequest(
    () => teacherService.materials(props.classSessionId),
    { showAlert: false },
  );
  materials.value = data ?? [];
  loading.value = false;
};

const upload = async (files: FileList | null) => {
  if (!files?.length) return;

  uploading.value = true;
  for (const file of Array.from(files)) {
    await safeRequest(() =>
      teacherService.uploadMaterial(props.classSessionId, file, {
        visibleFrom: scheduled.value ? props.sessionDate : null,
      }),
    );
  }
  uploading.value = false;

  toastStore.showToastSuccess({ detail: "Material subido." });
  await load();
};

const remove = async (materialId: number) => {
  const { data } = await safeRequest(() =>
    teacherService.deleteMaterial(materialId),
  );
  if (data) {
    toastStore.showToastSuccess({ detail: "Material eliminado." });
    await load();
  }
};

const onDrop = (event: DragEvent) => {
  dragging.value = false;
  upload(event.dataTransfer?.files ?? null);
};

watch(() => props.classSessionId, load, { immediate: true });
</script>

<template>
  <AulaCard pad="sm">
    <div class="flex items-center justify-between gap-3 px-2 pt-1 pb-2">
      <p
        class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em]"
      >
        Material de la clase
      </p>
      <span v-if="materials.length" class="font-mono text-adm-xs text-secondary-400">
        {{ materials.length }} · {{ formatBytes(totalSize) }}
      </span>
    </div>

    <div v-if="loading" class="px-2 py-2 space-y-3">
      <div v-for="n in 2" :key="n" class="flex items-center gap-3">
        <AulaBar :w="34" :h="18" :r="4" />
        <span class="flex-1 min-w-0">
          <AulaBar w="55%" :h="12" />
          <AulaBar w="25%" :h="9" class="mt-2" />
        </span>
      </div>
    </div>

    <div
      v-for="material in materials"
      :key="material.id"
      class="flex items-center justify-between gap-3 px-2 py-2.5 border-t border-line-soft"
    >
      <a
        :href="material.url"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-3 min-w-0 flex-1"
      >
        <span
          class="font-mono text-adm-xs px-1.5 py-0.5 rounded-adm-sm bg-accent-soft text-primary-500 shrink-0"
        >
          {{ material.type_label }}
        </span>
        <div class="min-w-0">
          <p class="text-adm-base text-secondary-900 truncate">
            {{ material.name }}
          </p>
          <p class="text-adm-sm text-secondary-500 truncate mt-0.5">
            {{ formatBytes(material.size) }}
          </p>
        </div>
      </a>

      <!-- Programado: el alumno todavía no lo ve -->
      <AulaPill v-if="!material.is_visible" tone="warning" size="sm">
        <HeroCore :path="mdiClockOutline" class="size-3" />
        Desde {{ formatDate(material.visible_from) }}
      </AulaPill>

      <button
        type="button"
        class="adm-icon-btn shrink-0"
        aria-label="Eliminar material"
        @click="remove(material.id)"
      >
        <HeroCore :path="mdiClose" class="size-4 text-danger-DEFAULT" />
      </button>
    </div>

    <!-- Dropzone -->
    <div
      class="mt-2 mx-2 mb-1 flex flex-col items-center justify-center py-6 px-4 border border-dashed rounded-adm-md cursor-pointer transition-colors"
      :class="
        dragging
          ? 'border-primary-500 bg-accent-soft'
          : 'border-line bg-surface-soft'
      "
      @click="fileInput?.click()"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
    >
      <HeroCore
        :path="mdiUploadOutline"
        class="size-5"
        :class="dragging ? 'text-primary-500' : 'text-secondary-400'"
      />
      <p class="text-adm-base font-semibold text-secondary-900 mt-2">
        {{ uploading ? "Subiendo…" : "Arrastra archivos o haz clic para subir" }}
      </p>
      <p class="text-adm-sm text-secondary-500 mt-1 text-center">
        PDF, Word, diapositivas, Excel, Revit, AutoCAD o ZIP · hasta 50 MB
      </p>
      <input
        ref="fileInput"
        type="file"
        multiple
        class="hidden"
        @change="upload(($event.target as HTMLInputElement).files)"
      />
    </div>

    <label
      v-if="sessionDate"
      class="flex items-center gap-2 px-2 pb-1 text-adm-sm text-secondary-500 cursor-pointer"
    >
      <input v-model="scheduled" type="checkbox" class="accent-primary-500" />
      Publicar recién el día de la clase
      <span class="font-mono text-adm-xs text-secondary-400">
        ({{ formatDate(sessionDate, true) }})
      </span>
    </label>
  </AulaCard>
</template>
