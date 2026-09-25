<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { HeroCore } from "@/shared/components";
import ToggleCheck from "@/modules/admin/components/ui/toggle-check.vue";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import {
  mdiUploadOutline,
  mdiClose,
  mdiTrayArrowDown,
} from "@mdi/js";
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

/*
 * ⚠️ Solo `onMounted`, NO un `watch` sobre `classSessionId`.
 *
 * El padre monta este componente con `:key="currentSession.id"`, así que al
 * cambiar de clase lo DESTRUYE y lo vuelve a crear. Un watch `immediate` sobre
 * la misma prop se disparaba además del montaje: dos GET seguidos a
 * `materials` por cada cambio de sesión.
 */
onMounted(load);
</script>

<template>
  <AulaCard pad="sm">
    <!--
      Título de tarjeta, no eyebrow: en el diseño es display bold y compite con
      el resto de la pantalla, porque subir material es una acción principal.
    -->
    <div class="flex items-center gap-3 flex-wrap px-2 pt-1 pb-2">
      <p
        class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight"
      >
        Material de la clase
      </p>
      <AulaPill v-if="materials.length" tone="neutral" size="sm">
        {{ materials.length }}
        {{ materials.length === 1 ? "archivo" : "archivos" }}
      </AulaPill>
      <span
        v-if="materials.length"
        class="font-mono text-adm-xs text-secondary-400 ml-auto"
      >
        {{ formatBytes(totalSize) }}
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

    <!--
      Cada archivo es una TARJETA con borde y fondo, no una fila de lista: así
      se distingue del resto de la pantalla y el bloque de material se lee como
      una unidad. Atenuada si aún no es visible para el alumno.
    -->
    <div
      v-for="material in materials"
      :key="material.id"
      class="flex items-center gap-3 px-3.5 py-3 mx-2 mb-2 rounded-adm-md bg-surface-page border border-line"
      :class="material.is_visible ? '' : 'opacity-70'"
    >
      <!-- Cuadro con el tipo, no un badge de color: el diseño lo hace neutro. -->
      <span
        class="size-9 shrink-0 grid place-items-center rounded-adm-sm bg-surface-paper border border-line font-mono text-[0.563rem] font-bold text-secondary-500 uppercase"
      >
        {{ material.type }}
      </span>

      <div class="flex-1 min-w-0">
        <p class="text-adm-base font-semibold text-secondary-900 truncate">
          {{ material.name }}
        </p>
        <p class="font-mono text-adm-xs text-secondary-400 truncate mt-0.5">
          {{ material.type_label }} · {{ formatBytes(material.size) }}
          <template v-if="!material.is_visible">
            · VISIBLE DESDE
            {{ formatDate(material.visible_from)?.toUpperCase() }}
          </template>
        </p>
      </div>

      <!--
        Programado y publicado son excluyentes: mientras el alumno no pueda
        verlo, lo que importa es ese estado, no bajarlo.
      -->
      <AulaPill v-if="!material.is_visible" tone="neutral" size="sm">
        Programado
      </AulaPill>
      <a
        v-else
        :href="material.url"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-1.5 shrink-0 text-adm-base font-semibold text-primary-600"
      >
        <HeroCore :path="mdiTrayArrowDown" class="size-4 text-primary-500" />
        Descargar
      </a>

      <button
        type="button"
        class="cursor-pointer shrink-0 text-secondary-400 hover:text-danger-DEFAULT"
        aria-label="Eliminar material"
        @click="remove(material.id)"
      >
        <HeroCore :path="mdiClose" class="size-4" />
      </button>
    </div>

    <!-- Dropzone -->
    <div
      class="mx-2 mb-2 flex flex-col items-center justify-center py-5.5 px-5 border-[1.5px] border-dashed rounded-adm-md cursor-pointer transition-colors"
      :class="
        dragging
          ? 'border-primary-500 bg-accent-soft'
          : 'border-line bg-surface-page'
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
        PDF, Word, diapositivas, Excel, Revit, AutoCAD o ZIP · hasta 50 MB por archivo
      </p>
      <input
        ref="fileInput"
        type="file"
        multiple
        class="hidden"
        @change="upload(($event.target as HTMLInputElement).files)"
      />
    </div>

    <div
      v-if="sessionDate"
      class="flex items-center gap-3.5 flex-wrap px-2 pb-1 mt-3.5"
    >
      <ToggleCheck
        label="Publicar recién el día de la clase"
        :hint="formatDate(sessionDate, true)"
        :on="scheduled"
        @toggle="scheduled = $event"
      />
      <!-- Dónde acaba el archivo: responde la duda antes de que se haga. -->
      <span class="text-adm-sm text-secondary-400 ml-auto">
        Los alumnos del curso lo ven en la sesión y en la pestaña Material.
      </span>
    </div>
  </AulaCard>
</template>
