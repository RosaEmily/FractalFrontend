<script setup lang="ts">
import { computed, ref } from "vue";
import dayjs from "dayjs";
import { ButtonCore, DatePicketCore, HeroCore } from "@/shared/components";
import { mdiFilterOutline, mdiTrayArrowDown } from "@mdi/js";

const props = defineProps<{
  /** Fechas iniciales; por defecto el año en curso, como el diseño. */
  from?: string;
  to?: string;
  loading?: boolean;
  /** Deshabilita la exportación cuando no hay filas. */
  canExport?: boolean;
  /** Un solo selector, "Fecha de corte" (resumen ejecutivo), en vez de Desde y Hasta. */
  cutoff?: boolean;
}>();

const emit = defineEmits<{
  (e: "apply", range: { from: string; to: string }): void;
  (e: "export"): void;
}>();

// Hora local: con `toISOString()` (UTC) en Lima, de noche "hoy" ya sería mañana.
const startOfYear = dayjs().startOf("year").format("YYYY-MM-DD");
const today = dayjs().format("YYYY-MM-DD");

const from = ref<string>(props.from ?? startOfYear);
const to = ref<string>(props.to ?? today);

/*
 * Los reportes miran lo ya ocurrido (cobros, matrículas, notas, asistencia):
 * no hay datos con fecha futura, así que "Hasta" no pasa de hoy y el rango
 * no puede quedar invertido (Desde ≤ Hasta).
 */
const toDate = (value: string) => dayjs(value).toDate();
const maxFrom = computed(() => toDate(to.value));
const minTo = computed(() => toDate(from.value));
const maxToday = dayjs().endOf("day").toDate();

const apply = () => emit("apply", { from: from.value, to: to.value });
</script>

<template>
  <div
    class="px-5.5 py-3.5 border-b border-line-soft bg-admin-bg flex items-end gap-3.5 flex-wrap"
  >
    <div v-if="!cutoff" class="min-w-37.5">
      <span
        class="font-mono text-adm-label text-secondary-400 tracking-wider block mb-1.5"
      >
        DESDE
      </span>
      <DatePicketCore
        v-model="from"
        :max-date="maxFrom"
        dayjs-format-value="YYYY-MM-DD"
        :manual-input="false"
        input-class="caret-transparent cursor-pointer"
      />
    </div>

    <div class="min-w-37.5">
      <span
        class="font-mono text-adm-label text-secondary-400 tracking-wider block mb-1.5"
      >
        {{ cutoff ? "FECHA DE CORTE" : "HASTA" }}
      </span>
      <DatePicketCore
        v-model="to"
        :min-date="cutoff ? undefined : minTo"
        :max-date="maxToday"
        dayjs-format-value="YYYY-MM-DD"
        :manual-input="false"
        input-class="caret-transparent cursor-pointer"
      />
    </div>

    <!-- Filtro propio de cada reporte (moneda, cohorte, tipo…) -->
    <slot name="extra" />

    <div class="ml-auto flex gap-2">
      <ButtonCore
        class="!w-auto"
        severity="secondary"
        label="Aplicar"
        :loading="loading"
        @click="apply"
      >
        <template #icon>
          <HeroCore :path="mdiFilterOutline" class="size-3.5" />
        </template>
      </ButtonCore>

      <ButtonCore
        class="!w-auto"
        severity="secondary"
        variant="outlined"
        label="Exportar CSV"
        :disabled="!canExport"
        @click="emit('export')"
      >
        <template #icon>
          <HeroCore :path="mdiTrayArrowDown" class="size-3.5" />
        </template>
      </ButtonCore>
    </div>
  </div>
</template>
