<script setup lang="ts">
import { ref } from "vue";
import { ButtonCore, DatePicketCore, HeroCore } from "@/shared/components";
import { mdiFilterOutline, mdiTrayArrowDown } from "@mdi/js";

const props = defineProps<{
  /** Fechas iniciales; por defecto el año en curso, como el diseño. */
  from?: string;
  to?: string;
  loading?: boolean;
  /** Deshabilita la exportación cuando no hay filas. */
  canExport?: boolean;
}>();

const emit = defineEmits<{
  (e: "apply", range: { from: string; to: string }): void;
  (e: "export"): void;
}>();

const startOfYear = `${new Date().getFullYear()}-01-01`;
const today = new Date().toISOString().slice(0, 10);

const from = ref<string>(props.from ?? startOfYear);
const to = ref<string>(props.to ?? today);

const apply = () => emit("apply", { from: from.value, to: to.value });
</script>

<template>
  <div
    class="px-5.5 py-3.5 border-b border-line-soft bg-admin-bg flex items-end gap-3.5 flex-wrap"
  >
    <div class="min-w-37.5">
      <span
        class="font-mono text-adm-label text-secondary-400 tracking-wider block mb-1.5"
      >
        DESDE
      </span>
      <DatePicketCore v-model="from" dayjs-format-value="YYYY-MM-DD" />
    </div>

    <div class="min-w-37.5">
      <span
        class="font-mono text-adm-label text-secondary-400 tracking-wider block mb-1.5"
      >
        HASTA
      </span>
      <DatePicketCore v-model="to" dayjs-format-value="YYYY-MM-DD" />
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
