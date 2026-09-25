<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import dayjs from "dayjs";
import { mdiArrowLeft, mdiClose, mdiPlus, mdiAutoFix } from "@mdi/js";

import {
  HeroCore,
  InputTextCore,
  DatePicketCore,
  ButtonCore,
} from "@/shared/components";
import BulkFormShell from "@/modules/admin/components/ui/bulk-form-shell.vue";
import BulkCourseCard from "@/modules/admin/components/ui/bulk-course-card.vue";
import StatusPill from "@/modules/admin/components/ui/status-pill.vue";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import offerService from "../services/offer.service";
import type { Offer, OfferCourseItem } from "../models/offer.model";
import { DAY_OF_WEEK_OPTIONS } from "../constants/offer.constant";
import classSessionService from "@/modules/admin/modules/enrollments/modules/class-sessions/services/class-session.service";
import type { ClassSession } from "@/modules/admin/modules/enrollments/modules/class-sessions/models/class-session.model";

/**
 * Gestión de las sesiones de UN programa: crea las que faltan y actualiza las
 * que ya existen, todo en el mismo envío.
 *
 * Es la contraparte editable de `sessions.vue` (el calendario, solo lectura).
 * A diferencia del masivo general (`class-sessions/pages/create-bulk.vue`), acá
 * el programa viene fijado por la ruta y las clases YA CREADAS se cargan como
 * filas editables: la pregunta que responde la pantalla es "¿qué le falta y qué
 * hay que corregir a este programa?", y para eso hay que ver lo que ya existe.
 *
 * ⚠️ La jerarquía es CURSO → HORARIO → sesiones, no una tarjeta por horario.
 * Un curso con lunes y martes salía como dos tarjetas con el mismo título, y
 * con 2 cursos × 2 horarios la pantalla eran 4 bloques repetidos donde no se
 * veía a qué curso pertenecía cada uno.
 *
 * ⚠️ Va contra `actions/bulk-store`, que hace UPSERT sobre
 * `schedule_id` + `session_date` y NUNCA borra. El endpoint parecido
 * `offers/actions/sessions/{offer}` sincroniza: purga las clases del horario
 * ausentes del payload, con su asistencia ya tomada.
 */
interface SessionRow {
  /** Clave de fila estable: `scheduleId:sessionDate` cambia al editar la fecha. */
  key: string;
  scheduleId: number;
  courseName: string;
  sessionDate: string;
  startTime: string | null;
  endTime: string | null;
  name: string;
  topic: string;
  meetLink: string;
  /** Ya está en la base: se actualiza en vez de crearse. */
  existing: boolean;
  /**
   * Ciclo de la clase, no activo/inactivo. `1` es dictada.
   *
   * Solo informativo: el servidor deja `status` fuera del upsert justamente
   * para no devolver a "pendiente" una clase que el docente ya dictó.
   */
  status: number | null;
}

/** Un horario semanal del curso: de él cuelgan las sesiones. */
interface ScheduleInfo {
  scheduleId: number;
  courseKey: string;
  courseName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  meetLink: string;
  /** Rango del CURSO (`YYYY-MM-DD`): una clase no puede caer fuera de él. */
  courseStart: string | null;
  courseEnd: string | null;
}

const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();

const offerId = Number(route.params.id);
const offer = ref<Offer | null>(null);
const rows = ref<SessionRow[]>([]);
const schedules = ref<ScheduleInfo[]>([]);
const loading = ref(true);
const saving = ref(false);

/** Contador propio de claves: dos filas nuevas del mismo horario chocarían. */
let seq = 0;
const nextKey = (): string => `row-${(seq += 1)}`;

/** Nombre del día en español; si llega uno desconocido, se muestra tal cual. */
const dayLabel = (value: string): string =>
  DAY_OF_WEEK_OPTIONS.find((d) => d.value === value)?.label ?? value;

/** "Lunes 19:00–21:00" para la cabecera del horario. */
const scheduleLabelOf = (schedule: ScheduleInfo): string =>
  `${dayLabel(schedule.dayOfWeek)} ${(schedule.startTime ?? "").slice(0, 5)}–${(schedule.endTime ?? "").slice(0, 5)}`;

/**
 * Índice de `DAY_OF_WEEK_OPTIONS` (0 = lunes) al de `Date.getDay()`
 * (0 = domingo), que es el que espera `disabledDays` de PrimeVue.
 */
const primeDayOf = (dayOfWeek: string): number | null => {
  const index = DAY_OF_WEEK_OPTIONS.findIndex((d) => d.value === dayOfWeek);

  return index < 0 ? null : (index + 1) % 7;
};

const collectSchedules = (courses: OfferCourseItem[]): ScheduleInfo[] => {
  const out: ScheduleInfo[] = [];

  courses.forEach((course, index) => {
    for (const schedule of course.schedules ?? []) {
      if (!schedule.id) continue;

      out.push({
        scheduleId: schedule.id,
        // El id del `offer_course` agrupa; el índice cubre al curso sin id
        // (el detalle siempre lo trae, pero el modelo lo declara opcional).
        courseKey: String(course.id ?? `idx-${index}`),
        courseName: course.name,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        meetLink: course.meetLink ?? "",
        courseStart: course.startDate,
        courseEnd: course.endDate,
      });
    }
  });

  return out;
};

/**
 * TODAS las fechas que le tocan a un horario: cada semana de su día dentro del
 * rango del curso.
 *
 * Es lo que permite rellenar el cronograma de golpe en vez de agregar sesión
 * por sesión. Sin rango del curso no hay serie posible: se devuelve vacío y el
 * aviso de la tarjeta explica por qué.
 */
const allDatesFor = (schedule: ScheduleInfo): string[] => {
  const day = primeDayOf(schedule.dayOfWeek);

  if (day === null || !schedule.courseStart || !schedule.courseEnd) return [];

  const start = dayjs(schedule.courseStart, "YYYY-MM-DD");
  const end = dayjs(schedule.courseEnd, "YYYY-MM-DD");

  let cursor = start.add((day - start.day() + 7) % 7, "day");
  const out: string[] = [];

  // Un curso de un año son ~52 fechas; el tope solo evita un bucle infinito si
  // las fechas llegaran corruptas.
  while (!cursor.isAfter(end, "day") && out.length < 520) {
    out.push(cursor.format("YYYY-MM-DD"));
    cursor = cursor.add(7, "day");
  }

  return out;
};

/** Fechas de ese horario que todavía no tienen fila. */
const missingDatesFor = (schedule: ScheduleInfo): string[] => {
  const taken = new Set(
    rows.value
      .filter((r) => r.scheduleId === schedule.scheduleId)
      .map((r) => r.sessionDate),
  );

  return allDatesFor(schedule).filter((d) => !taken.has(d));
};

/**
 * Renumera "Sesión N" por fecha dentro del horario.
 *
 * El número sale del ORDEN CRONOLÓGICO, no del de creación: agregar una fecha
 * intermedia o corregir una fecha renumera el resto, y una lista donde la
 * Sesión 3 va antes que la 2 no se puede leer.
 *
 * ⚠️ No se renumera lo que ya está en la base: su nombre puede haberse editado
 * a mano ("Sesión 1 — repaso") y el docente lo ve así en el aula.
 */
const renumber = (scheduleId: number) => {
  const own = rows.value
    .filter((r) => r.scheduleId === scheduleId)
    .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));

  own.forEach((row, index) => {
    if (!row.existing) row.name = `Sesión ${index + 1}`;
  });
};

/**
 * Agrega las fechas que falten de ese horario, en orden.
 *
 * Solo AGREGA: nunca toca las filas que ya están, ni las cargadas de la base ni
 * las que el usuario acaba de escribir.
 */
const fillSchedule = (schedule: ScheduleInfo): number => {
  const missing = missingDatesFor(schedule);

  for (const date of missing) {
    rows.value.push({
      key: nextKey(),
      scheduleId: schedule.scheduleId,
      courseName: schedule.courseName,
      sessionDate: date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      name: "",
      topic: "",
      meetLink: schedule.meetLink,
      existing: false,
      status: null,
    });
  }

  renumber(schedule.scheduleId);

  return missing.length;
};

/** Rellena todos los horarios de un curso. */
const fillCourse = (courseSchedules: ScheduleInfo[]): number =>
  courseSchedules.reduce((total, s) => total + fillSchedule(s), 0);

/** Rellena el programa entero. */
const fillAll = () => {
  const added = schedules.value.reduce((t, s) => t + fillSchedule(s), 0);

  toastStore.showToastSuccess({
    summary: "Cronograma generado",
    detail: `Se agregaron ${added} sesión(es). Revisa los temas antes de guardar.`,
  });
};

const onFillCourse = (name: string, courseSchedules: ScheduleInfo[]) => {
  const added = fillCourse(courseSchedules);

  toastStore.showToastSuccess({
    summary: `Sesiones de ${name}`,
    detail: `Se agregaron ${added} sesión(es).`,
  });
};

/**
 * ¿El día del horario llega a caer alguna vez dentro del rango del curso?
 *
 * Son dos problemas distintos y el usuario necesita distinguirlos: "ya usaste
 * todas las fechas" se resuelve borrando una sesión, pero "el lunes no existe
 * en un curso de martes a miércoles" se resuelve corrigiendo el curso. Decir
 * "no quedan fechas libres" en el segundo caso manda a buscar donde no es.
 */
const dayFitsInRange = (schedule: ScheduleInfo): boolean =>
  allDatesFor(schedule).length > 0;

/**
 * Fechas YA OCUPADAS de un horario, salvo la de la propia fila.
 *
 * El upsert usa `schedule_id` + `session_date` como clave: dos filas con la
 * misma fecha son la misma clase, así que el servidor omitiría una. Se bloquean
 * en el calendario para que el choque no llegue al envío.
 *
 * ⚠️ La fila que se está editando NO se excluye a sí misma: si no, cambiar
 * cualquier otro campo obligaría a mover también la fecha.
 */
const takenDatesFor = (scheduleId: number, exceptKey: string): Date[] =>
  rows.value
    .filter(
      (r) => r.scheduleId === scheduleId && r.key !== exceptKey && r.sessionDate,
    )
    .map((r) => dayjs(r.sessionDate, "YYYY-MM-DD").toDate())
    .filter((d) => !isNaN(d.getTime()));

/**
 * Rango del curso para la cabecera: es lo que explica por qué el calendario
 * bloquea el resto de fechas.
 */
const courseRangeText = (schedule: ScheduleInfo): string => {
  if (!schedule.courseStart || !schedule.courseEnd) return "sin fechas";

  const fmt = (v: string) => dayjs(v, "YYYY-MM-DD").format("DD/MM/YYYY");

  return `${fmt(schedule.courseStart)}–${fmt(schedule.courseEnd)}`;
};

/** Límite del calendario: el rango del curso, o libre si el curso no lo define. */
const rangeLimitsOf = (schedule: ScheduleInfo) => ({
  min: schedule.courseStart
    ? dayjs(schedule.courseStart, "YYYY-MM-DD").toDate()
    : undefined,
  max: schedule.courseEnd
    ? dayjs(schedule.courseEnd, "YYYY-MM-DD").toDate()
    : undefined,
});

/**
 * Días de la semana BLOQUEADOS para un horario: todos menos el suyo.
 *
 * Un horario es "Lunes 18:00–20:00": una sesión suya que caiga un miércoles no
 * tiene horario que la respalde.
 */
const disabledDaysFor = (schedule: ScheduleInfo): number[] => {
  const day = primeDayOf(schedule.dayOfWeek);

  // Día desconocido: no se bloquea nada antes que bloquear la semana entera.
  if (day === null) return [];

  return [0, 1, 2, 3, 4, 5, 6].filter((d) => d !== day);
};

/**
 * La pantalla se arma CURSO → HORARIO → sesiones.
 *
 * Los horarios de un mismo curso se agrupan bajo una sola cabecera: son el
 * cronograma de ese curso, no bloques independientes.
 */
const groups = computed(() => {
  const byCourse = new Map<string, ScheduleInfo[]>();

  for (const schedule of schedules.value) {
    const found = byCourse.get(schedule.courseKey);

    if (found) found.push(schedule);
    else byCourse.set(schedule.courseKey, [schedule]);
  }

  return [...byCourse.entries()].map(([key, own]) => {
    const blocks = own.map((schedule) => ({
      schedule,
      label: scheduleLabelOf(schedule),
      rows: rows.value
        .filter((r) => r.scheduleId === schedule.scheduleId)
        .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate)),
      limits: rangeLimitsOf(schedule),
      disabledDays: disabledDaysFor(schedule),
      missing: missingDatesFor(schedule).length,
      // El día del horario ni siquiera existe dentro del rango del curso.
      outOfRange: !dayFitsInRange(schedule),
    }));

    return {
      key,
      name: own[0]?.courseName ?? "—",
      range: own[0] ? courseRangeText(own[0]) : "sin fechas",
      schedules: own,
      blocks,
      total: blocks.reduce((t, b) => t + b.rows.length, 0),
      missing: blocks.reduce((t, b) => t + b.missing, 0),
    };
  });
});

/** Sesiones que faltan en TODO el programa: habilita el botón de la cabecera. */
const missingTotal = computed(() =>
  groups.value.reduce((t, g) => t + g.missing, 0),
);

const addRow = (schedule: ScheduleInfo) => {
  const [next] = missingDatesFor(schedule);

  // El botón ya viene deshabilitado sin hueco; esto cubre el caso de carrera.
  if (!next) return;

  rows.value.push({
    key: nextKey(),
    scheduleId: schedule.scheduleId,
    courseName: schedule.courseName,
    sessionDate: next,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    name: "",
    topic: "",
    meetLink: schedule.meetLink,
    existing: false,
    status: null,
  });

  renumber(schedule.scheduleId);
};

/*
 * Quitar una fila la saca del ENVÍO, no de la base: el endpoint nunca borra.
 * Por eso una clase que ya existe no se puede quitar — daría a entender que se
 * elimina, y volvería a aparecer en la próxima carga. Se borran desde Clases.
 */
const removeRow = (row: SessionRow) => {
  rows.value = rows.value.filter((r) => r.key !== row.key);
  renumber(row.scheduleId);
};

const pendingCreate = computed(
  () => rows.value.filter((r) => !r.existing).length,
);
const pendingUpdate = computed(
  () => rows.value.filter((r) => r.existing).length,
);

const submitLabel = computed(() => {
  if (!rows.value.length) return "Guardar sesiones";

  const parts = [
    pendingCreate.value ? `Crear ${pendingCreate.value}` : "",
    pendingUpdate.value ? `Actualizar ${pendingUpdate.value}` : "",
  ].filter(Boolean);

  return parts.join(" · ");
});

const load = async (prefill = false) => {
  loading.value = true;

  const [{ data: detail }, { data: list }] = await Promise.all([
    safeRequest(() => offerService.edit(offerId), { showAlert: false }),
    safeRequest(
      () => classSessionService.list({ offer_id: offerId, take: 200 }),
      { showAlert: false },
    ),
  ]);

  offer.value = (detail as Offer | null) ?? null;
  schedules.value = collectSchedules(offer.value?.courseItems ?? []);

  seq = 0;
  rows.value = ((list?.items ?? []) as ClassSession[])
    .filter((s) => s.scheduleId !== null)
    // ⚠️ Ordenar por la CRUDA: `sessionDate` viene `DD/MM/YYYY`, y comparar
    // eso como texto ordena por día del mes.
    .sort((a, b) =>
      (a.sessionDateRaw ?? "").localeCompare(b.sessionDateRaw ?? ""),
    )
    .map((session) => ({
      key: nextKey(),
      scheduleId: session.scheduleId as number,
      courseName: session.courseName ?? "—",
      // ⚠️ `sessionDate` llega FORMATEADA (`DD/MM/YYYY`) para la tabla; el
      // formulario necesita la cruda, que es la que acepta la API.
      sessionDate: session.sessionDateRaw ?? "",
      startTime: session.startTime,
      endTime: session.endTime,
      name: session.name ?? "",
      topic: session.topic ?? "",
      meetLink: session.meetLink ?? "",
      existing: true,
      status: session.status,
    }));

  /*
   * Al ENTRAR se rellena el cronograma completo: lo que se viene a hacer acá es
   * programar las clases del ciclo, y agregarlas de a una cuando las fechas ya
   * las determina el horario es trabajo mecánico.
   *
   * Solo agrega lo que falta, así que un programa ya completo entra igual que
   * antes. No se rellena tras GUARDAR: ahí la recarga solo refleja lo guardado.
   */
  if (prefill) {
    for (const schedule of schedules.value) fillSchedule(schedule);
  }

  loading.value = false;
};

onMounted(() => load(true));

const onSubmit = async () => {
  if (!rows.value.length || saving.value) return;

  saving.value = true;
  const { data, error } = await safeRequest(() =>
    classSessionService.bulkStore({
      sessions: rows.value.map((r) => ({
        schedule_id: r.scheduleId,
        session_date: r.sessionDate,
        start_time: r.startTime,
        end_time: r.endTime,
        name: r.name,
        topic: r.topic || null,
        meet_link: r.meetLink || null,
      })),
    }),
  );
  saving.value = false;

  if (error || !data) return;

  const done = [
    data.created ? `${data.created} creada(s)` : "",
    data.updated ? `${data.updated} actualizada(s)` : "",
  ]
    .filter(Boolean)
    .join(" y ");

  /*
   * El servidor responde 200 aunque omita filas. Con el upsert el único motivo
   * es que dos tarjetas compartan horario y fecha; hay que decirlo, o el
   * usuario cree que se guardaron todas.
   */
  if (data.skipped.length) {
    toastStore.showToastError({
      summary: "Algunas sesiones no se guardaron",
      detail: `${done || "Ninguna guardada"}. ${data.skipped.length} repetida(s): mismo horario y fecha.`,
    });
  } else {
    toastStore.showToastSuccess({
      summary: "Sesiones guardadas",
      detail: `${done || "Sin cambios"}.`,
    });
  }

  // Se recarga en vez de salir: tras guardar, lo creado pasa a "existente" y
  // la pantalla queda lista para seguir trabajando sin volver a entrar.
  await load();
};
</script>

<template>
  <div>
    <!--
      Enlace, no `ButtonCore`: con el texto en el slot por defecto PrimeVue no
      reserva ancho (lo calcula del `label`) y la etiqueta sale CORTADA. Y una
      vuelta atrás es navegación, no una acción.
    -->
    <button
      type="button"
      class="inline-flex items-center gap-2 mb-4 cursor-pointer text-adm-base font-semibold text-primary-600 hover:text-primary-500"
      @click="router.push({ name: 'offers.list' })"
    >
      <HeroCore :path="mdiArrowLeft" class="size-4 shrink-0" />
      Volver a programas
    </button>

    <BulkFormShell
      :title="`Sesiones de ${offer?.name ?? '—'}`"
      :submit-label="submitLabel"
      redirect="offers.list"
      :loading="saving"
      :disabled="!rows.length"
      @submit="onSubmit"
    >
      <!--
        Orden del diseño: carga → vacío → datos. Nunca se afirma que no hay
        nada mientras todavía está cargando.
      -->
      <p v-if="loading" class="text-sm text-secondary-400">
        Cargando los cursos y las sesiones del programa…
      </p>

      <div
        v-else-if="!schedules.length"
        class="rounded-adm-sm border-[1.5px] border-dashed border-control-border px-3.5 py-5 text-center text-sm text-secondary-400"
      >
        Este programa no tiene horarios cargados. Agrégalos en el programa antes
        de generar sus sesiones.
      </div>

      <template v-else>
        <!-- Generar en bloque: el cronograma del ciclo entero de una vez. -->
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <p class="text-adm-sm text-secondary-500">
            Las fechas salen del horario de cada curso. Completa el tema y el
            enlace de las que falten.
          </p>
          <ButtonCore
            class="!w-auto"
            severity="secondary"
            outlined
            size="small"
            :label="
              missingTotal
                ? `Generar ${missingTotal} faltante(s)`
                : 'Cronograma completo'
            "
            :disabled="!missingTotal"
            @click="fillAll"
          >
            <template #icon>
              <HeroCore :path="mdiAutoFix" size="14" />
            </template>
          </ButtonCore>
        </div>

        <div class="flex flex-col gap-2.5">
          <!-- Una tarjeta por CURSO; sus horarios van dentro. -->
          <BulkCourseCard
            v-for="group in groups"
            :key="group.key"
            :title="group.name"
            :meta="`${group.range} · ${group.total} sesión(es)`"
          >
            <template #action>
              <ButtonCore
                class="!w-auto"
                severity="secondary"
                outlined
                size="small"
                :label="group.missing ? `Generar ${group.missing}` : 'Completo'"
                :disabled="!group.missing"
                :title="
                  group.missing
                    ? 'Agregar las sesiones que faltan en todos los horarios de este curso.'
                    : 'Este curso ya tiene todas sus sesiones.'
                "
                @click="onFillCourse(group.name, group.schedules)"
              >
                <template #icon>
                  <HeroCore :path="mdiAutoFix" size="14" />
                </template>
              </ButtonCore>
            </template>

            <div class="flex flex-col gap-3">
              <div
                v-for="block in group.blocks"
                :key="block.schedule.scheduleId"
                class="overflow-hidden rounded-adm-sm border border-control-border"
              >
                <!-- Cabecera del HORARIO dentro del curso. -->
                <div
                  class="flex flex-wrap items-center gap-2.5 border-b border-control-border bg-admin-bg px-3 py-2"
                >
                  <span
                    class="font-mono text-[0.6875rem] font-bold text-secondary-900"
                  >
                    {{ block.label }}
                  </span>
                  <span class="font-mono text-[0.6875rem] text-secondary-400">
                    {{ block.rows.length }} sesión(es)
                  </span>

                  <ButtonCore
                    class="!w-auto ml-auto"
                    severity="secondary"
                    text
                    size="small"
                    :label="
                      block.missing ? `Generar ${block.missing}` : 'Completo'
                    "
                    :disabled="!block.missing"
                    :title="
                      block.missing
                        ? 'Agregar las fechas que faltan de este horario.'
                        : 'Este horario ya tiene todas sus fechas.'
                    "
                    @click="fillSchedule(block.schedule)"
                  >
                    <template #icon>
                      <HeroCore :path="mdiAutoFix" size="14" />
                    </template>
                  </ButtonCore>

                  <ButtonCore
                    class="!w-auto"
                    severity="secondary"
                    text
                    size="small"
                    label="Agregar una"
                    :disabled="!block.missing"
                    :title="
                      block.missing
                        ? 'Agregar la próxima fecha libre de este horario.'
                        : 'No quedan fechas libres en este horario.'
                    "
                    @click="addRow(block.schedule)"
                  >
                    <template #icon>
                      <HeroCore :path="mdiPlus" size="14" />
                    </template>
                  </ButtonCore>
                </div>

                <!--
                  Un estado vacío que no dice POR QUÉ está vacío deja al usuario
                  buscando el problema en el sitio equivocado: acá la causa suele
                  ser que el rango del curso y el día del horario no se cruzan.
                -->
                <p
                  v-if="block.outOfRange"
                  class="bg-amber-soft px-3.5 py-3 text-center text-adm-sm text-amber-DEFAULT"
                >
                  Ningún {{ dayLabel(block.schedule.dayOfWeek).toLowerCase() }}
                  cae entre el {{ group.range }}, así que este horario no tiene
                  fecha posible. Corrige las fechas del curso o el día del
                  horario en el programa.
                </p>

                <p
                  v-else-if="!block.rows.length"
                  class="px-3.5 py-3 text-center text-adm-sm text-secondary-400"
                >
                  Aún no se generaron sesiones para este horario.
                </p>

                <div v-if="block.rows.length" class="flex flex-col gap-2 p-2.5">
                  <div
                    v-for="row in block.rows"
                    :key="row.key"
                    class="grid grid-cols-1 items-start gap-2 sm:grid-cols-[7rem_8.5rem_1fr_1.2fr_7rem_2rem]"
                  >
                    <InputTextCore v-model="row.name" placeholder="Sesión 1" />
                    <!--
                      El calendario solo ofrece fechas VÁLIDAS para este horario:
                      dentro del rango del curso, en su día de la semana y sin
                      pisar otra sesión.
                    -->
                    <DatePicketCore
                      v-model="row.sessionDate"
                      dayjs-format-value="YYYY-MM-DD"
                      :min-date="block.limits.min"
                      :max-date="block.limits.max"
                      :disabled-days="block.disabledDays"
                      :disabled-dates="takenDatesFor(row.scheduleId, row.key)"
                    />
                    <InputTextCore v-model="row.topic" placeholder="Tema" />
                    <InputTextCore
                      v-model="row.meetLink"
                      placeholder="Enlace (Meet/Zoom)"
                    />

                    <!--
                      Qué le va a pasar a la fila al guardar. Una tabla donde
                      crear y actualizar se ven igual no deja anticipar el
                      resultado.
                    -->
                    <StatusPill
                      v-if="row.existing"
                      :label="row.status === 1 ? 'Dictada' : 'Se actualiza'"
                      :tone="row.status === 1 ? 'success' : 'accent'"
                      :dot="false"
                    />
                    <StatusPill
                      v-else
                      label="Nueva"
                      tone="warning"
                      :dot="false"
                    />

                    <!--
                      Solo las nuevas se quitan: el endpoint nunca borra, así que
                      quitar una existente prometería un borrado que no ocurre.
                    -->
                    <button
                      v-if="!row.existing"
                      type="button"
                      class="adm-icon-btn inline-flex size-7 items-center justify-center rounded-adm-sm text-secondary-500"
                      title="Quitar esta sesión"
                      @click="removeRow(row)"
                    >
                      <HeroCore :path="mdiClose" size="16" />
                    </button>
                    <span v-else />
                  </div>
                </div>
              </div>
            </div>
          </BulkCourseCard>
        </div>
      </template>
    </BulkFormShell>
  </div>
</template>
