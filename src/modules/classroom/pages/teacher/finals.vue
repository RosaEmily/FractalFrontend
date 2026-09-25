<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ButtonCore, HeroCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import {
  mdiCheckCircleOutline,
  mdiCloseCircleOutline,
  mdiTrophyOutline,
  mdiChartBoxOutline,
  mdiClipboardTextOutline,
} from "@mdi/js";
import teacherService from "../../services/teacher.service";
import type { FinalsDTO, TeacherCourseDTO } from "../../dto/teacher.dto";
import {
  AulaAvatar,
  AulaCard,
  AulaCourseSelect,
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

/**
 * ⚠️ El selector es el MISMO de las otras pantallas del docente, no pestañas.
 *
 * Estuvo con `AulaTabs` y el comentario decía que era "como en el diseño": no
 * lo era. `teacher.jsx` no usa `AulaTabs` ni una sola vez — las 4 pantallas
 * usan `AulaCourseSwitch`, y el estado del curso se comunica atenuando el que
 * no se puede cerrar, no metiéndolo en la etiqueta.
 */
const data = ref<FinalsDTO | null>(null);

/** "Revit Architecture · BIM-2026-03": lo que se va a cerrar, nombrado. */
const courseLabel = computed(() => {
  const course = courses.value.find((c) => c.id === selectedCourse.value);

  if (!course) return "este curso";

  return `${course.course_name} · ${course.offer_prefix ?? course.offer_name}`;
});

/** Fin del curso: el aviso de cierre lo cita para justificar la urgencia. */
const courseEndDate = computed(() => {
  const course = courses.value.find((c) => c.id === selectedCourse.value);

  return course?.end_date ? formatDate(course.end_date, true) : "—";
});

/**
 * Cursos del docente que NO pueden tener acta todavía, con su motivo.
 *
 * ⚠️ El diseño los AVISA en vez de solo atenuarlos en el selector
 * (`teacher.jsx:752`): "no aparece habilitado" sin explicación manda a buscar
 * alumnos que faltan, cuando lo que falta suele ser el cuadro de evaluación.
 *
 * Los motivos son literales del diseño (`aulaMotivoSinActa`, jsx:726).
 */
const blockedCourses = computed(() =>
  courses.value
    .filter((c) => !(Number(c.weight_total) > 0))
    .map((c) => ({
      id: c.id,
      name: c.course_name,
      group: c.offer_prefix ?? c.offer_name,
      reason: !c.sessions_total
        ? "Aún sin datos cargados"
        : "Sin cuadro de evaluación",
    })),
);

/** Alumnos sin nota final: es lo que queda por hacer antes de cerrar. */
const missingFinals = computed(() =>
  data.value ? data.value.totals.students - data.value.totals.with_grade : 0,
);

/**
 * Promedio de las notas YA calculadas, no de todo el curso.
 *
 * Promediar contando como 0 a quien no tiene nota hundiría el número y haría
 * parecer que el aula va peor de lo que va.
 */
const classAverage = computed(() => {
  const scores = (data.value?.students ?? [])
    .map((s) => Number(s.final_score))
    .filter((n) => Number.isFinite(n));

  if (!scores.length) return "—";

  return formatScore(scores.reduce((a, b) => a + b, 0) / scores.length);
});

/** Suma de pesos del curso seleccionado, para el stat del cuadro. */
const weightTotal = computed(() => {
  const course = courses.value.find((c) => c.id === selectedCourse.value);

  return course ? Number(course.weight_total) : 0;
});
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

  /*
   * Los TEXTOS son los del diseño (`teacher.jsx:776`), pero la lista es de 5 y
   * no de 3.
   *
   * ⚠️ El diseño solo dibuja los 3 últimos porque su mockup da por hecho que el
   * curso ya tiene cuadro y alumnos. La API valida los 5, así que ocultar los
   * dos primeros dejaría el botón bloqueado con TODO en "Cumple" y nada en
   * pantalla que explique por qué.
   */
  return [
    { label: "El curso tiene cuadro de evaluación", ok: req.has_evaluations },
    { label: "Hay alumnos matriculados", ok: req.has_students },
    { label: "Los pesos suman 100%", ok: req.weights_ok },
    {
      label: "Todas las evaluaciones calificadas",
      ok: req.all_graded,
      detail: req.missing_scores ? `faltan ${req.missing_scores}` : undefined,
    },
    {
      label: "Todas las clases marcadas como dictadas",
      ok: req.all_sessions_done,
      detail: req.pending_sessions
        ? `quedan ${req.pending_sessions}`
        : undefined,
    },
  ];
});

/**
 * Por qué NO se puede cerrar, en una frase. El diseño lo pone como aviso rojo
 * sobre la lista de requisitos (`teacher.jsx:771`).
 *
 * La lista dice QUÉ falta; el aviso dice CUÁNTO, que es lo que permite estimar
 * el trabajo pendiente sin entrar a cada pantalla.
 */
const blockingReason = computed(() => {
  const req = data.value?.requirements;

  if (!req || data.value?.can_close || data.value?.is_closed) return null;

  const parts: string[] = [];

  if (!req.has_evaluations)
    parts.push("el curso no tiene cuadro de evaluación");
  if (!req.has_students) parts.push("no hay alumnos matriculados");
  if (!req.weights_ok)
    parts.push(`los pesos suman ${weightTotal.value}% y no 100%`);
  if (req.missing_scores)
    parts.push(`quedan ${req.missing_scores} notas sin registrar`);
  if (req.pending_sessions)
    parts.push(`${req.pending_sessions} clases siguen pendientes`);

  if (!parts.length) return null;

  // `noUncheckedIndexedAccess`: el índice devuelve `T | undefined` aunque la
  // longitud esté comprobada.
  const list =
    parts.length === 1
      ? (parts[0] ?? "")
      : `${parts.slice(0, -1).join(", ")} y ${parts[parts.length - 1] ?? ""}`;

  return `${list.charAt(0).toUpperCase()}${list.slice(1)}.`;
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
  <!--
    El contenedor reparte con `gap`, como el diseño: los `mb-4` por hijo daban
    un resultado distinto y se olvidaban en alguno.
  -->
  <div class="flex flex-col gap-4">
    <AulaPageHeader
      eyebrow="CIERRE DE CURSO"
      title="Actas y notas finales"
      sub="El acta convierte las notas ponderadas en la nota final de cada alumno. Se cierra una vez: con eso queda el aprobado o desaprobado y se habilitan los certificados."
    />

    <AulaSkeleton v-if="loading" kind="page" :rows="5" />

    <AulaEmpty
      v-else-if="!courses.length"
      title="Sin cursos asignados"
      sub="Cuando coordinación te asigne un curso podrás cerrar su acta al terminarlo."
    />

    <template v-else>
      <AulaCourseSelect
        v-model="selectedCourse"
        :courses="courses"
        :filter="(c) => Number(c.weight_total) > 0"
        disabled-hint="Sin evaluaciones que cerrar todavía"
      />

      <AulaSkeleton v-if="loadingTable" kind="table" :rows="7" />

      <template v-else-if="data">
        <!--
          Un curso que no aparece habilitado en el selector: se dice POR QUÉ.
          Sin esto el docente busca el problema en los alumnos inscritos.
        -->
        <AulaNotice
          v-for="blocked in blockedCourses"
          :key="blocked.id"
          :title="`${blocked.name} · ${blocked.group} no aparece habilitado aquí`"
        >
          No es por falta de alumnos inscritos: {{ blocked.reason }}. El acta se
          habilita cuando el docente registra el cuadro de evaluación y rinde al
          menos una evaluación.
        </AulaNotice>

        <div class="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4 mb-5">
          <AulaStat
            label="Notas finales"
            :value="`${data.totals.with_grade}/${data.totals.students}`"
            :delta="
              missingFinals ? `${missingFinals} por calcular` : 'acta completa'
            "
            :icon="mdiTrophyOutline"
            :tone="missingFinals ? 'warning' : 'success'"
          />
          <AulaStat
            label="Aprobados"
            :value="data.totals.approved || '—'"
            :delta="`nota ≥ ${formatScore(data.totals.passing_score)}`"
            :icon="mdiCheckCircleOutline"
            tone="success"
          />
          <!--
            El promedio del aula y la suma de pesos son lo que sustenta el
            cierre: sin ellos el docente no sabe si el acta que va a cerrar
            tiene sentido.
          -->
          <AulaStat
            label="Promedio del aula"
            :value="classAverage"
            :icon="mdiChartBoxOutline"
            tone="info"
          />
          <AulaStat
            label="Suma de pesos"
            :value="`${weightTotal}%`"
            :delta="data.requirements.weights_ok ? 'válida' : 'no suma 100%'"
            :icon="mdiClipboardTextOutline"
            :tone="data.requirements.weights_ok ? 'success' : 'danger'"
          />
        </div>

        <!-- Acta cerrada: estado final, no hay nada que hacer -->
        <AulaNotice
          v-if="data.is_closed"
          tone="info"
          title="Acta cerrada y publicada"
        >
          Las {{ data.totals.students }} notas finales quedaron registradas y
          visibles para los alumnos, con tu nombre y la fecha del cierre en el
          acta. Los aprobados pasan a la cola de emisión de certificados de
          coordinación académica.
        </AulaNotice>

        <!-- Confirmación: el cierre no se puede deshacer -->
        <AulaCard
          v-else-if="confirming"
          class="border-primary-500 border-2"
        >
          <span
            class="mb-3 block font-mono text-adm-xs uppercase tracking-[0.06em] text-primary-600"
          >
            Confirmar cierre del acta
          </span>
          <p
            class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight"
          >
            Vas a cerrar el acta de {{ courseLabel }}
          </p>
          <p class="text-adm-base text-secondary-500 mt-2 max-w-155">
            Se calcularán las {{ missingFinals }} notas finales que faltan con
            la suma ponderada del cuadro de evaluación, comparadas contra la
            mínima aprobatoria de {{ formatScore(data.totals.passing_score) }},
            y todas quedarán publicadas para los alumnos. El acta guarda tu
            nombre y la hora del cierre, y
            <strong class="text-secondary-900">no se puede reabrir</strong>:
            cualquier corrección posterior la autoriza coordinación académica.
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

        <!--
          El aviso dice CUÁNTO falta; la lista de abajo, QUÉ. El diseño los
          pone juntos (`teacher.jsx:771`) porque con la lista sola hay que
          entrar a cada pantalla para saber el tamaño del pendiente.
        -->
        <AulaNotice
          v-else-if="blockingReason"
          tone="danger"
          title="Este curso todavía no se puede cerrar"
        >
          {{ blockingReason }} Corrige el cuadro de evaluación y registra las
          notas.
        </AulaNotice>

        <!--
          Acta lista para cerrar: el diseño (`teacher.jsx:802`) NO pinta la
          lista de requisitos —están todos cumplidos— sino este aviso con el
          botón DENTRO, a la derecha.
        -->
        <AulaNotice
          v-if="!data.is_closed && !confirming && data.can_close"
          :title="`${missingFinals} alumnos sin nota final`"
        >
          <template #action>
            <ButtonCore label="Cerrar el acta" @click="confirming = true" />
          </template>
          El curso terminó el {{ courseEndDate }}. Revisa el cuadro y ciérralo:
          mientras el acta esté abierta, esos alumnos ven "nota final pendiente
          de cálculo" y no reciben certificado.
        </AulaNotice>

        <!-- Requisitos: se calculan en el servidor, la vista solo los muestra -->
        <AulaCard
          v-if="!data.is_closed && !confirming && !data.can_close"
        >
          <span
            class="block font-mono text-adm-xs uppercase tracking-[0.06em] text-secondary-400"
          >
            Requisitos para cerrar el acta
          </span>
          <ul class="mt-3">
            <li
              v-for="item in requirements"
              :key="item.label"
              class="flex items-center gap-2.5 border-b border-line-soft py-3 text-adm-base last:border-0"
            >
              <!--
                Círculo de color, no solo el icono: el diseño hace que el
                requisito incumplido se vea antes de leer la fila.
              -->
              <span
                class="inline-flex size-[1.375rem] shrink-0 items-center justify-center rounded-pill"
                :class="item.ok ? 'bg-success-soft' : 'bg-danger-soft'"
              >
                <HeroCore
                  :path="
                    item.ok ? mdiCheckCircleOutline : mdiCloseCircleOutline
                  "
                  class="size-3.5"
                  :class="
                    item.ok ? 'text-success-DEFAULT' : 'text-danger-DEFAULT'
                  "
                />
              </span>
              <span class="text-secondary-900">{{ item.label }}</span>
              <span class="ml-auto flex items-center gap-2">
                <span v-if="item.detail" class="text-adm-sm text-secondary-400">
                  {{ item.detail }}
                </span>
                <AulaPill :tone="item.ok ? 'success' : 'danger'" size="sm">
                  {{ item.ok ? "Cumple" : "Falta" }}
                </AulaPill>
              </span>
            </li>
          </ul>

          <p
            class="mt-4 border-t border-line-soft pt-4 text-adm-sm text-secondary-400"
          >
            Resuelve los puntos pendientes para habilitar el cierre.
          </p>
        </AulaCard>

        <!--
          GRID, no `<table>`: el diseño (jsx:827) fija cinco anchos y deja UNA
          columna `minmax(190px,1fr)` para que Alumno absorba el sobrante. Una
          tabla hace lo contrario —reparte el ancho libre entre las columnas sin
          ancho— así que las de dato se estiraban a lo largo de toda la pantalla
          y el nombre quedaba apretado contra el borde.
        -->
        <AulaCard v-if="data.students.length" pad="none">
          <div class="overflow-x-auto">
            <div class="min-w-200">
              <div
                class="grid grid-cols-[minmax(11.875rem,1fr)_6.5625rem_6.5625rem_7.8125rem_7.8125rem_6.875rem] items-center gap-3.5 bg-surface-page px-[1.125rem] py-2.5 font-mono text-adm-label uppercase tracking-[0.05em] text-secondary-400"
              >
                <span>Alumno</span>
                <span>Acumulado</span>
                <span>Nota final</span>
                <span>Resultado</span>
                <span>Certificado</span>
                <span>Asistencia</span>
              </div>

              <div
                v-for="(student, index) in data.students"
                :key="student.enrollment_course_id"
                class="grid grid-cols-[minmax(11.875rem,1fr)_6.5625rem_6.5625rem_7.8125rem_7.8125rem_6.875rem] items-center gap-3.5 border-t border-line-soft px-[1.125rem] py-[0.8125rem]"
              >
                <div class="flex min-w-0 items-center gap-[0.6875rem]">
                  <AulaAvatar :name="student.full_name" :index="index" />
                  <div class="min-w-0">
                    <div
                      class="truncate text-adm-md font-semibold text-secondary-900"
                    >
                      {{ student.full_name }}
                    </div>
                    <div class="font-mono text-adm-xs text-secondary-400">
                      DNI {{ student.document_number }}
                    </div>
                  </div>
                </div>

                <!--
                  Acumulado: la ponderada ANTES del cierre. Es contra lo que
                  se contrasta la nota final, así que va a su izquierda.
                -->
                <span
                  v-if="student.accumulated !== null"
                  class="font-mono text-adm-base text-secondary-500"
                >
                  {{ formatScore(Number(student.accumulated)) }}
                </span>
                <span v-else class="text-secondary-300">—</span>

                <span
                  v-if="student.final_score !== null"
                  class="font-display text-adm-lg font-extrabold"
                  :class="
                    student.approved
                      ? 'text-success-DEFAULT'
                      : 'text-danger-DEFAULT'
                  "
                >
                  {{ formatScore(Number(student.final_score)) }}
                </span>
                <span v-else class="font-display text-adm-lg text-secondary-400">
                  —
                </span>

                <div>
                  <AulaPill
                    v-if="student.approved !== null"
                    :tone="student.approved ? 'success' : 'danger'"
                    size="sm"
                  >
                    {{ student.approved ? "Aprobado" : "Desaprobado" }}
                  </AulaPill>
                  <AulaPill v-else tone="warning" size="sm">
                    Sin calcular
                  </AulaPill>
                </div>

                <!--
                  Los tres estados del diseño: sin nota final el certificado
                  ni siquiera se puede pedir ("bloqueado"), y un desaprobado
                  nunca lo recibe ("no aplica"). Un "—" para ambos casos
                  parecía un dato que falta.
                -->
                <div>
                  <span
                    v-if="student.final_score === null"
                    class="text-adm-sm text-secondary-400"
                  >
                    bloqueado
                  </span>
                  <AulaPill
                    v-else-if="student.approved && student.certificate_code"
                    tone="success"
                    size="sm"
                  >
                    Emitido
                  </AulaPill>
                  <AulaPill v-else-if="student.approved" tone="warning" size="sm">
                    En trámite
                  </AulaPill>
                  <span v-else class="text-adm-sm text-secondary-400">
                    no aplica
                  </span>
                </div>

                <span
                  v-if="student.attendance_percent !== null"
                  class="font-mono text-adm-sm text-secondary-500"
                >
                  {{ student.attendance_percent }}%
                </span>
                <span v-else class="text-secondary-300">—</span>
              </div>
            </div>
          </div>
        </AulaCard>

        <!--
          El pie va FUERA de la tarjeta, como en el diseño (jsx:851: el `<div>`
          es hermano de `AulaTable`, no su hijo). Dentro parecía una fila más de
          la tabla y además le impedía cerrar con su propio borde.
        -->
        <!--
          ⚠️ SIN los nombres de columna que el diseño intercala
          (`final_grades.closed_by` y `closed_at`): son anotaciones del mockup
          para quien construye, como `COURSE_EVALUATIONS.MAX_SCORE`. Al docente
          no le dicen nada y están en inglés. La frase se sostiene sin ellos.
        -->
        <p v-if="data.students.length" class="text-adm-sm text-secondary-400">
          Al cerrar el acta se guarda quién y cuándo lo hizo, y con eso los
          aprobados pasan a la cola de certificados. El cálculo ponderado y la
          comparación contra la mínima aprobatoria los hace la aplicación, no
          la base de datos.
        </p>

        <AulaEmpty
          v-else
          title="Sin alumnos matriculados"
          sub="Este curso todavía no tiene alumnos en su grupo."
        />
      </template>
    </template>
  </div>
</template>
