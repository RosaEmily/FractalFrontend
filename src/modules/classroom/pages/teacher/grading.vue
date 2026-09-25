<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import {
  ButtonCore,
  HeroCore,
  InputNumberCore,
  TextAreaCore,
} from "@/shared/components";
import {
  mdiAccountGroupOutline,
  mdiChartBoxOutline,
  mdiCommentOutline,
  mdiCheck,
  mdiPencilOutline,
} from "@mdi/js";
import ToggleCheck from "@/modules/admin/components/ui/toggle-check.vue";
import AvatarCell from "@/modules/admin/components/ui/avatar-cell.vue";
import teacherService from "../../services/teacher.service";
import type { GradebookDTO, TeacherCourseDTO } from "../../dto/teacher.dto";
import {
  AulaCard,
  AulaCourseSelect,
  AulaEmpty,
  AulaNotice,
  AulaPageHeader,
  AulaSkeleton,
  AulaSpinner,
  AulaStat,
} from "../../components/ui";
import { formatScore } from "../../utils/format";

const route = useRoute();
const toastStore = useToastStore();

const courses = ref<TeacherCourseDTO[]>([]);
const data = ref<GradebookDTO | null>(null);
const selectedCourse = ref<number | null>(null);
const loading = ref(true);
const loadingTable = ref(false);
const saving = ref(false);

/**
 * Notas en edición, indexadas por `alumno:evaluación`. Se inicializa con lo
 * guardado y solo se envía lo que el docente tocó.
 */
const edits = ref<Record<string, number | null>>({});

/**
 * ¿Esta evaluación ya se rindió?
 *
 * El diseño bloquea las columnas de evaluaciones que aún no se toman: sin eso
 * el docente puede escribir la nota de un examen que todavía no ocurrió, y esa
 * nota entra en el acumulado como si fuera real.
 *
 * `graded_count > 0` es la señal: basta con que un alumno tenga nota para que
 * la evaluación cuente como rendida.
 */
/**
 * Qué filas están en edición: el documento de un alumno, `"ALL"`, o nada.
 *
 * El diseño no deja la tabla siempre editable: se entra con el lápiz de una
 * fila (para corregir a un alumno) o con "Editar todo" en la cabecera. Así una
 * tabla de 30×5 celdas no es un campo minado donde cualquier clic cambia algo.
 */
const editing = ref<string | "ALL" | null>(null);

const isEditing = (document: string): boolean =>
  editing.value === "ALL" || editing.value === document;

/** Alumnos marcados para guardar en lote. */
const selectedRows = ref<string[]>([]);

/*
 * El checkbox solo tiene sentido en filas que se están editando: al salir de
 * edición se descartan las que ya no lo están, o quedaría una selección que no
 * se puede guardar.
 */
watch(editing, () => {
  selectedRows.value = selectedRows.value.filter((doc) => isEditing(doc));
});

const editableRows = computed(() =>
  (data.value?.students ?? []).filter((s) => isEditing(s.document_number)),
);

const allRowsSelected = computed(
  () =>
    selectedRows.value.length > 0 &&
    selectedRows.value.length === editableRows.value.length,
);

const toggleAllRows = () => {
  selectedRows.value = allRowsSelected.value
    ? []
    : editableRows.value.map((s) => s.document_number);
};

const toggleRow = (document: string) => {
  const index = selectedRows.value.indexOf(document);

  if (index === -1) selectedRows.value.push(document);
  else selectedRows.value.splice(index, 1);
};

/** Mínima del grupo; el backend la resuelve (propia o heredada del curso). */
const passingScore = computed(() => Number(data.value?.passing_score) || 13);

/** Una nota por debajo de la mínima se pinta en rojo, como en el diseño. */
const isFailing = (score: number | null | undefined): boolean =>
  score !== null && score !== undefined && score < passingScore.value;

const isTaken = (evaluationId: number): boolean =>
  (data.value?.evaluations.find((e) => e.id === evaluationId)?.graded_count ??
    0) > 0;

const cellKey = (studentId: number, evaluationId: number) =>
  `${studentId}:${evaluationId}`;

const hasChanges = computed(
  () =>
    Object.keys(edits.value).length > 0 ||
    Object.keys(feedbackEdits.value).length > 0,
);

/** Celdas sin nota donde la evaluación ya existe: lo que falta por registrar. */
/**
 * Reparto de columnas del diseño (`teacher.jsx:614`):
 * `36px minmax(200px,1fr) [92px por evaluación] 110px 56px`.
 *
 * ⚠️ El `1fr` de Alumno es quien absorbe el sobrante. Con una `<table>` pasaba
 * lo contrario —el ancho libre se repartía entre las columnas de nota— y la
 * columna del alumno quedaba vacía con todo apelotonado a la derecha.
 */
const gridColumns = computed(() => {
  const evaluations = data.value?.evaluations.length ?? 0;

  return `36px minmax(200px,1fr) ${"92px ".repeat(evaluations).trim()} 110px 56px`;
});

/** Mismo cálculo que el diseño: sin él las cabeceras se parten en 3 líneas. */
const gridMinWidth = computed(() => {
  const evaluations = data.value?.evaluations.length ?? 0;

  return 292 + evaluations * 92 + 110 + (evaluations + 3) * 14;
});

/**
 * La escala real del curso, sacada del `max_score` de sus evaluaciones.
 *
 * ⚠️ El diseño escribe "Escala vigesimal, 0 a 20", pero **la escala es
 * configurable por evaluación** (`course_evaluations.max_score`): un cuadro
 * sobre 100 hacía que el texto mintiera. Se conserva la redacción y solo el
 * número sale del dato.
 *
 * Si las evaluaciones no comparten escala se nombran todas, porque entonces
 * "0 a 20" sería falso para la mitad de las columnas.
 */
const scaleText = computed(() => {
  const scales = [
    ...new Set(
      (data.value?.evaluations ?? []).map((e) => Number(e.max_score)),
    ),
  ].filter((n) => Number.isFinite(n) && n > 0);

  if (!scales.length) return "Escala vigesimal, 0 a 20";

  if (scales.length === 1) {
    const max = scales[0] as number;

    return max === 20
      ? "Escala vigesimal, 0 a 20"
      : `Escala de 0 a ${formatScore(max)}`;
  }

  return `Escalas distintas por evaluación: ${scales
    .sort((a, b) => a - b)
    .map((n) => formatScore(n))
    .join(", ")}`;
});

/** Nombre del curso seleccionado: el aviso de notas faltantes lo nombra. */
const courseName = computed(
  () =>
    courses.value.find((c) => c.id === selectedCourse.value)?.course_name ?? "",
);

const missing = computed(() =>
  (data.value?.students ?? []).reduce(
    (total, student) =>
      total + student.scores.filter((s) => s.score === null).length,
    0,
  ),
);

/** Promedio del aula por evaluación, para la fila de cierre. */
const averages = computed(() => {
  const result = new Map<number, number | null>();

  (data.value?.evaluations ?? []).forEach((evaluation) => {
    const scores = (data.value?.students ?? [])
      .map(
        (s) =>
          s.scores.find((x) => x.course_evaluation_id === evaluation.id)?.score,
      )
      .filter((s): s is number => s !== null && s !== undefined);

    result.set(
      evaluation.id,
      scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
    );
  });

  return result;
});

const scoreOf = (studentIndex: number, evaluationId: number) =>
  data.value?.students[studentIndex]?.scores.find(
    (s) => s.course_evaluation_id === evaluationId,
  ) ?? null;

const load = async (offerCourseId: number) => {
  loadingTable.value = true;
  edits.value = {};
  const { data: result } = await safeRequest(() =>
    teacherService.gradebook(offerCourseId),
  );
  data.value = result;
  loadingTable.value = false;
};

/**
 * Una celda vacía borra la nota (null), que no es lo mismo que un 0: el 0
 * significa que el alumno rindió y sacó cero.
 */
/**
 * ⚠️ `InputNumberCore` entrega `number | null` — ya no un string del DOM: el
 * campo vacío llega como `null`, que es justo lo que `save()` manda para borrar
 * una nota. No hay que parsear nada.
 */
const onEdit = (
  studentId: number,
  evaluationId: number,
  value: number | null,
) => {
  edits.value[cellKey(studentId, evaluationId)] = value;
};

/*
 * Comentario por nota, aparte de la nota misma.
 *
 * ⚠️ Va en su propio registro y NO en `edits`: una celda puede tener comentario
 * sin tocar la nota (corregir una devolución) y al revés. Mezclarlos haría que
 * escribir un comentario mandara `score: null` y borrara la nota.
 */
const feedbackEdits = ref<Record<string, string>>({});

/**
 * Celda cuyo comentario está abierto. Solo una a la vez: dos popovers abiertos
 * se solapan y no se sabe cuál se está escribiendo.
 */
const openFeedback = ref<string | null>(null);

const toggleFeedback = (studentId: number, evaluationId: number) => {
  const key = cellKey(studentId, evaluationId);

  openFeedback.value = openFeedback.value === key ? null : key;
};

/*
 * La celda abierta se guarda por clave (`alumno:evaluación`) y la fila del
 * comentario necesita las dos partes por separado: el documento para saber
 * DEBAJO de qué fila se despliega, y el id para saber qué comentario edita.
 */
const openParts = computed(() => {
  if (!openFeedback.value) return null;

  const [studentId, evaluationId] = openFeedback.value.split(":").map(Number);

  return { studentId, evaluationId };
});

const openRow = computed(() => {
  const id = openParts.value?.studentId;

  return (
    data.value?.students.find((s) => s.enrollment_course_id === id)
      ?.document_number ?? null
  );
});

const openEvaluationId = computed(() => openParts.value?.evaluationId ?? null);

const openEvaluationName = computed(
  () =>
    data.value?.evaluations.find((e) => e.id === openEvaluationId.value)
      ?.name ?? "",
);

/** Comentario actual de la celda abierta, para la fila desplegada. */
const openFeedbackValue = (studentIndex: number): string =>
  openEvaluationId.value === null
    ? ""
    : feedbackOf(studentIndex, openEvaluationId.value);

const feedbackOf = (studentIndex: number, evaluationId: number): string => {
  const key = cellKey(
    data.value?.students[studentIndex]?.enrollment_course_id ?? 0,
    evaluationId,
  );
  return (
    feedbackEdits.value[key] ??
    scoreOf(studentIndex, evaluationId)?.feedback ??
    ""
  );
};

const onFeedback = (studentId: number, evaluationId: number, value: string) => {
  feedbackEdits.value[cellKey(studentId, evaluationId)] = value;
};

/**
 * Guarda las notas tocadas.
 *
 * `onlyStudents` acota a unos alumnos concretos —el lápiz de una fila o la
 * selección múltiple—: sin él, guardar a uno arrastraría los cambios a medias
 * de las demás filas que el docente dejó abiertas.
 */
const save = async (onlyStudents?: number[]) => {
  if (!selectedCourse.value || !hasChanges.value) return;

  saving.value = true;
  const { data: saved } = await safeRequest(() =>
    teacherService.saveGrades(
      selectedCourse.value as number,
      /*
       * Se envía la unión de celdas con nota tocada y celdas con comentario
       * tocado: cualquiera de las dos cosas es un cambio que guardar.
       */
      [
        ...new Set([
          ...Object.keys(edits.value),
          ...Object.keys(feedbackEdits.value),
        ]),
      ]
        .filter((key) =>
          onlyStudents
            ? onlyStudents.includes(Number(key.split(":")[0]))
            : true,
        )
        .map((key) => {
          const [studentId, evaluationId] = key.split(":").map(Number);
          const current = data.value?.students
            .find((s) => s.enrollment_course_id === studentId)
            ?.scores.find((x) => x.course_evaluation_id === evaluationId);

          return {
            enrollment_course_id: studentId as number,
            course_evaluation_id: evaluationId as number,
            // Si solo se tocó el comentario, se conserva la nota guardada.
            score:
              key in edits.value
                ? (edits.value[key] ?? null)
                : (current?.score ?? null),
            feedback: feedbackEdits.value[key]?.trim() || null,
          };
        }),
    ),
  );
  saving.value = false;

  if (saved) {
    /*
     * El POST devuelve el gradebook recalculado, así que se pinta con eso en
     * vez de volver a pedirlo: eran dos peticiones seguidas al mismo endpoint.
     */
    data.value = saved;
    edits.value = {};
    feedbackEdits.value = {};
    toastStore.showToastSuccess({ detail: "Notas guardadas." });
  }
};

/** Guarda lo editado y sale del modo edición (icono ✓ de fila o cabecera). */
const saveEditing = async (document?: string) => {
  const ids = document
    ? [studentIdOf(document)].filter((id): id is number => id !== null)
    : undefined;

  await save(ids);
  editing.value = null;
};

/** Guarda solo las filas marcadas con el checkbox. */
const saveSelected = async () => {
  const ids = selectedRows.value
    .map(studentIdOf)
    .filter((id): id is number => id !== null);

  await save(ids);
  selectedRows.value = [];
  editing.value = null;
};

/** El `enrollment_course_id` de un alumno: las notas se guardan por ese id. */
const studentIdOf = (document: string): number | null =>
  data.value?.students.find((s) => s.document_number === document)
    ?.enrollment_course_id ?? null;

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
      eyebrow="CALIFICACIÓN"
      title="Registro de notas"
      :sub="`Se registra curso por curso: los pesos vienen del cuadro de evaluación de ese curso y aquí solo pones nota y comentario por alumno. ${scaleText}.`"
    />

    <AulaSkeleton v-if="loading" kind="page" :rows="5" />

    <AulaEmpty
      v-else-if="!courses.length"
      title="Sin cursos asignados"
      sub="Cuando coordinación te asigne un curso, sus alumnos y notas aparecerán acá."
    />

    <template v-else>
      <AulaCourseSelect
        v-model="selectedCourse"
        :courses="courses"
        :filter="(c) => Number(c.weight_total) > 0"
        disabled-hint="Sin cuadro de evaluación"
      />

      <AulaSkeleton v-if="loadingTable" kind="table" :rows="8" />

      <template v-else-if="data">
        <div class="grid gap-3.5 sm:grid-cols-3 mb-5">
          <AulaStat label="Alumnos" :value="data.totals.students || '—'" />
          <AulaStat
            label="Evaluaciones"
            :value="data.evaluations.length || '—'"
            :delta="`suman ${data.totals.weight_total}%`"
            :tone="data.totals.weights_ok ? 'success' : 'danger'"
          />
          <AulaStat
            label="Notas por registrar"
            :value="missing || '—'"
            :delta="missing ? 'celdas vacías' : 'todo calificado'"
            :tone="missing ? 'warning' : 'success'"
          />
        </div>

        <AulaNotice
          v-if="missing"
          tone="warning"
          class="mb-4"
          :title="`${missing} notas sin registrar en ${courseName}`"
        >
          Corresponden a evaluaciones ya rendidas. Mientras falten, esos alumnos
          ven su promedio solo sobre el peso evaluado y el acta no se puede
          cerrar.
        </AulaNotice>

        <!--
          ⚠️ GRID, no `<table>`: el diseño (`AulaRow`, `shell.jsx:348`) reparte
          con `36px minmax(200px,1fr) [92px…] 110px 56px`, y ese `1fr` de Alumno
          es quien absorbe el sobrante. Una tabla hace lo contrario —reparte
          entre las columnas sin ancho—, así que las notas se ensanchaban y la
          columna Alumno quedaba vacía. Parchearlo con `w-full` funcionaba a
          medias; el grid es lo que el diseño define.
        -->
        <AulaCard
          v-if="data.students.length && data.evaluations.length"
          pad="none"
        >
          <div class="overflow-x-auto">
            <div :style="{ minWidth: `${gridMinWidth}px` }">
              <!-- Cabecera -->
              <div
                class="grid items-center gap-3.5 bg-surface-page px-[1.125rem] py-[0.813rem] font-mono text-[0.656rem] font-semibold uppercase tracking-[0.05em] text-secondary-400"
                :style="{ gridTemplateColumns: gridColumns }"
              >
                <ToggleCheck
                  label=""
                  :on="allRowsSelected"
                  @toggle="toggleAllRows"
                />
                <span>Alumno</span>
                <!--
                  Nombre y peso en la MISMA línea separados por `·`, como el
                  diseño.
                -->
                <span
                  v-for="evaluation in data.evaluations"
                  :key="evaluation.id"
                  class="text-center"
                >
                  {{ evaluation.name }} · {{ Number(evaluation.weight) }}%
                </span>
                <span class="text-center">Acumulado</span>
                <!-- Editar todo / Guardar todo, como en el diseño. -->
                <span class="flex justify-end">
                  <button
                    v-if="editing === 'ALL'"
                    type="button"
                    class="grid size-7 place-items-center rounded-pill bg-success-soft text-success-DEFAULT disabled:opacity-60"
                    :class="saving ? 'cursor-default' : 'cursor-pointer'"
                    :disabled="saving"
                    title="Guardar todo"
                    @click="saveEditing()"
                  >
                    <AulaSpinner v-if="saving" :size="12" />
                    <HeroCore v-else :path="mdiCheck" class="size-3.5" />
                  </button>
                  <button
                    v-else
                    type="button"
                    class="grid size-7 cursor-pointer place-items-center rounded-pill text-secondary-400"
                    title="Editar todo"
                    @click="editing = 'ALL'"
                  >
                    <HeroCore :path="mdiPencilOutline" class="size-3.5" />
                  </button>
                </span>
              </div>

              <template
                v-for="(student, index) in data.students"
                :key="student.enrollment_course_id"
              >
                <div
                  class="grid items-center gap-3.5 border-t border-line-soft px-[1.125rem] py-[0.813rem]"
                  :style="{ gridTemplateColumns: gridColumns }"
                >
                  <ToggleCheck
                    label=""
                    :on="selectedRows.includes(student.document_number)"
                    :disabled="!isEditing(student.document_number)"
                    @toggle="toggleRow(student.document_number)"
                  />

                  <!--
                    Avatar de iniciales + nombre, como el diseño (`AulaAvatar`).
                    La segunda línea es el AVANCE, no el documento: al calificar
                    importa cuánto peso lleva evaluado cada alumno.
                  -->
                  <AvatarCell
                    :name="student.full_name"
                    :secondary="`${student.evaluated_weight}% registrado`"
                  />

                  <div
                    v-for="evaluation in data.evaluations"
                    :key="evaluation.id"
                    class="min-w-0"
                  >
                    <!--
                      En LECTURA la nota es texto centrado, no un input: una
                      grilla de 30×5 con inputs vacíos parece un formulario a
                      medio llenar. En rojo si no llega a la mínima.
                    -->
                    <span
                      v-if="!isEditing(student.document_number)"
                      class="block text-center font-mono font-semibold"
                      :class="
                        isFailing(scoreOf(index, evaluation.id)?.score)
                          ? 'text-danger-DEFAULT'
                          : scoreOf(index, evaluation.id)?.score === null ||
                              scoreOf(index, evaluation.id)?.score === undefined
                            ? 'text-secondary-400'
                            : 'text-secondary-900'
                      "
                    >
                      {{
                        scoreOf(index, evaluation.id)?.score ??
                        (isTaken(evaluation.id) ? "—" : "sin rendir")
                      }}
                    </span>

                    <!--
                      Input e icono en una columna centrada (`gap: 4` del
                      diseño). Una evaluación que aún no se rinde queda
                      BLOQUEADA: si no, se carga la nota de un examen que no
                      ocurrió y entra al acumulado como real.
                    -->
                    <div v-else class="flex flex-col items-center gap-1">
                      <InputNumberCore
                        :model-value="
                          scoreOf(index, evaluation.id)?.score ?? null
                        "
                        class="aula-score w-18"
                        :step="0.5"
                        :min="0"
                        :max="Number(evaluation.max_score)"
                        :max-fraction-digits="1"
                        :show-buttons="false"
                        :disabled="!isTaken(evaluation.id)"
                        :placeholder="
                          isTaken(evaluation.id) ? '—' : 'sin rendir'
                        "
                        :class="[
                          isTaken(evaluation.id) ? '' : 'is-pending',
                          isTaken(evaluation.id) &&
                          scoreOf(index, evaluation.id)?.score === null
                            ? 'is-missing'
                            : '',
                          isFailing(scoreOf(index, evaluation.id)?.score)
                            ? 'is-failing'
                            : '',
                          edits[
                            cellKey(student.enrollment_course_id, evaluation.id)
                          ] !== undefined
                            ? 'is-edited'
                            : '',
                        ]"
                        @update:model-value="
                          onEdit(
                            student.enrollment_course_id,
                            evaluation.id,
                            $event,
                          )
                        "
                      />

                      <!--
                        Comentario de la nota. Solo en evaluaciones RENDIDAS:
                        comentar un examen que no ocurrió no tiene sentido. El
                        icono se enciende cuando ya hay texto.
                      -->
                      <button
                        v-if="isTaken(evaluation.id)"
                        type="button"
                        class="inline-flex cursor-pointer items-center justify-center"
                        :class="
                          feedbackOf(index, evaluation.id)
                            ? 'text-primary-600'
                            : 'text-secondary-400'
                        "
                        title="Comentario para el alumno"
                        @click.stop="
                          toggleFeedback(
                            student.enrollment_course_id,
                            evaluation.id,
                          )
                        "
                      >
                        <HeroCore :path="mdiCommentOutline" class="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <span
                    class="text-center font-display text-adm-lg font-extrabold text-secondary-900"
                  >
                    {{ formatScore(student.accumulated) }}
                  </span>

                  <!-- Editar / Guardar de la fila. -->
                  <span class="flex justify-end">
                    <button
                      v-if="isEditing(student.document_number)"
                      type="button"
                      class="grid size-7.5 place-items-center rounded-pill bg-success-soft text-success-DEFAULT disabled:opacity-60"
                      :class="saving ? 'cursor-default' : 'cursor-pointer'"
                      :disabled="saving"
                      title="Guardar"
                      @click="saveEditing(student.document_number)"
                    >
                      <AulaSpinner v-if="saving" :size="13" />
                      <HeroCore v-else :path="mdiCheck" class="size-3.5" />
                    </button>
                    <button
                      v-else
                      type="button"
                      class="grid size-7.5 cursor-pointer place-items-center rounded-pill text-secondary-400"
                      title="Editar"
                      @click="editing = student.document_number"
                    >
                      <HeroCore :path="mdiPencilOutline" class="size-3.5" />
                    </button>
                  </span>
                </div>

                <!--
                  Comentario en una FILA PROPIA, no en un popover flotante: un
                  `absolute` lo recorta el `overflow-x-auto` del contenedor.
                -->
                <div
                  v-if="openRow === student.document_number"
                  class="border-t border-line-soft bg-surface-page px-[1.125rem] py-3"
                >
                  <span
                    class="mb-1.5 block font-mono text-adm-xs uppercase tracking-[0.06em] text-secondary-400"
                  >
                    Comentario · {{ openEvaluationName }}
                  </span>
                  <TextAreaCore
                    :model-value="openFeedbackValue(index)"
                    :rows="2"
                    placeholder="Feedback para el alumno…"
                    :maxlength="1000"
                    @update:model-value="
                      onFeedback(
                        student.enrollment_course_id,
                        openEvaluationId!,
                        $event ?? '',
                      )
                    "
                  />
                  <div class="mt-1.5 text-right">
                    <button
                      type="button"
                      class="cursor-pointer text-adm-sm font-semibold text-primary-600"
                      @click="openFeedback = null"
                    >
                      Listo
                    </button>
                  </div>
                </div>
              </template>

              <!-- Fila de cierre: fondo crema y borde grueso, como el diseño. -->
              <div
                class="grid items-center gap-3.5 border-t-[1.5px] border-line bg-surface-page px-[1.125rem] py-[0.813rem] font-semibold"
                :style="{ gridTemplateColumns: gridColumns }"
              >
                <span />
                <span class="text-secondary-900">Promedio del aula</span>
                <span
                  v-for="evaluation in data.evaluations"
                  :key="evaluation.id"
                  class="text-center font-mono text-adm-sm"
                >
                  {{ formatScore(averages.get(evaluation.id) ?? null) }}
                </span>
                <span class="text-center font-mono text-adm-sm">
                  {{ data.totals.weight_total }}% total
                </span>
                <span />
              </div>
            </div>
          </div>
        </AulaCard>
        <!--
            Guardado en lote: se marcan varias filas en edición y se guardan de
            una vez. Pegada abajo, porque la tabla se hace larga.
          -->
        <div
          v-if="selectedRows.length"
          class="sticky bottom-4 z-5 flex items-center gap-3.5 flex-wrap px-4.5 py-3 rounded-adm-md bg-secondary-900 shadow-lg mt-3"
        >
          <span class="text-adm-base font-semibold text-white">
            {{ selectedRows.length }}
            {{ selectedRows.length === 1 ? "seleccionado" : "seleccionados" }}
          </span>

          <div class="flex gap-2 ml-auto items-center">
            <ButtonCore
              :label="`Guardar seleccionados (${selectedRows.length})`"
              class="w-auto"
              size="small"
              :loading="saving"
              @click="saveSelected"
            />
            <button
              type="button"
              class="cursor-pointer px-3 py-2 rounded-pill text-adm-sm font-semibold text-white opacity-70"
              @click="selectedRows = []"
            >
              Cancelar
            </button>
          </div>
        </div>

        <!--
          ⚠️ Condiciones EXPLÍCITAS, no `v-else`: la barra flotante de arriba
          lleva su propio `v-if`, así que rompe la cadena de la tabla y estos
          `v-else` encadenaban con ELLA — el estado vacío se pintaba debajo de
          una tabla llena de alumnos.
        -->
        <AulaEmpty
          v-if="!data.evaluations.length"
          :icon="mdiChartBoxOutline"
          title="Sin cuadro de evaluación"
          sub="Define primero las evaluaciones del curso; recién entonces se pueden registrar notas."
        />

        <AulaEmpty
          v-else-if="!data.students.length"
          :icon="mdiAccountGroupOutline"
          title="Sin alumnos matriculados"
          sub="Este curso todavía no tiene alumnos en su grupo."
        />

        <!--
          Sin botón de guardado suelto: se guarda con el ✓ de la fila, el de la
          cabecera ("Editar todo") o la barra de selección múltiple.
        -->
        <p
          v-if="data.students.length && data.evaluations.length"
          class="text-adm-sm text-secondary-400 mt-4"
        >
          Selecciona con el checkbox para guardar en grupo, o usa el lápiz de
          una fila para editarla y guardarla sola. Las columnas en crema son
          evaluaciones que aún no se rinden.
        </p>
      </template>
    </template>
  </div>
</template>
