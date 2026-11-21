<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useUserStore } from "@/modules/admin/stores/useUserStore";
import { safeRequest } from "@/shared/utils/request";
import {
  mdiCashMultiple,
  mdiClipboardTextOutline,
  mdiPlayCircleOutline,
  mdiSchoolOutline,
} from "@mdi/js";
import dashboardService from "../services/dashboard.service";
import type {
  AttentionItem,
  ClassToday,
  Quota,
  Stats,
} from "../models/dashboard.model";
import StatCard from "../components/stat-card.vue";
import AttentionPanel from "../components/attention-panel.vue";
import ClassesToday from "../components/classes-today.vue";
import QuotasPanel from "../components/quotas-panel.vue";

const userStore = useUserStore();

const stats = ref<Stats | null>(null);
const attention = ref<AttentionItem[]>([]);
const classes = ref<ClassToday[]>([]);
const quotas = ref<Quota[]>([]);
const loading = ref<boolean>(true);

/*
 * Los cuatro bloques se piden en paralelo: son independientes y en serie
 * el panel tardaría la suma de los cuatro. `safeRequest` evita que uno que
 * falle deje la pantalla en blanco — cada bloque muestra su propio vacío.
 */
onMounted(async () => {
  loading.value = true;

  const [statsResp, attentionResp, classesResp, quotasResp] = await Promise.all([
    safeRequest(() => dashboardService.stats(), { showAlert: false }),
    safeRequest(() => dashboardService.attention(), { showAlert: false }),
    safeRequest(() => dashboardService.classesToday(), { showAlert: false }),
    safeRequest(() => dashboardService.quotas(), { showAlert: false }),
  ]);

  stats.value = statsResp.data;
  attention.value = attentionResp.data ?? [];
  classes.value = classesResp.data ?? [];
  quotas.value = quotasResp.data ?? [];
  loading.value = false;
});

/** Primer nombre, para el saludo. */
const firstName = computed(() => userStore.firstName.trim().split(" ")[0]);

/**
 * Cobrado del mes. `transactions.currency` es un varchar libre y pueden convivir
 * varias monedas: nunca se suman. La que más cobros tuvo va grande y las demás debajo,
 * cada una con su símbolo.
 */
const revenueRows = computed(() =>
  // Por cantidad de cobros: el monto no es comparable entre monedas.
  [...(stats.value?.revenue ?? [])].sort((a, b) => b.count - a.count),
);

// El texto del monto lo arma la API con el símbolo de `currencies`.
const revenueValue = computed(() => revenueRows.value[0]?.formatted ?? "—");

const revenueChange = computed(() => ({
  percent: revenueRows.value[0]?.percent ?? null,
  suffix: "vs. mes previo",
}));

// Con varias monedas se rotula la principal y cada otra va en su fila con su variación.
const revenueLabel = computed(() =>
  revenueRows.value.length > 1 ? (revenueRows.value[0]?.name ?? null) : null,
);

const revenueExtra = computed(() =>
  revenueRows.value.slice(1).map((row) => ({
    label: row.name,
    text: row.formatted,
    percent: row.percent,
  })),
);

const enrollmentsHint = computed(() => {
  const enrollments = stats.value?.enrollments;
  if (!enrollments) return null;
  if (!enrollments.previous) return "sin matrículas el mes previo";

  const delta = enrollments.delta;
  return `${delta >= 0 ? "+" : ""}${delta} vs. mes previo`;
});

const approvalValue = computed(() => {
  const rate = stats.value?.approval.rate;
  // null = todavía no hay notas; un 0% se leería como "todos desaprobaron".
  return rate === null || rate === undefined ? "—" : `${rate}%`;
});

const approvalHint = computed(() => {
  const approval = stats.value?.approval;
  if (!approval?.total) return "sin notas finales cargadas";
  return `${approval.total} ${approval.total === 1 ? "nota final" : "notas finales"}`;
});

/** Resumen del día bajo el saludo. */
const summary = computed(() => {
  const parts: string[] = [];

  parts.push(
    classes.value.length === 1
      ? "Hoy se dicta 1 clase"
      : `Hoy se dictan ${classes.value.length} clases`,
  );

  if (attention.value.length) {
    parts.push(
      attention.value.length === 1
        ? "y hay 1 asunto que requiere tu atención"
        : `y hay ${attention.value.length} asuntos que requieren tu atención`,
    );
  } else {
    parts.push("y no hay asuntos pendientes");
  }

  return `${parts.join(" ")}.`;
});
</script>

<template>
  <div class="flex flex-col gap-3.5">
    <!-- Saludo -->
    <section
      class="relative overflow-hidden border border-line rounded-adm-xl px-8 py-7 bg-linear-135 from-accent-soft to-admin-bg"
    >
      <div
        class="absolute -right-20 -top-22 size-65 rounded-full bg-accent-tint opacity-55 pointer-events-none"
      />
      <div class="relative">
        <span
          class="font-mono text-adm-xs text-primary-500 tracking-[0.08em] font-semibold"
        >
          PANEL ADMINISTRATIVO
        </span>
        <h1
          class="font-display text-[2.375rem] font-bold leading-tight tracking-tight mt-2.5 text-secondary-900"
        >
          Hola, <span class="text-primary-500">{{ firstName }}</span
          >.
        </h1>
        <p class="text-adm-md text-secondary-500 mt-2.5 max-w-155">
          {{ summary }}
        </p>
      </div>
    </section>

    <!-- Los 4 números -->
    <section class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        :icon="mdiCashMultiple"
        :value="revenueValue"
        label="Cobrado este mes"
        :value-label="revenueLabel"
        :change="revenueRows.length ? revenueChange : undefined"
        :hint="revenueRows.length ? null : 'sin cobros este mes'"
        :extra="revenueExtra"
        :loading="loading"
        tone="success"
      />
      <StatCard
        :icon="mdiClipboardTextOutline"
        :value="stats?.enrollments.current ?? 0"
        label="Matrículas del mes"
        :hint="enrollmentsHint"
        :loading="loading"
        tone="accent"
      />
      <StatCard
        :icon="mdiPlayCircleOutline"
        :value="stats?.offers.active ?? 0"
        label="Cohortes en curso"
        :hint="
          stats?.offers.closingSoon
            ? `${stats.offers.closingSoon} cierran matrícula pronto`
            : null
        "
        :loading="loading"
        tone="info"
      />
      <StatCard
        :icon="mdiSchoolOutline"
        :value="approvalValue"
        label="Tasa de aprobación"
        :hint="approvalHint"
        :loading="loading"
        tone="amber"
      />
    </section>

    <AttentionPanel :items="attention" :loading="loading" />

    <section class="grid grid-cols-1 gap-3.5 xl:grid-cols-[1.35fr_1fr]">
      <ClassesToday :items="classes" :loading="loading" />
      <QuotasPanel :items="quotas" :loading="loading" />
    </section>
  </div>
</template>
