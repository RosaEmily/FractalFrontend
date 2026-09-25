<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import {
  ButtonCore,
  HeroCore,
  InputNumberCore,
  InputTextCore,
  SelectCore,
} from "@/shared/components";
import {
  mdiAccountGroupOutline,
  mdiCertificateOutline,
  mdiChartBoxOutline,
  mdiCheck,
  mdiClipboardTextOutline,
  mdiClose,
  mdiContentSaveOutline,
  mdiPencilOutline,
  mdiPlus,
  mdiLockOutline,
} from "@mdi/js";
import ToggleCheck from "@/modules/admin/components/ui/toggle-check.vue";
import teacherService from "../../services/teacher.service";
import type {
  EvaluationTypeDTO,
  EvaluationsDTO,
  TeacherCourseDTO,
} from "../../dto/teacher.dto";
import {
  AulaCard,
  AulaCourseSelect,
  AulaEmpty,
  AulaNotice,
  AulaPageHeader,
  AulaSkeleton,
  AulaSpinner,
  AulaPill,
  AulaStat,
} from "../../components/ui";
import { formatScore } from "../../utils/format";

/** Fallback institucional; la real la resuelve el backend. */
const DEFAULT_PASSING_SCORE = 13;

/** Escala vigesimal por defecto (`course_evaluations.max_score`). */
const DEFAULT_MAX_SCORE = 20;

/**
 * Las 4 reglas que el diseño muestra junto al cuadro. Son las que el docente
 * necesita saber ANTES de guardar, no documentación: explican por qué una fila
 * calificada se bloquea y por qué la suma tiene que dar 100.
 */
const EVALUATION_RULES = [
  "Los pesos deben sumar exactamente 100% para cerrar el acta.",
  "Una evaluación ya calificada no se elimina ni cambia de peso: alteraría notas emitidas.",
  "El alumno ve el cuadro completo, con pesos, antes de rendir.",
  "La nota final es la suma de nota × peso ÷ 100, comparada contra la mínima aprobatoria.",
];

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

/** Catálogo del selector de tipo; se pide una vez y sirve para todos los cursos. */
const types = ref<EvaluationTypeDTO[]>([]);

/**
 * Filas del cuadro, en modo LECTURA o EDICIÓN.
 *
 * El diseño (`teacher.jsx` → `TeaEvalsFor`) alterna con el lápiz de la
 * cabecera, que al entrar se convierte en ✚ (agregar) y 💾 (guardar). En
 * lectura las filas son texto plano: sin inputs ni botón de quitar.
 *
 * ⚠️ `editing` arranca en `!publicado`: un cuadro vacío abre listo para
 * escribir —pedir un clic extra para empezar no tiene sentido— y uno ya
 * guardado abre en lectura, que es como se consulta casi siempre.
 *
 * Las filas son una COPIA de lo que devolvió la API: se manda el cuadro
 * completo y la API hace upsert (sin `id` crea, con `id` actualiza, lo que no
 * viaja se borra).
 */
const editing = ref(false);
const savingRows = ref(false);

/**
 * Edición de la tarjeta "Escala y aprobación", INDEPENDIENTE del cuadro.
 *
 * El diseño le da su propio lápiz: cambiar la nota mínima de un grupo no
 * obliga a entrar a editar las evaluaciones, y al revés. Fuera de edición los
 * números son texto plano.
 */
const editingScale = ref(false);
const rows = ref<EvaluationRow[]>([]);

interface EvaluationRow {
  id: number | null;
  name: string;
  evaluation_type_id: number | null;
  weight: number | null;
  /** Con notas puestas la API la protege: no se puede borrar ni cambiar peso. */
  graded_count: number;
}

/**
 * Nota máxima: UNA para todo el cuadro, no una por fila.
 *
 * `course_evaluations.max_score` es por evaluación en la BD, pero el diseño la
 * edita una sola vez ("ESCALA Y APROBACIÓN") y la aplica a todas: repetir "20"
 * en cada fila era ruido, y un cuadro con escalas mezcladas hace que el peso
 * deje de ser comparable entre evaluaciones.
 */
const maxScore = ref<number | null>(DEFAULT_MAX_SCORE);

const toRows = (): EvaluationRow[] =>
  (data.value?.evaluations ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    evaluation_type_id: e.evaluation_type_id,
    weight: Number(e.weight),
    graded_count: e.graded_count,
  }));

/** Suma en vivo de lo que se está editando. */
const draftWeight = computed(
  () =>
    Math.round(rows.value.reduce((sum, r) => sum + (r.weight ?? 0), 0) * 100) /
    100,
);

const draftOk = computed(() => Math.abs(draftWeight.value - 100) < 0.01);

/** Cuántas ya tienen notas: se muestran como "Calificada" y no se tocan. */
/** El curso seleccionado, para el contador de alumnos del diseño. */
/** Nombre del tipo para el modo lectura, donde no hay select que lo muestre. */
const typeName = (id: number | null): string =>
  types.value.find((t) => t.id === id)?.name ?? "—";

const currentCourse = computed(() =>
  courses.value.find((c) => c.id === selectedCourse.value),
);

const gradedCount = computed(
  () => rows.value.filter((r) => r.graded_count > 0).length,
);

/**
 * El peso de una fila nueva se autocompleta con lo que FALTA para 100.
 *
 * Es lo que hace el diseño (`Math.max(0, 100 - total)`) y evita el paso más
 * repetitivo: en un cuadro vacío la primera fila nace con 100, y cada una
 * siguiente con el resto.
 */
const addRow = () =>
  rows.value.push({
    id: null,
    name: "",
    evaluation_type_id: types.value[0]?.id ?? null,
    weight: Math.max(0, Math.round((100 - draftWeight.value) * 100) / 100),
    graded_count: 0,
  });

/** Solo se quitan las que no tienen notas: la API rechazaría las demás. */
const removeRow = (index: number) => {
  if (rows.value[index]?.graded_count) return;
  rows.value.splice(index, 1);
};

/**
 * Lo que la API exige y conviene avisar ANTES de mandar. Sin esto el error
 * llega como un 422 genérico que no dice qué fila falló.
 */
const rowsError = computed<string | null>(() => {
  if (!rows.value.length) return null;

  if (rows.value.some((r) => !r.name.trim()))
    return "Cada evaluación necesita un nombre.";

  if (rows.value.some((r) => !r.evaluation_type_id))
    return "Cada evaluación necesita un tipo.";

  if (rows.value.some((r) => r.weight === null || r.weight < 0))
    return "Cada evaluación necesita un peso.";

  if (!maxScore.value || maxScore.value <= 0)
    return "La nota máxima debe ser mayor que cero.";

  if (!draftOk.value)
    return `Los pesos suman ${draftWeight.value}% y deben sumar 100%.`;

  return null;
});

const saveRows = async ({ silent = false } = {}) => {
  if (!selectedCourse.value || rowsError.value) return;

  /*
   * La nota aprobatoria se guarda SIEMPRE, incluso si el cuadro no cambió: es
   * el mismo botón para toda la tarjeta. Va primero para que su validación
   * (check marcado y campo vacío) corte antes de escribir las evaluaciones.
   */
  const scoreOk = await savePassingScore({ silent: true });
  if (!scoreOk) return;

  savingRows.value = true;
  const { data: saved } = await safeRequest(() =>
    teacherService.saveEvaluations(
      selectedCourse.value as number,
      rows.value.map((r) => ({
        id: r.id,
        name: r.name.trim(),
        evaluation_type_id: r.evaluation_type_id as number,
        weight: r.weight as number,
        // La escala es del cuadro: va la misma en todas las filas.
        max_score: maxScore.value as number,
      })),
    ),
  );
  savingRows.value = false;

  if (!saved) return;

  /*
   * El POST ya devuelve el cuadro guardado y sus totales, así que se pinta con
   * eso en vez de volver a pedirlo: un GET extra al mismo endpoint no aporta
   * nada y deja la pantalla con los datos viejos mientras viaja.
   *
   * Las filas se rehacen desde la respuesta —no desde `rows`— porque el
   * servidor asigna el `id` de las nuevas; sin eso, volver a guardar las
   * crearía duplicadas en lugar de actualizarlas.
   */
  data.value = saved;
  rows.value = toRows();
  editing.value = false;

  /*
   * La nota aprobatoria se guarda junto con el cuadro, no con un botón propio:
   * el diseño pone UN solo "Guardar cuadro" para toda la pantalla, y "Nota
   * máxima" —que vive en la misma tarjeta— ya viajaba con las evaluaciones.
   * Dos botones para una tarjeta hacían imposible saber qué guardaba cuál.
   */
  if (!silent) {
    toastStore.showToastSuccess({ detail: "Cuadro de evaluación guardado." });
  }
};

const load = async (offerCourseId: number) => {
  loadingTable.value = true;
  const { data: result } = await safeRequest(() =>
    teacherService.evaluations(offerCourseId),
  );
  data.value = result;
  rows.value = toRows();
  // Un cuadro vacío abre en edición; uno ya definido, en lectura.
  editing.value = rows.value.length === 0;

  /*
   * La escala sale de lo guardado (todas las filas comparten `max_score`); un
   * cuadro vacío parte del default institucional.
   */
  maxScore.value = Number(result?.evaluations[0]?.max_score) || DEFAULT_MAX_SCORE;

  /*
   * La nota vigente y su origen vienen del endpoint. Antes se asumía el default
   * institucional y `is_custom = false`, así que una nota propia del grupo se
   * mostraba como 13 heredado en cuanto se recargaba la pantalla.
   */
  applyPassingScore(result?.passing_score, result?.is_custom);

  loadingTable.value = false;
};

/**
 * Fija la nota mostrada y si la define el grupo.
 *
 * Se usa al cargar Y al guardar: la respuesta de ambos endpoints trae los dos
 * datos, así que la pantalla nunca tiene que adivinarlos.
 */
const applyPassingScore = (
  score: number | string | null | undefined,
  isCustom: boolean | undefined,
) => {
  customScore.value = Number(score) || DEFAULT_PASSING_SCORE;
  useCustomScore.value = Boolean(isCustom);
};

/**
 * Persiste la nota aprobatoria del grupo.
 *
 * `silent` la encadena al guardado del cuadro sin un segundo toast: el docente
 * pulsó un botón, así que espera un solo mensaje.
 */
/**
 * Guarda la tarjeta de escala y sale de su edición.
 *
 * ⚠️ La nota máxima NO tiene endpoint propio: vive en cada evaluación
 * (`course_evaluations.max_score`), así que cambiarla obliga a re-guardar el
 * cuadro. Solo se hace si de verdad cambió, para no escribir evaluaciones por
 * tocar únicamente la nota mínima.
 */
const saveScale = async () => {
  const scoreOk = await savePassingScore({ silent: true });
  if (!scoreOk) return;

  const savedMax = Number(data.value?.evaluations[0]?.max_score) || null;

  if (rows.value.length && savedMax !== maxScore.value) {
    await saveRows({ silent: true });
  }

  editingScale.value = false;
  toastStore.showToastSuccess({ detail: "Escala actualizada." });
};

/** Vuelve a la nota heredada del curso, sin guardar todavía. */
const restoreCourseScore = () => {
  useCustomScore.value = false;
  customScore.value = DEFAULT_PASSING_SCORE;
};

const savePassingScore = async ({ silent = false } = {}): Promise<boolean> => {
  if (!selectedCourse.value) return false;

  /*
   * ⚠️ Con el check marcado y el campo vacío se mandaba `passing_score: null`,
   * que para la API significa "quita la nota propia y hereda la del curso" —
   * exactamente lo contrario de lo que el docente pidió, y sin ningún aviso.
   *
   * El caso es fácil de provocar: basta con borrar el número para escribir otro.
   */
  if (useCustomScore.value && customScore.value === null) {
    toastStore.showToastError({
      detail: "Escribe la nota aprobatoria del grupo o desmarca la casilla.",
    });
    return false;
  }

  savingScore.value = true;
  // Al encadenarse tras el cuadro, el indicador de carga ya lo lleva ese botón.
  const { data: saved } = await safeRequest(() =>
    teacherService.setPassingScore(
      selectedCourse.value as number,
      useCustomScore.value ? customScore.value : null,
    ),
  );
  savingScore.value = false;

  if (!saved) return false;

  /*
   * El PATCH responde con la nota que quedó vigente: al desmarcar el check, la
   * heredada del curso. Sin usarla, el campo seguía mostrando el valor que el
   * docente acababa de descartar.
   */
  applyPassingScore(saved.passing_score, saved.is_custom);

  if (!silent) {
    toastStore.showToastSuccess({ detail: "Nota aprobatoria actualizada." });
  }

  return true;
};

watch(selectedCourse, async (id) => {
  // `load` reemplaza las filas: las anteriores son de OTRO cuadro y guardarlas
  // acá las mandaría al curso equivocado.
  rows.value = [];
  if (id) await load(id);
});

onMounted(async () => {
  const [{ data: list }, { data: typeList }] = await Promise.all([
    safeRequest(() => teacherService.courses()),
    safeRequest(() => teacherService.evaluationTypes(), { showAlert: false }),
  ]);
  courses.value = list ?? [];
  types.value = typeList ?? [];

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
      eyebrow="ESTRUCTURA DEL CURSO"
      title="Cuadro de evaluación"
      sub="Se define curso por curso: qué se evalúa y cuánto pesa cada evaluación. Los pesos deben sumar 100% para poder cerrar el acta, y el alumno ve el cuadro antes de rendir."
    />

    <AulaSkeleton v-if="loading" kind="page" :rows="4" />

    <AulaEmpty
      v-else-if="!courses.length"
      title="Sin cursos asignados"
      sub="Cuando coordinación te asigne un curso podrás definir su cuadro de evaluación."
    />

    <template v-else>
      <AulaCourseSelect
        v-model="selectedCourse"
        :courses="courses"
        disabled-hint="Aún no cargado"
      />

      <AulaSkeleton v-if="loadingTable" kind="table" :rows="4" />

      <template v-else>
        <!-- Acciones arriba, como el diseño: el cuadro SIEMPRE es editable. -->
        <div class="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4 mb-5">
          <AulaStat
            :icon="mdiChartBoxOutline"
            label="Suma de pesos"
            :value="`${draftWeight}%`"
            :delta="
              draftOk
                ? 'correcta'
                : draftWeight < 100
                  ? `faltan ${Math.round((100 - draftWeight) * 100) / 100}%`
                  : `sobran ${Math.round((draftWeight - 100) * 100) / 100}%`
            "
            :tone="draftOk ? 'success' : 'danger'"
          />
          <AulaStat
            :icon="mdiClipboardTextOutline"
            label="Evaluaciones"
            :value="rows.length || '—'"
            :delta="`${gradedCount} ya calificadas`"
          />
          <AulaStat
            :icon="mdiAccountGroupOutline"
            label="Alumnos"
            tone="info"
            :value="currentCourse?.students_count ?? '—'"
          />
          <AulaStat
            :icon="mdiCertificateOutline"
            label="Mínima aprobatoria"
            :value="`${formatScore(customScore)} / ${formatScore(maxScore)}`"
            :delta="useCustomScore ? 'la fija este grupo' : 'heredada del curso'"
            tone="warning"
          />
        </div>

        <!--
          El diseño titula el aviso con la suma y deja la consecuencia debajo:
          "faltan 5%" no dice por qué importa.
        -->
        <AulaNotice
          v-if="rows.length && !draftOk"
          tone="danger"
          :title="`Los pesos suman ${draftWeight}%, no 100%`"
          class="mb-4"
        >
          Mientras no sumen 100% no puedes cerrar el acta del curso, y la nota
          que ve el alumno se calcula solo sobre el peso ya evaluado.
        </AulaNotice>

        <!-- El resto de validaciones (nombre, tipo, escala) van sin título. -->
        <AulaNotice
          v-else-if="rowsError"
          tone="danger"
          class="mb-4"
        >
          {{ rowsError }}
        </AulaNotice>

        <AulaCard pad="none">
          <div class="overflow-x-auto">
            <table class="w-full min-w-195 text-adm-base">
              <thead>
                <!-- La cabecera lleva fondo crema: separa la tabla del resto. -->
                <tr
                  class="font-mono text-[0.656rem] font-semibold text-secondary-400 uppercase tracking-[0.05em] bg-surface-page"
                >
                  <th class="text-left font-semibold px-[1.125rem] py-[0.813rem] w-11">#</th>
                  <th class="text-left font-semibold px-[1.125rem] py-[0.813rem]">Evaluación</th>
                  <th class="text-left font-semibold px-[1.125rem] py-[0.813rem] w-38">Tipo</th>
                  <th class="text-left font-semibold px-[1.125rem] py-[0.813rem] w-25">Peso</th>
                  <th class="text-left font-semibold px-[1.125rem] py-[0.813rem] w-25">Nota máx.</th>
                  <th class="text-left font-semibold px-[1.125rem] py-[0.813rem] w-28">Estado</th>
                  <!--
                    Acciones del cuadro: en lectura un lápiz; en edición, ✚ para
                    agregar y 💾 para guardar (así lo dibuja el diseño).
                  -->
                  <th class="px-[1.125rem] py-[0.813rem] w-18">
                    <div v-if="editing" class="flex gap-2.5 justify-end">
                      <button
                        type="button"
                        class="cursor-pointer text-secondary-400 hover:text-secondary-900"
                        title="Agregar evaluación"
                        @click="addRow"
                      >
                        <HeroCore :path="mdiPlus" class="size-4" />
                      </button>
                      <button
                        type="button"
                        class="text-primary-500 disabled:opacity-60"
                        :class="savingRows ? 'cursor-default' : 'cursor-pointer'"
                        title="Guardar cuadro"
                        :disabled="Boolean(rowsError) || savingRows || savingScore"
                        @click="saveRows()"
                      >
                        <AulaSpinner v-if="savingRows" :size="15" />
                        <HeroCore
                          v-else
                          :path="mdiContentSaveOutline"
                          class="size-4"
                        />
                      </button>
                    </div>
                    <button
                      v-else
                      type="button"
                      class="cursor-pointer text-secondary-400 hover:text-secondary-900 flex ml-auto"
                      title="Editar cuadro"
                      @click="editing = true"
                    >
                      <HeroCore :path="mdiPencilOutline" class="size-3.5" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, index) in rows"
                  :key="index"
                  class="border-t border-line-soft"
                >
                  <td class="px-[1.125rem] py-[0.813rem] font-mono text-adm-sm text-secondary-400">
                    {{ index + 1 }}
                  </td>
                  <td class="px-[1.125rem] py-[0.813rem]">
                    <InputTextCore
                      v-if="editing"
                      v-model="row.name"
                      class="aula-field"
                      placeholder="Nombre de la evaluación"
                      :maxlength="100"
                    />
                    <span v-else class="font-semibold text-secondary-900">
                      {{ row.name || "—" }}
                    </span>
                  </td>
                  <td class="px-[1.125rem] py-[0.813rem]">
                    <SelectCore
                      v-if="editing"
                      v-model="row.evaluation_type_id"
                      class="aula-field"
                      :options="types"
                      option-label="name"
                      option-value="id"
                      placeholder="Tipo"
                    />
                    <span v-else class="text-secondary-500">
                      {{ typeName(row.evaluation_type_id) }}
                    </span>
                  </td>
                  <td class="px-[1.125rem] py-[0.813rem]">
                    <span
                      v-if="!editing"
                      class="font-mono font-semibold text-secondary-900"
                    >
                      {{ row.weight ?? 0 }}%
                    </span>
                    <div v-else class="flex items-center gap-1.5">
                      <!--
                        Una evaluación ya calificada no cambia de peso: alteraría
                        las notas emitidas (regla del cuadro en el diseño).
                      -->
                      <InputNumberCore
                        v-model="row.weight"
                        class="aula-score w-16"
                        :min="0"
                        :max="100"
                        :max-fraction-digits="2"
                        :show-buttons="false"
                        :disabled="row.graded_count > 0"
                      />
                      <span class="font-mono text-adm-sm text-secondary-400">%</span>
                    </div>
                  </td>
                  <!-- La escala es del cuadro, no de la fila: solo se muestra. -->
                  <td class="px-[1.125rem] py-[0.813rem] font-mono text-adm-sm text-secondary-500">
                    {{ formatScore(maxScore) }}
                  </td>
                  <td class="px-[1.125rem] py-[0.813rem]">
                    <AulaPill
                      :tone="row.graded_count ? 'success' : 'neutral'"
                      size="sm"
                    >
                      {{ row.graded_count ? "Calificada" : "Sin calificar" }}
                    </AulaPill>
                  </td>
                  <td class="px-[1.125rem] py-[0.813rem] text-right">
                    <template v-if="!editing" />
                    <HeroCore
                      v-else-if="row.graded_count"
                      :path="mdiLockOutline"
                      class="size-4 text-secondary-400 inline-block"
                    />
                    <button
                      v-else
                      type="button"
                      class="cursor-pointer text-secondary-400 hover:text-danger-DEFAULT"
                      aria-label="Quitar evaluación"
                      @click="removeRow(index)"
                    >
                      <HeroCore :path="mdiClose" class="size-4" />
                    </button>
                  </td>
                </tr>

                <!-- Suma de pesos: el diseño la pone como última fila. -->
                <tr
                  v-if="rows.length"
                  class="border-t-[1.5px] border-line bg-surface-page"
                >
                  <td class="px-[1.125rem] py-[0.813rem]" />
                  <td
                    class="px-2 py-2.5 text-adm-base font-bold text-secondary-900"
                  >
                    Suma de pesos
                  </td>
                  <td class="px-[1.125rem] py-[0.813rem]" />
                  <td
                    class="px-2 py-2.5 font-display text-adm-lg font-extrabold"
                    :class="draftOk ? 'text-success-DEFAULT' : 'text-danger-DEFAULT'"
                  >
                    {{ draftWeight }}%
                  </td>
                  <td class="px-[1.125rem] py-[0.813rem]" />
                  <!-- 7 celdas como las filas: la pill cae bajo "Estado". -->
                  <td class="px-[1.125rem] py-[0.813rem]">
                    <AulaPill :tone="draftOk ? 'success' : 'danger'" size="sm">
                      {{ draftOk ? "Válido" : "Inválido" }}
                    </AulaPill>
                  </td>
                  <td class="px-[1.125rem] py-[0.813rem]" />
                </tr>
              </tbody>
            </table>
          </div>

          <AulaEmpty
            v-if="!rows.length"
            :icon="mdiChartBoxOutline"
            title="Este curso aún no tiene cuadro de evaluación"
            sub="Agrega las evaluaciones con sus pesos antes del inicio: el alumno debe conocerlas antes de rendir."
          >
            <ButtonCore
              label="Agregar la primera"
              class="w-auto"
              size="small"
              @click="addRow"
            />
          </AulaEmpty>
        </AulaCard>

        <div class="grid gap-3.5 lg:grid-cols-2 mt-5">
          <!-- Escala y aprobación: la nota máxima es UNA para todo el cuadro. -->
          <AulaCard pad="sm">
            <div class="flex items-center justify-between mb-4">
              <p
                class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em]"
              >
                Escala y aprobación
              </p>

              <button
                v-if="editingScale"
                type="button"
                class="grid size-6.5 place-items-center rounded-pill bg-success-soft text-success-DEFAULT disabled:opacity-60"
                :class="
                  savingScore || savingRows ? 'cursor-default' : 'cursor-pointer'
                "
                title="Guardar"
                :disabled="savingScore || savingRows"
                @click="saveScale"
              >
                <AulaSpinner v-if="savingScore || savingRows" :size="12" />
                <HeroCore v-else :path="mdiCheck" class="size-3.5" />
              </button>
              <button
                v-else
                type="button"
                class="cursor-pointer grid size-6.5 place-items-center rounded-pill text-secondary-400 hover:text-secondary-900"
                title="Editar"
                @click="editingScale = true"
              >
                <HeroCore :path="mdiPencilOutline" class="size-3.5" />
              </button>
            </div>

            <div class="flex flex-wrap gap-7.5">
              <div>
                <p class="text-adm-sm text-secondary-500 mb-1.5">Nota máxima</p>
                <InputNumberCore
                  v-if="editingScale"
                  v-model="maxScore"
                  class="aula-scale w-20"
                  :min="1"
                  :max="100"
                  :max-fraction-digits="2"
                  :show-buttons="false"
                />
                <p
                  v-else
                  class="font-display text-2xl font-extrabold text-secondary-900"
                >
                  {{ formatScore(maxScore) }}
                </p>
              </div>

              <div>
                <p class="text-adm-sm text-secondary-500 mb-1.5">
                  Mínima aprobatoria
                </p>
                <div class="inline-flex items-center gap-2">
                  <InputNumberCore
                    v-if="editingScale"
                    v-model="customScore"
                    class="aula-scale w-20"
                    :min="0"
                    :max="maxScore ?? 20"
                    :max-fraction-digits="2"
                    :show-buttons="false"
                    :disabled="!useCustomScore"
                  />
                  <p
                    v-else
                    class="font-display text-2xl font-extrabold text-secondary-900"
                  >
                    {{ formatScore(customScore) }}
                  </p>
                  <span class="text-adm-sm text-secondary-400">
                    / {{ formatScore(maxScore) }}
                  </span>
                </div>
              </div>
            </div>

            <div
              class="mt-4.5 pt-4 border-t border-line-soft flex items-start justify-between gap-3"
            >
              <ToggleCheck
                :disabled="!editingScale"
                label="Este grupo usa su propia nota aprobatoria"
                :hint="
                  useCustomScore
                    ? 'Se guarda solo para este grupo (offer_courses)'
                    : 'Se guarda en el curso y aplica a todos sus grupos'
                "
                :on="useCustomScore"
                @toggle="useCustomScore = $event"
              />

              <!--
                Atajo para volver a la nota del curso sin tener que desmarcar y
                recordar cuál era: el diseño lo ofrece solo cuando el grupo tiene
                nota propia, que es cuando hay algo que restaurar.
              -->
              <button
                v-if="editingScale && useCustomScore"
                type="button"
                class="cursor-pointer shrink-0 whitespace-nowrap text-adm-sm font-semibold text-primary-600"
                title="Restaurar la nota del curso"
                @click="restoreCourseScore"
              >
                Restaurar a {{ formatScore(DEFAULT_PASSING_SCORE) }}
              </button>
            </div>

          </AulaCard>

          <!-- Reglas del cuadro: las 4 del diseño, en el mismo orden. -->
          <AulaCard pad="sm">
            <p
              class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em] mb-4"
            >
              Reglas del cuadro
            </p>

            <div class="flex flex-col gap-3.5">
              <div
                v-for="rule in EVALUATION_RULES"
                :key="rule"
                class="flex items-start gap-2.5"
              >
                <span
                  class="grid size-4.5 shrink-0 place-items-center rounded-pill bg-success-soft mt-px"
                >
                  <HeroCore
                    :path="mdiCheck"
                    class="size-2.5 text-success-DEFAULT"
                  />
                </span>
                <span class="text-adm-base text-secondary-500 leading-relaxed">
                  {{ rule }}
                </span>
              </div>
            </div>

            <div v-if="rows.length && draftOk" class="mt-4.5">
              <AulaPill tone="success" size="sm">
                Publicado para los alumnos
              </AulaPill>
            </div>
          </AulaCard>
        </div>
      </template>
    </template>
  </div>
</template>
