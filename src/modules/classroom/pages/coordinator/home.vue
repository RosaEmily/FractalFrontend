<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { HeroCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import {
  mdiAccountGroupOutline,
  mdiAlertOutline,
  mdiCheckCircleOutline,
  mdiChevronRight,
  mdiViewGridOutline,
} from "@mdi/js";
import coordinatorService, {
  ATTENTION_ROUTES,
  SEVERITY_TONE,
} from "../../services/coordinator.service";
import type {
  AttentionItemDTO,
  ClassTodayDTO,
  QuotaDTO,
  StatsDTO,
} from "../../dto/coordinator.dto";
import {
  AulaCard,
  AulaEmpty,
  AulaPageHeader,
  AulaSkeleton,
  AulaPill,
  AulaStat,
} from "../../components/ui";
import { formatPercent, formatTimeRange } from "../../utils/format";

const router = useRouter();

const stats = ref<StatsDTO | null>(null);
const attention = ref<AttentionItemDTO[]>([]);
const quotas = ref<QuotaDTO[]>([]);
const classes = ref<ClassTodayDTO[]>([]);
const loading = ref(true);

/** Alumnos activos: la suma de matriculados en las cohortes abiertas. */
const activeStudents = computed(() =>
  quotas.value.reduce((total, q) => total + q.enrolled_students_count, 0),
);

const teacherName = (item: ClassTodayDTO) =>
  [item.teacher_first_name, item.teacher_last_name].filter(Boolean).join(" ") ||
  "Sin docente";

const goTo = (item: AttentionItemDTO) => {
  const route = ATTENTION_ROUTES[item.key];
  if (route) router.push({ name: route });
};

onMounted(async () => {
  /*
   * Las cuatro consultas son independientes: en paralelo, y cada una con su
   * propio safeRequest para que una que falle no deje la pantalla en blanco.
   */
  const [statsRes, attentionRes, quotasRes, classesRes] = await Promise.all([
    safeRequest(() => coordinatorService.stats(), { showAlert: false }),
    safeRequest(() => coordinatorService.attention(), { showAlert: false }),
    safeRequest(() => coordinatorService.quotas(), { showAlert: false }),
    safeRequest(() => coordinatorService.classesToday(), { showAlert: false }),
  ]);

  stats.value = statsRes.data;
  attention.value = attentionRes.data ?? [];
  quotas.value = quotasRes.data ?? [];
  classes.value = classesRes.data ?? [];
  loading.value = false;
});
</script>

<template>
  <div>
    <AulaPageHeader
      eyebrow="PANEL ACADÉMICO"
      title="Panel académico"
      sub="Lo que necesita atención en los grupos activos, y las clases de hoy."
    />

    <AulaSkeleton v-if="loading" kind="page" :rows="5" />

    <template v-else>
      <div class="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <AulaStat
          label="Alumnos activos"
          :value="activeStudents || '—'"
          :icon="mdiAccountGroupOutline"
        />
        <AulaStat
          label="Cohortes con matrícula"
          :value="quotas.length || '—'"
          :icon="mdiViewGridOutline"
          tone="info"
        />
        <AulaStat
          label="Tasa de aprobación"
          :value="formatPercent(stats?.approval.rate)"
          :delta="
            stats?.approval.rate === null
              ? 'Sin notas finales todavía'
              : `${stats?.approval.approved ?? 0} de ${stats?.approval.total ?? 0}`
          "
          :icon="mdiCheckCircleOutline"
          tone="success"
        />
        <AulaStat
          label="Puntos por resolver"
          :value="attention.length || '—'"
          :icon="mdiAlertOutline"
          :tone="attention.length ? 'warning' : 'success'"
        />
      </div>

      <h2
        class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight mb-3"
      >
        Requiere tu atención
      </h2>

      <AulaCard v-if="attention.length" pad="sm" class="mb-6">
        <button
          v-for="item in attention"
          :key="item.key"
          type="button"
          class="adm-row w-full flex items-start justify-between gap-3 px-2 py-3 border-b border-line-soft last:border-0 text-left"
          :class="ATTENTION_ROUTES[item.key] ? 'cursor-pointer' : 'cursor-default'"
          @click="goTo(item)"
        >
          <div class="flex items-start gap-2.5 min-w-0">
            <AulaPill
              :tone="(SEVERITY_TONE[item.severity] ?? 'info') as never"
              size="sm"
            >
              {{ item.count }}
            </AulaPill>
            <div class="min-w-0">
              <p class="text-secondary-900">{{ item.title }}</p>
              <p class="text-adm-sm text-secondary-500 mt-0.5">
                {{ item.detail }}
              </p>
            </div>
          </div>
          <HeroCore
            v-if="ATTENTION_ROUTES[item.key]"
            :path="mdiChevronRight"
            class="size-4 text-secondary-400 shrink-0 mt-0.5"
          />
        </button>
      </AulaCard>

      <AulaEmpty
        v-else
        title="Nada pendiente por ahora"
        sub="No hay grupos bajo el mínimo, pesos sin cuadrar ni pagos vencidos. Todo en orden."
        class="mb-6"
      />

      <template v-if="classes.length">
        <h2
          class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight mb-3"
        >
          Clases de hoy
        </h2>
        <AulaCard pad="sm">
          <div
            v-for="item in classes"
            :key="item.id"
            class="flex items-center justify-between gap-4 px-2 py-2.5 border-b border-line-soft last:border-0"
          >
            <div class="min-w-0">
              <p class="text-secondary-900 truncate">
                {{ item.course_name }} · {{ item.topic ?? "—" }}
              </p>
              <p class="text-adm-sm text-secondary-500 truncate mt-0.5">
                {{ item.offer_name }} · {{ teacherName(item) }}
              </p>
            </div>
            <div class="text-right shrink-0">
              <div class="font-mono text-adm-xs text-secondary-400">
                {{ formatTimeRange(item.start_time, item.end_time) }}
              </div>
              <AulaPill
                :tone="
                  (item.state === 'done'
                    ? 'success'
                    : item.state === 'in_progress'
                      ? 'danger'
                      : 'neutral') as never
                "
                size="sm"
                class="mt-1"
              >
                {{
                  item.state === "done"
                    ? "Dictada"
                    : item.state === "in_progress"
                      ? "En curso"
                      : "Por dictar"
                }}
              </AulaPill>
            </div>
          </div>
        </AulaCard>
      </template>
    </template>
  </div>
</template>
