<script setup lang="ts">
/**
 * Barra flotante de acciones masivas (`AdmBulkBar` del diseño).
 *
 * Aparece abajo-centro en cuanto hay selección: píldora oscura con el contador,
 * las tres acciones y una X para cancelar. El diseño la pide en 8 pantallas
 * (usuarios, matrículas, programas, cursos, instructores, estudiantes y las dos
 * de sistema), y como `SectionList` la monta, la heredan todos los listados.
 *
 * ⚠️ NO reemplaza a las acciones del menú "Crear": el diseño tiene **las dos**
 * (`AdmCreateDropdown` también las lista). La barra es el acceso directo cuando
 * ya hay filas marcadas.
 */
import { HeroCore } from "@/shared/components";
import {
  mdiCheckCircleOutline,
  mdiCloseCircleOutline,
  mdiTrashCanOutline,
  mdiClose,
} from "@mdi/js";

const props = defineProps<{
  count: number;
  /** Un listado sin toggle de estado no muestra habilitar/deshabilitar. */
  showStatus?: boolean;
  showDelete?: boolean;
}>();

const emit = defineEmits<{
  (e: "enable" | "disable" | "delete" | "clear"): void;
}>();
</script>

<template>
  <Transition name="adm-bulk">
    <div
      v-if="props.count > 0"
      class="adm-bulk-bar"
      role="toolbar"
      aria-label="Acciones sobre la selección"
    >
      <span class="adm-bulk-count">{{ props.count }}</span>
      <span class="adm-bulk-label">
        seleccionado{{ props.count === 1 ? "" : "s" }}
      </span>
      <span class="adm-bulk-sep" />

      <button
        v-if="props.showStatus"
        type="button"
        class="adm-bulk-btn"
        @click="emit('enable')"
      >
        <HeroCore :path="mdiCheckCircleOutline" size="14" />
        Habilitar
      </button>
      <button
        v-if="props.showStatus"
        type="button"
        class="adm-bulk-btn"
        @click="emit('disable')"
      >
        <HeroCore :path="mdiCloseCircleOutline" size="14" />
        Deshabilitar
      </button>
      <button
        v-if="props.showDelete"
        type="button"
        class="adm-bulk-btn adm-bulk-btn--danger"
        @click="emit('delete')"
      >
        <HeroCore :path="mdiTrashCanOutline" size="14" />
        Eliminar
      </button>

      <button
        type="button"
        class="adm-bulk-close"
        title="Cancelar selección"
        aria-label="Cancelar selección"
        @click="emit('clear')"
      >
        <HeroCore :path="mdiClose" size="13" />
      </button>
    </div>
  </Transition>
</template>
