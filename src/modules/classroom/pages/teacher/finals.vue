<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ButtonCore, HeroCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import { mdiCheckCircleOutline, mdiCloseCircleOutline } from "@mdi/js";
import teacherService from "../../services/teacher.service";
import type { FinalsDTO, TeacherCourseDTO } from "../../dto/teacher.dto";
import {
  AulaCard,
  AulaEmpty,
  AulaNotice,
  AulaPageHeader,
  AulaSkeleton,
  AulaPill,
  AulaStat,
} from "../../components/ui";
import { formatDate, formatScore } from "../../utils/format";

const route = useRoute();
const toastStore = useToastStore();

const courses = ref<TeacherCourseDTO[]>([]);
const data = ref<FinalsDTO | null>(null);
const selectedCourse = ref<number | null>(null);
const loading = ref(true);
const loadingTable = ref(false);
const closing = ref(false);

/** Paso intermedio: cerrar el acta no se puede deshacer. */
const confirming = ref(false);

/** Los requisitos, en el orden en que el docente los va cumpliendo. */
const requirements = computed(() => {
  const req = data.value?.requirements;
  if (!req) return [];

  return [
    { label: "El curso tiene cuadro de evaluación", ok: req.has_evaluations },
    { label: "Hay alumnos matriculados", ok: req.has_students },
    { label: "Los pesos suman 100%", ok: req.weights_ok },
    {
      label: "Todas las notas están registradas",
      ok: req.all_graded,
      detail: req.missing_scores ? `faltan ${req.missing_scores}` : undefined,
    },
    {
      label: "Todas las clases fueron dictadas",
      ok: req.all_sessions_done,
      detail: req.pending_sessions
        ? `quedan ${req.pending_sessions}`
        : undefined,
    },
  ];
});

const load = async (offerCourseId: number) => {
  loadingTable.value = true;
  confirming.value = false;
  const { data: result } = await safeRequest(() =>
    teacherService.finals(offerCourseId),
  );
  data.value = result;
  loadingTable.value = false;
};

const closeActa = async () => {
  if (!selectedCourse.value) return;

  closing.value = true;
  const { data: ok } = await safeRequest(() =>
    teacherService.closeActa(selectedCourse.value as number),
  );
  closing.value = false;
  confirming.value = false;

  if (ok) {
    toastStore.showToastSuccess({ detail: "Acta cerrada y publicada." });
    await load(selectedCourse.value);
  }
};

watch(selectedCourse, async (id) => {
  if (id) await load(id);
});

onMounted(async () => {
  const { data: list } = await safeRequest(() => teacherService.courses());
  courses.value = list ?? [];

  const fromQuery = Number(route.query.course);
  selectedCourse.value =
    courses.value.find((c) => c.id === fromQuery)?.id ??
    courses.value.find((c) => c.state === "completed")?.id ??
    courses.value[0]?.id ??
    null;

  loading.value = false;
});
</script>

<template>
  <div>
    <AulaPageHeader
      eyebrow="ACTAS Y NOTAS FINALES"
      title="Actas y notas finales"
      sub="Al cerrar el acta se calculan las notas finales y los aprobados pasan a la cola de certificados."
    />

    <AulaSkeleton v-if="loading" kind="page" :rows="5" />

    <AulaEmpty
      v-else-if="!courses.length"
      title="No tienes cursos asignados"
      sub="Cuando coordinación te asigne un curso podrás cerrar su acta al terminarlo."
    />

    <template v-else>
      <div class="mb-4">
        <label
          class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em] block mb-1.5"
        >
          Curso
        </label>
        <select
          v-model="selectedCourse"
          class="w-full max-w-120 px-3 py-2 rounded-adm-sm border border-line bg-surface-paper text-adm-base text-secondary-900"
        >
          <option v-for="course in courses" :key="course.id" :value="course.id">
            {{ course.course_name }} — {{ course.offer_name }}
          </option>
        </select>
      </div>

      <AulaSkeleton v-if="loadingTable" kind="table" :rows="7" />

      <template v-else-if="data">
        <div class="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4 mb-5">
          <AulaStat label="Alumnos" :value="data.totals.students || '—'" />
          <AulaStat
            label="Notas finales"
            :value="`${data.totals.with_grade}/${data.totals.students}`"
            :delta="data.is_closed ? 'acta cerrada' : 'acta abierta'"
            :tone="data.is_closed ? 'success' : 'warning'"
          />
          <AulaStat
            label="Aprobados"
            :value="data.totals.approved || '—'"
            :delta="`nota ≥ ${formatScore(data.totals.passing_score)}`"
            :icon="mdiCheckCircleOutline"
            tone="success"
          />
          <AulaStat
            label="Nota aprobatoria"
            :value="formatScore(data.totals.passing_score)"
            delta="la del curso o su grupo"
            tone="warning"
          />
        </div>

        <!-- Acta cerrada: estado final, no hay nada que hacer -->
        <AulaNotice v-if="data.is_closed" tone="success" class="mb-4">
          Acta cerrada el {{ formatDate(data.closed_at, true) }}. Las notas ya
          son visibles para los alumnos y los aprobados están en la cola de
          emisión de certificados.
        </AulaNotice>

        <!-- Confirmación: el cierre no se puede deshacer -->
        <AulaCard
          v-else-if="confirming"
          class="mb-4 border-primary-500 border-2"
        >
          <p
            class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight"
          >
            Vas a cerrar el acta de este curso
          </p>
          <p class="text-adm-base text-secondary-500 mt-2">
            Se calculará la nota final de los {{ data.totals.students }} alumnos
            como la suma de nota × peso ÷ 100, y se comparará contra
            {{ formatScore(data.totals.passing_score) }} para decidir la
            aprobación. Queda registrado tu nombre y la hora del cierre.
            <strong class="text-secondary-900">
              El acta no se puede reabrir.
            </strong>
          </p>
          <div class="flex flex-wrap gap-2 mt-4">
            <ButtonCore
              label="Sí, cerrar y publicar"
              :loading="closing"
              @click="closeActa"
            />
            <button
              type="button"
              class="px-4 py-2 rounded-pill border border-line text-adm-base text-secondary-500 cursor-pointer"
              @click="confirming = false"
            >
              Volver a revisar
            </button>
          </div>
        </AulaCard>

        <!-- Requisitos: se calculan en el servidor, la vista solo los muestra -->
        <AulaCard v-else class="mb-4">
          <p
            class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight"
          >
            Requisitos para cerrar el acta
          </p>
          <ul class="mt-3 space-y-2">
            <li
              v-for="item in requirements"
              :key="item.label"
              class="flex items-center gap-2.5 text-adm-base"
            >
              <HeroCore
                :path="item.ok ? mdiCheckCircleOutline : mdiCloseCircleOutline"
                class="size-4 shrink-0"
                :class="item.ok ? 'text-success-DEFAULT' : 'text-danger-DEFAULT'"
              />
              <span class="text-secondary-900">{{ item.label }}</span>
              <AulaPill v-if="item.detail" tone="danger" size="sm">
                {{ item.detail }}
              </AulaPill>
            </li>
          </ul>

          <div class="mt-4 pt-4 border-t border-line-soft">
            <ButtonCore
              label="Cerrar el acta"
              :disabled="!data.can_close"
              @click="confirming = true"
            />
            <p
              v-if="!data.can_close"
              class="text-adm-sm text-secondary-400 mt-2"
            >
              Resuelve los puntos pendientes para habilitar el cierre.
            </p>
          </div>
        </AulaCard>

        <AulaCard v-if="data.students.length" pad="sm">
          <div class="overflow-x-auto">
            <table class="w-full min-w-160 text-adm-base">
              <thead>
                <tr
                  class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em]"
                >
                  <th class="text-left px-2 py-2 font-medium">Alumno</th>
                  <th class="text-left px-2 py-2 font-medium">Nota final</th>
                  <th class="text-left px-2 py-2 font-medium">Resultado</th>
                  <th class="text-left px-2 py-2 font-medium">Certificado</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="student in data.students"
                  :key="student.enrollment_course_id"
                  class="border-t border-line-soft"
                >
                  <td class="px-2 py-2.5 text-secondary-900">
                    {{ student.full_name }}
                    <span class="block font-mono text-adm-xs text-secondary-400">
                      {{ student.document_number }}
                    </span>
                  </td>
                  <td class="px-2 py-2.5">
                    <span
                      v-if="student.final_score !== null"
                      class="font-display text-adm-lg font-bold text-secondary-900"
                    >
                      {{ formatScore(Number(student.final_score)) }}
                    </span>
                    <span v-else class="text-secondary-300">—</span>
                  </td>
                  <td class="px-2 py-2.5">
                    <AulaPill
                      v-if="student.approved !== null"
                      :tone="student.approved ? 'success' : 'danger'"
                      size="sm"
                    >
                      {{ student.approved ? "Aprobado" : "Desaprobado" }}
                    </AulaPill>
                    <span v-else class="text-secondary-400">Sin calificar</span>
                  </td>
                  <td class="px-2 py-2.5">
                    <span
                      v-if="student.certificate_code"
                      class="font-mono text-adm-sm text-secondary-900"
                    >
                      {{ student.certificate_code }}
                    </span>
                    <AulaPill
                      v-else-if="student.approved"
                      tone="warning"
                      size="sm"
                    >
                      En trámite
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
          title="Sin alumnos matriculados"
          sub="Este curso todavía no tiene alumnos en su grupo."
        />
      </template>
    </template>
  </div>
</template>
