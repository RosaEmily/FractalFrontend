<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import { ButtonCore } from "@/shared/components";
import teacherService from "../../services/teacher.service";
import type { EvaluationsDTO, TeacherCourseDTO } from "../../dto/teacher.dto";
import {
  AulaCard,
  AulaEmpty,
  AulaNotice,
  AulaPageHeader,
  AulaSkeleton,
  AulaPill,
  AulaStat,
} from "../../components/ui";
import { formatScore } from "../../utils/format";

/** Fallback institucional; la real la resuelve el backend. */
const DEFAULT_PASSING_SCORE = 13;

const route = useRoute();
const toastStore = useToastStore();

const courses = ref<TeacherCourseDTO[]>([]);
const data = ref<EvaluationsDTO | null>(null);
const selectedCourse = ref<number | null>(null);
const loading = ref(true);
const loadingTable = ref(false);
const savingScore = ref(false);

/** Nota aprobatoria propia de esta cohorte; null hereda la del curso. */
const customScore = ref<number | null>(null);
const useCustomScore = ref(false);

const weightTotal = computed(() => data.value?.totals.weight_total ?? 0);
const weightsOk = computed(() => data.value?.totals.weights_ok ?? true);

const load = async (offerCourseId: number) => {
  loadingTable.value = true;
  const { data: result } = await safeRequest(() =>
    teacherService.evaluations(offerCourseId),
  );
  data.value = result;

  /*
   * El endpoint de lectura no devuelve la nota efectiva del curso, así que se
   * parte del default y el docente decide si esta cohorte usa una propia. Al
   * guardar, la respuesta trae la que quedó vigente.
   */
  customScore.value = DEFAULT_PASSING_SCORE;
  useCustomScore.value = false;

  loadingTable.value = false;
};

const savePassingScore = async () => {
  if (!selectedCourse.value) return;

  savingScore.value = true;
  const { data: ok } = await safeRequest(() =>
    teacherService.setPassingScore(
      selectedCourse.value as number,
      useCustomScore.value ? customScore.value : null,
    ),
  );
  savingScore.value = false;

  if (ok) {
    toastStore.showToastSuccess({ detail: "Nota aprobatoria actualizada." });
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
    courses.value.find((c) => c.state === "in_progress")?.id ??
    courses.value[0]?.id ??
    null;

  loading.value = false;
});
</script>

<template>
  <div>
    <AulaPageHeader
      eyebrow="CUADRO DE EVALUACIÓN"
      title="Cuadro de evaluación"
      sub="Las evaluaciones del curso y cuánto pesa cada una en la nota final."
    />

    <AulaSkeleton v-if="loading" kind="page" :rows="4" />

    <AulaEmpty
      v-else-if="!courses.length"
      title="No tienes cursos asignados"
      sub="Cuando coordinación te asigne un curso podrás definir su cuadro de evaluación."
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

      <AulaSkeleton v-if="loadingTable" kind="table" :rows="4" />

      <template v-else>
        <div class="grid gap-3.5 sm:grid-cols-3 mb-5">
          <AulaStat
            label="Suma de pesos"
            :value="`${weightTotal}%`"
            :delta="
              weightsOk
                ? 'El cuadro está completo'
                : `Faltan ${Math.round((100 - weightTotal) * 100) / 100}%`
            "
            :tone="weightsOk ? 'success' : 'danger'"
          />
          <AulaStat
            label="Evaluaciones"
            :value="data?.evaluations.length || '—'"
            :delta="`${data?.evaluations.filter((e) => e.graded_count > 0).length ?? 0} con notas`"
          />
          <AulaStat
            label="Nota aprobatoria"
            :value="formatScore(useCustomScore ? customScore : DEFAULT_PASSING_SCORE)"
            :delta="useCustomScore ? 'la fija este grupo' : 'heredada del curso'"
            tone="warning"
          />
        </div>

        <AulaNotice v-if="!weightsOk" tone="danger" class="mb-4">
          Los pesos suman {{ weightTotal }}% y deben sumar 100%. Mientras no
          cuadren no se puede cerrar el acta del curso, y la nota que ve el
          alumno se calcula solo sobre el peso ya evaluado.
        </AulaNotice>

        <!-- Nota aprobatoria de la cohorte -->
        <AulaCard class="mb-4">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p
                class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight"
              >
                Escala y aprobación
              </p>
              <p class="text-adm-sm text-secondary-500 mt-1 max-w-140">
                La nota aprobatoria sale del grupo si lo define, y si no del
                curso. Cambiarla afecta las actas que aún no se cierran; las
                cerradas conservan su resultado.
              </p>
            </div>
            <div class="flex items-end gap-3">
              <div>
                <label
                  class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em] block mb-1.5"
                >
                  Mínima
                </label>
                <input
                  v-model.number="customScore"
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  :disabled="!useCustomScore"
                  class="w-20 px-2 py-1.5 rounded-adm-sm border border-line text-adm-base font-display font-bold text-center disabled:opacity-50"
                />
              </div>
              <ButtonCore
                label="Guardar"
                size="small"
                :loading="savingScore"
                @click="savePassingScore"
              />
            </div>
          </div>

          <label
            class="flex items-center gap-2 mt-3.5 pt-3.5 border-t border-line-soft text-adm-sm text-secondary-500 cursor-pointer"
          >
            <input
              v-model="useCustomScore"
              type="checkbox"
              class="accent-primary-500"
            />
            Este grupo usa su propia nota aprobatoria
            <span class="font-mono text-adm-xs text-secondary-400">
              {{
                useCustomScore
                  ? "se guarda solo para este grupo"
                  : `hereda la del curso`
              }}
            </span>
          </label>
        </AulaCard>

        <AulaCard v-if="data?.evaluations.length" pad="sm">
          <div class="overflow-x-auto">
            <table class="w-full min-w-160 text-adm-base">
              <thead>
                <tr
                  class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em]"
                >
                  <th class="text-left px-2 py-2 font-medium">#</th>
                  <th class="text-left px-2 py-2 font-medium">Evaluación</th>
                  <th class="text-left px-2 py-2 font-medium">Tipo</th>
                  <th class="text-left px-2 py-2 font-medium">Peso</th>
                  <th class="text-left px-2 py-2 font-medium">Nota máx.</th>
                  <th class="text-left px-2 py-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(evaluation, index) in data.evaluations"
                  :key="evaluation.id"
                  class="border-t border-line-soft"
                >
                  <td class="px-2 py-2.5 font-mono text-adm-sm text-secondary-400">
                    {{ index + 1 }}
                  </td>
                  <td class="px-2 py-2.5 text-secondary-900">
                    {{ evaluation.name }}
                  </td>
                  <td class="px-2 py-2.5 text-secondary-500">
                    {{ evaluation.evaluation_type_name ?? "—" }}
                  </td>
                  <td class="px-2 py-2.5 font-mono text-adm-sm">
                    {{ Number(evaluation.weight) }}%
                  </td>
                  <td class="px-2 py-2.5 font-mono text-adm-sm text-secondary-500">
                    {{ Number(evaluation.max_score) }}
                  </td>
                  <td class="px-2 py-2.5">
                    <AulaPill
                      :tone="evaluation.graded_count > 0 ? 'success' : 'neutral'"
                      size="sm"
                    >
                      {{
                        evaluation.graded_count > 0
                          ? `${evaluation.graded_count} calificadas`
                          : "Sin calificar"
                      }}
                    </AulaPill>
                  </td>
                </tr>
                <tr class="border-t border-line font-semibold">
                  <td class="px-2 py-2.5 text-secondary-900" colspan="3">
                    Suma de pesos
                  </td>
                  <td
                    class="px-2 py-2.5 font-mono"
                    :class="weightsOk ? 'text-success-DEFAULT' : 'text-danger-DEFAULT'"
                  >
                    {{ weightTotal }}%
                  </td>
                  <td class="px-2 py-2.5" colspan="2">
                    <AulaPill :tone="weightsOk ? 'success' : 'danger'" size="sm">
                      {{ weightsOk ? "Válido" : "Inválido" }}
                    </AulaPill>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </AulaCard>

        <AulaEmpty
          v-else
          title="Sin cuadro de evaluación"
          sub="Este curso todavía no tiene evaluaciones definidas. Se cargan desde el panel administrativo."
        />

        <AulaNotice tone="info" class="mt-4">
          Las evaluaciones se crean y editan desde el panel administrativo. Una
          que ya tiene notas registradas no cambia de peso ni se elimina:
          alteraría la nota de los alumnos ya calificados.
        </AulaNotice>
      </template>
    </template>
  </div>
</template>
