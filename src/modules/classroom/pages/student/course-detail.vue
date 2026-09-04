<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { HeroCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import {
  mdiArrowLeft,
  mdiCalendarCheckOutline,
  mdiCertificateOutline,
  mdiChartBoxOutline,
  mdiDownloadOutline,
  mdiFileDocumentOutline,
  mdiVideoOutline,
} from "@mdi/js";
import studentService from "../../services/student.service";
import type { Material, StudentCourse } from "../../models/classroom.model";
import {
  AulaCard,
  AulaEmpty,
  AulaNotice,
  AulaPageHeader,
  AulaSkeleton,
  AulaPill,
  AulaProgress,
  AulaStat,
} from "../../components/ui";
import {
  formatBytes,
  formatDate,
  formatPercent,
  formatScore,
  formatTime,
  formatTimeRange,
} from "../../utils/format";

const props = defineProps<{ id: string }>();
const route = useRoute();
const router = useRouter();

const course = ref<StudentCourse | null>(null);
const loading = ref(true);
const tab = ref<
  "sessions" | "materials" | "grades" | "attendance" | "closing"
>("sessions");

/**
 * Carga del contenido de la pestaña.
 *
 * El detalle llega en una sola respuesta, así que los datos ya están; el
 * esqueleto marca el cambio de vista para que el contenido no salte de golpe.
 * Es breve a propósito: alargarlo sería fingir una espera que no existe.
 */
const tabLoading = ref(false);

watch(tab, () => {
  tabLoading.value = true;
  setTimeout(() => (tabLoading.value = false), 180);
});

const tabs = computed(() => [
  { key: "sessions", label: `Clases (${course.value?.sessionsTotal ?? 0})` },
  { key: "materials", label: `Material (${course.value?.materials.length ?? 0})` },
  { key: "grades", label: "Notas" },
  { key: "attendance", label: "Asistencia" },
  {
    key: "closing",
    label: course.value?.certificate ? "Certificado" : "Cierre del curso",
  },
]);

/** Solo las dictadas tienen asistencia que mostrar. */
const doneSessions = computed(
  () => course.value?.sessions.filter((s) => s.isDone) ?? [],
);

const markedSessions = computed(() =>
  doneSessions.value.filter((s) => s.attended !== null),
);

/** Material agrupado por la clase a la que pertenece. */
const materialsBySession = computed(() => {
  const groups = new Map<string, Material[]>();

  (course.value?.materials ?? []).forEach((material) => {
    const key = material.sessionName ?? "Material del curso";
    groups.set(key, [...(groups.get(key) ?? []), material]);
  });

  return [...groups.entries()];
});

/** Peso total de lo publicado, para el resumen. */
const materialsSize = computed(() =>
  (course.value?.materials ?? []).reduce((total, m) => total + (m.size ?? 0), 0),
);

const goBack = () => {
  const from = route.query.from as string | undefined;
  router.push({
    name: from === "classroom.paths" ? "classroom-paths" : "classroom-courses",
  });
};

const goToSession = (sessionId: number) => {
  router.push({
    name: "classroom-session",
    params: { sessionId },
    query: { from: (route.query.from as string) ?? "classroom.courses" },
  });
};

onMounted(async () => {
  const { data } = await safeRequest(() => studentService.course(props.id));
  course.value = data;
  loading.value = false;
});
</script>

<template>
  <div>
    <button
      type="button"
      class="inline-flex items-center gap-1.5 text-adm-sm text-secondary-500 mb-4 cursor-pointer hover:text-secondary-900"
      @click="goBack"
    >
      <HeroCore :path="mdiArrowLeft" class="size-3.5" />
      Volver
    </button>

    <AulaSkeleton v-if="loading" kind="page" :rows="5" />

    <AulaEmpty
      v-else-if="!course"
      title="Curso no encontrado"
      sub="Puede que no esté en tu matrícula o que ya no exista."
    />

    <template v-else>
      <AulaPageHeader
        :eyebrow="`${course.offerName} · ${course.offerPrefix ?? ''}`"
        :title="course.courseName"
        :sub="`${course.teacherName ?? 'Docente por asignar'} · ${course.scheduleText}`"
      >
        <template #actions>
          <a
            v-if="course.nextSession?.meetLink"
            :href="course.nextSession.meetLink"
            target="_blank"
            rel="noopener"
            class="v3-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-pill bg-primary-500 text-white text-adm-base font-semibold"
          >
            <HeroCore :path="mdiVideoOutline" class="size-4" />
            Entrar a la clase
          </a>
          <AulaPill v-else :tone="course.stateTone as never">
            {{ course.stateLabel }}
          </AulaPill>
        </template>
      </AulaPageHeader>

      <div class="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <AulaStat
          label="Clases dictadas"
          :value="`${course.sessionsDone}/${course.sessionsTotal}`"
          :delta="`${course.sessionsPercent}% del curso`"
        />
        <AulaStat
          label="Mi nota"
          :value="
            formatScore(course.finalGrade?.score ?? course.equivalentScore)
          "
          :delta="
            course.finalGrade
              ? 'Nota final'
              : `sobre el ${course.evaluatedWeight}% evaluado`
          "
          :icon="mdiChartBoxOutline"
          tone="info"
        />
        <AulaStat
          label="Mi asistencia"
          :value="formatPercent(course.attendancePercent)"
          :delta="`${course.attendanceLate} tardanzas · ${course.attendanceAbsent} faltas`"
          :icon="mdiCalendarCheckOutline"
          tone="success"
        />
        <AulaStat
          label="Certificado"
          :value="course.certificate ? 'Emitido' : '—'"
          :delta="course.certificate?.code ?? 'Al aprobar el curso'"
          :icon="mdiCertificateOutline"
          tone="warning"
        />
      </div>

      <div class="flex gap-1 mb-5 border-b border-line overflow-x-auto">
        <button
          v-for="item in tabs"
          :key="item.key"
          type="button"
          class="px-3.5 py-2 text-adm-base border-b-2 -mb-px whitespace-nowrap transition-colors cursor-pointer"
          :class="
            tab === item.key
              ? 'border-primary-500 text-primary-500 font-semibold'
              : 'border-transparent text-secondary-500'
          "
          @click="tab = item.key as never"
        >
          {{ item.label }}
        </button>
      </div>

      <AulaSkeleton v-if="tabLoading" kind="table" :rows="5" />

      <!-- ── Clases ────────────────────────────────────────────────── -->
      <template v-else-if="tab === 'sessions'">
        <AulaCard v-if="course.sessions.length" pad="sm">
          <div class="overflow-x-auto">
            <table class="w-full min-w-160 text-adm-base">
              <thead>
                <tr
                  class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em]"
                >
                  <th class="text-left px-2 py-2 font-medium">Fecha</th>
                  <th class="text-left px-2 py-2 font-medium">Sesión y tema</th>
                  <th class="text-left px-2 py-2 font-medium">Estado</th>
                  <th class="text-left px-2 py-2 font-medium">Mi asistencia</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="session in course.sessions"
                  :key="session.id"
                  class="adm-row border-t border-line-soft cursor-pointer"
                  @click="goToSession(session.id)"
                >
                  <td class="px-2 py-2.5 whitespace-nowrap">
                    <div class="text-secondary-900">
                      {{ formatDate(session.date) }}
                    </div>
                    <div class="font-mono text-adm-xs text-secondary-400">
                      {{ formatTimeRange(session.startTime, session.endTime) }}
                    </div>
                  </td>
                  <td class="px-2 py-2.5">
                    <div class="text-secondary-900">
                      {{ session.name ?? "Sesión" }}
                    </div>
                    <div class="text-adm-sm text-secondary-500">
                      {{ session.topic ?? "—" }}
                    </div>
                  </td>
                  <td class="px-2 py-2.5">
                    <AulaPill
                      :tone="session.isDone ? 'success' : 'neutral'"
                      size="sm"
                    >
                      {{ session.isDone ? "Dictada" : "Pendiente" }}
                    </AulaPill>
                  </td>
                  <td class="px-2 py-2.5">
                    <AulaPill
                      v-if="session.attendedLabel"
                      :tone="session.attendedTone as never"
                      size="sm"
                    >
                      {{ session.attendedLabel }}
                    </AulaPill>
                    <span v-else class="text-secondary-400">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </AulaCard>

        <AulaEmpty
          v-else
          title="Aún no hay clases generadas"
          :sub="`El horario es ${course.scheduleText || 'por definir'}. Las clases se publican cuando coordinación las genera.`"
        />
      </template>

      <!-- ── Material ──────────────────────────────────────────────── -->
      <template v-else-if="tab === 'materials'">
        <div v-if="course.materials.length" class="grid gap-3.5 sm:grid-cols-2 mb-4">
          <AulaStat
            label="Archivos disponibles"
            :value="course.materials.length"
            :delta="`en ${materialsBySession.length} ${materialsBySession.length === 1 ? 'clase' : 'clases'}`"
            :icon="mdiFileDocumentOutline"
          />
          <AulaStat
            label="Peso total"
            :value="formatBytes(materialsSize)"
            :icon="mdiDownloadOutline"
            tone="info"
          />
        </div>

        <div
          v-for="[sessionName, materials] in materialsBySession"
          :key="sessionName"
          class="mb-4"
        >
          <h3
            class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em] mb-2"
          >
            {{ sessionName }}
          </h3>
          <AulaCard pad="sm">
            <a
              v-for="material in materials"
              :key="material.id"
              :href="material.url"
              target="_blank"
              rel="noopener"
              class="adm-row flex items-center justify-between gap-4 px-2 py-2.5 border-b border-line-soft last:border-0"
            >
              <div class="flex items-center gap-3 min-w-0">
                <span
                  class="font-mono text-adm-xs px-1.5 py-0.5 rounded-adm-sm bg-accent-soft text-primary-500 shrink-0"
                >
                  {{ material.typeLabel }}
                </span>
                <div class="min-w-0">
                  <p class="text-secondary-900 truncate">{{ material.name }}</p>
                  <p class="text-adm-sm text-secondary-500 truncate mt-0.5">
                    {{ material.sizeLabel }}
                    <template v-if="material.uploaderName">
                      · subido por {{ material.uploaderName }}
                    </template>
                  </p>
                </div>
              </div>
              <HeroCore
                :path="mdiDownloadOutline"
                class="size-4 text-secondary-400 shrink-0"
              />
            </a>
          </AulaCard>
        </div>

        <AulaEmpty
          v-if="!course.materials.length"
          title="Todavía no hay material"
          sub="Cuando el docente suba diapositivas, lecturas o archivos de práctica, los verás acá."
        />
      </template>

      <!-- ── Notas ─────────────────────────────────────────────────── -->
      <template v-else-if="tab === 'grades'">
        <AulaNotice v-if="!course.weightsOk" tone="warning" class="mb-4">
          Los pesos de las evaluaciones suman {{ course.weightTotal }}%, no 100%.
          El docente todavía está armando el cuadro de evaluación.
        </AulaNotice>

        <AulaCard v-if="course.evaluations.length" pad="sm">
          <div class="overflow-x-auto">
            <table class="w-full min-w-160 text-adm-base">
              <thead>
                <tr
                  class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em]"
                >
                  <th class="text-left px-2 py-2 font-medium">Evaluación</th>
                  <th class="text-left px-2 py-2 font-medium">Tipo</th>
                  <th class="text-left px-2 py-2 font-medium">Peso</th>
                  <th class="text-left px-2 py-2 font-medium">Nota</th>
                  <th class="text-left px-2 py-2 font-medium">Aporte</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="evaluation in course.evaluations"
                  :key="evaluation.id"
                  class="border-t border-line-soft"
                >
                  <td class="px-2 py-2.5">
                    <div class="text-secondary-900">{{ evaluation.name }}</div>
                    <div
                      v-if="evaluation.feedback"
                      class="text-adm-sm text-secondary-500 italic mt-0.5"
                    >
                      «{{ evaluation.feedback }}»
                    </div>
                  </td>
                  <td class="px-2 py-2.5 text-secondary-500">
                    {{ evaluation.typeName ?? "—" }}
                  </td>
                  <td class="px-2 py-2.5 font-mono text-adm-sm">
                    {{ evaluation.weight }}%
                  </td>
                  <td class="px-2 py-2.5">
                    <span
                      v-if="evaluation.score !== null"
                      class="font-display font-bold"
                      :class="
                        evaluation.passed
                          ? 'text-success-DEFAULT'
                          : 'text-danger-DEFAULT'
                      "
                    >
                      {{ formatScore(evaluation.score) }}
                    </span>
                    <span v-else class="text-secondary-400">pendiente</span>
                  </td>
                  <td class="px-2 py-2.5 font-mono text-adm-sm text-secondary-500">
                    {{ formatScore(evaluation.contribution) }}
                  </td>
                </tr>
                <tr class="border-t border-line font-semibold">
                  <td class="px-2 py-2.5 text-secondary-900" colspan="2">
                    Acumulado sobre lo evaluado
                  </td>
                  <td class="px-2 py-2.5 font-mono text-adm-sm">
                    {{ course.evaluatedWeight }}%
                  </td>
                  <td class="px-2 py-2.5 font-display text-secondary-900">
                    {{ formatScore(course.equivalentScore) }}
                  </td>
                  <td class="px-2 py-2.5 font-mono text-adm-sm">
                    {{ formatScore(course.accumulated) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-adm-sm text-secondary-400 mt-3 px-2">
            El aporte es nota × peso ÷ 100. Este curso aprueba con
            {{ formatScore(course.passingScore) }}.
          </p>
        </AulaCard>

        <AulaEmpty
          v-else
          title="Sin evaluaciones todavía"
          sub="El docente aún no ha definido el cuadro de evaluación del curso."
        />
      </template>

      <!-- ── Asistencia ────────────────────────────────────────────── -->
      <template v-else-if="tab === 'attendance'">
        <AulaCard v-if="markedSessions.length" class="mb-4">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p
                class="font-display text-4xl font-extrabold text-secondary-900 tracking-tight leading-none"
              >
                {{ formatPercent(course.attendancePercent) }}
              </p>
              <p class="text-adm-sm text-secondary-500 mt-1.5">
                {{ markedSessions.length }} de
                {{ doneSessions.length }} clases dictadas con registro
              </p>
            </div>
            <div class="flex gap-2">
              <AulaPill tone="success">
                {{ course.attendancePresent }} presente
              </AulaPill>
              <AulaPill tone="warning">
                {{ course.attendanceLate }} tardanza
              </AulaPill>
              <AulaPill tone="danger">
                {{ course.attendanceAbsent }} ausente
              </AulaPill>
            </div>
          </div>
          <AulaProgress
            :value="course.attendancePercent"
            tone="success"
            class="mt-4"
          />
          <p class="text-adm-sm text-secondary-400 mt-3">
            La tardanza cuenta como asistencia. Solo se consideran las clases
            que el docente ya marcó.
          </p>
        </AulaCard>

        <AulaCard v-if="markedSessions.length" pad="sm">
          <div
            v-for="session in markedSessions"
            :key="session.id"
            class="flex items-center justify-between gap-4 px-2 py-2.5 border-b border-line-soft last:border-0"
          >
            <div class="min-w-0">
              <p class="text-secondary-900 truncate">
                {{ session.name ?? "Sesión" }} · {{ session.topic ?? "—" }}
              </p>
              <p class="font-mono text-adm-xs text-secondary-400 mt-0.5">
                {{ formatDate(session.date, true) }}
                <template v-if="session.attendedAt">
                  · entró {{ formatTime(session.attendedAt.split(" ")[1]) }}
                </template>
              </p>
            </div>
            <AulaPill :tone="session.attendedTone as never" size="sm">
              {{ session.attendedLabel }}
            </AulaPill>
          </div>
        </AulaCard>

        <AulaEmpty
          v-else
          title="Sin asistencia registrada"
          sub="Cuando el docente pase lista y cierre una clase, verás tu asistencia acá."
        />
      </template>

      <!-- ── Cierre y certificado ──────────────────────────────────── -->
      <template v-else>
        <AulaCard v-if="course.finalGrade" class="mb-4">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span
                class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em]"
              >
                Nota final
              </span>
              <p
                class="font-display text-5xl font-extrabold text-secondary-900 tracking-tight leading-none mt-2"
              >
                {{ formatScore(course.finalGrade.score) }}
                <span class="text-adm-lg text-secondary-400 font-bold">/ 20</span>
              </p>
            </div>
            <AulaPill :tone="course.finalGrade.approved ? 'success' : 'danger'">
              {{ course.finalGrade.approved ? "Aprobado" : "Desaprobado" }}
            </AulaPill>
          </div>
          <p class="text-adm-sm text-secondary-500 mt-3">
            Acta cerrada el
            {{ formatDate(course.finalGrade.calculatedAt, true) }}. Este curso
            aprueba con {{ formatScore(course.passingScore) }}.
          </p>
        </AulaCard>

        <AulaCard v-if="course.certificate">
          <span
            class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em]"
          >
            Certificado
          </span>
          <p
            class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight mt-2"
          >
            {{ course.certificate.templateName ?? "Certificado del curso" }}
          </p>
          <p class="font-mono text-adm-base text-secondary-900 mt-2">
            {{ course.certificate.code }}
          </p>
          <p class="text-adm-sm text-secondary-500 mt-1">
            Emitido el {{ formatDate(course.certificate.issuedDate, true) }}
          </p>
        </AulaCard>

        <AulaNotice
          v-else-if="course.finalGrade?.approved"
          tone="info"
          class="mt-4"
        >
          Aprobaste el curso. Tu certificado está en cola de emisión.
        </AulaNotice>

        <AulaEmpty
          v-else-if="!course.finalGrade"
          title="El curso sigue abierto"
          :sub="`Llevas ${course.evaluatedWeight}% del peso evaluado y ${formatScore(course.accumulated)} puntos acumulados de 20. La nota final se calcula cuando el docente cierra el acta.`"
        />
      </template>
    </template>
  </div>
</template>
