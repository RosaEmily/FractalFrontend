import type {
  CourseDurationUnit,
  OfferCourseItem,
  OfferSchedule,
} from "../models/offer.model";

/**
 * Reglas del formulario de Programas.
 *
 * Están acá y no en las páginas porque crear y editar comparten todas: dejarlas
 * duplicadas garantizaba que alguna quedara distinta entre las dos pantallas.
 */

/*
 * Palabras que no aportan a una sigla: "Modelado y Gestión BIM" debe dar MGB,
 * no MYGB.
 */
const STOP_WORDS = new Set([
  "de",
  "del",
  "la",
  "las",
  "el",
  "los",
  "y",
  "e",
  "en",
  "para",
  "con",
  "a",
  "al",
  "por",
  "un",
  "una",
]);

/**
 * Prefijo sugerido: siglas del nombre + año + semestre del inicio de clases
 * (`MGB-2026-2`).
 *
 * El diseño lo llama "código corto interno", así que se buscan siglas y no un
 * slug del nombre completo. Año y semestre distinguen dos cohortes del mismo
 * programa (2026-I y 2026-II). Se ignora el sufijo "· Cohorte …" del nombre:
 * esas siglas ya las da el año-semestre.
 */
export const suggestPrefix = (
  name: string | null,
  startDate?: string | null,
): string => {
  const base = baseName(name);
  if (!base) return "";

  const initials = base
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[\s\-_/]+/)
    .filter((word) => word && !STOP_WORDS.has(word.toLowerCase()))
    // Un token que ya es una sigla ("BIM", "CAD") se conserva entero.
    .map((word) =>
      word === word.toUpperCase() && word.length <= 4 ? word : word.charAt(0),
    )
    .join("")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 8);

  if (!initials) return "";

  // Sin fecha todavía se usa hoy; al elegir el inicio de clases se recalcula.
  const date = parseDay(startDate) ?? new Date();

  return `${initials}-${date.getFullYear()}-${semesterOf(date)}`;
};

/** Nombre sin el sufijo de cohorte: "Revit · Cohorte 2026-II" → "Revit". */
export const baseName = (name: string | null | undefined): string =>
  (name ?? "").split(" · Cohorte ")[0]!.trim();

/** 1 = enero–junio, 2 = julio–diciembre. */
const semesterOf = (date: Date): 1 | 2 => (date.getMonth() < 6 ? 1 : 2);

/** Etiqueta de cohorte del nombre: "2026-I" / "2026-II". */
export const cohortLabel = (startDate?: string | null): string => {
  const date = parseDay(startDate) ?? new Date();
  return `${date.getFullYear()}-${semesterOf(date) === 1 ? "I" : "II"}`;
};

/** "Modelado BIM" + inicio → "Modelado BIM · Cohorte 2026-II". */
export const programName = (
  name: string | null | undefined,
  startDate?: string | null,
): string => {
  const base = baseName(name);
  return base ? `${base} · Cohorte ${cohortLabel(startDate)}` : "";
};

/** Fila vacía de horario. */
export const emptySchedule = (): OfferSchedule => ({
  dayOfWeek: "",
  startTime: "",
  endTime: "",
});

/** Fila de curso lista para completar docente, fechas y horario. */
export const buildCourseItem = (
  courseId: number | null,
  name: string,
): OfferCourseItem => ({
  courseId,
  name,
  teacherId: null,
  startDate: null,
  endDate: null,
  meetLink: null,
  schedules: [emptySchedule()],
});

/** `getDay()` de JS → `monday`…`sunday`. */
const WEEKDAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/**
 * Curso del ALTA con valores por defecto: 4 semanas y un
 * horario de 19:00 a 21:00 el mismo día de la semana del inicio de clases
 * (martes si todavía no hay inicio). Todo editable; es para no partir vacío.
 */
export const buildCohortCourse = (
  courseId: number | null,
  name: string,
  classStart?: string | null,
): OfferCourseItem => {
  const start = parseDay(classStart);
  return {
    ...buildCourseItem(courseId, name),
    durationValue: 4,
    durationUnit: "weeks",
    schedules: [
      {
        dayOfWeek: start ? WEEKDAY_KEYS[start.getDay()]! : "tuesday",
        startTime: "19:00:00",
        endTime: "21:00:00",
        durationMin: 120,
      },
    ],
  };
};

/** Horario nuevo: el siguiente día libre, 19:00, con la duración del primero. */
export const newScheduleFor = (schedules: OfferSchedule[]): OfferSchedule => {
  const duration = (schedules[0] && scheduleDuration(schedules[0])) || 60;
  const used = new Set(schedules.map((s) => s.dayOfWeek));
  const day =
    ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].find(
      (d) => !used.has(d),
    ) ?? "monday";
  return {
    dayOfWeek: day,
    startTime: "19:00:00",
    endTime: fromMinutes(Math.min(19 * 60 + duration, 23 * 60 + 59)),
    durationMin: duration,
  };
};

/**
 * Problemas de los cursos del programa.
 *
 * Devuelve TODOS los encontrados, no el primero: con varios cursos y horarios,
 * corregir de a uno por intento es tiempo perdido. Cada mensaje nombra la fila
 * para que se sepa cuál falla.
 */
export const validateCourseItems = (
  items: OfferCourseItem[],
  enrollmentStart?: string | null,
  options: {
    /** Línea de carrera: los cursos se dictan en secuencia, sin solaparse. */
    sequential?: boolean;
    /** Cierre de matrícula: debe ser antes (o el día) de la primera clase. */
    enrollmentEnd?: string | null;
  } = {},
): string[] => {
  const problems: string[] = [];

  if (!items.length) {
    return ["Debe agregar al menos un curso al programa."];
  }

  const seenCourses = new Map<number, number>();

  items.forEach((item, index) => {
    const label = item.name || `Curso ${index + 1}`;

    if (!item.courseId) {
      problems.push(`${label}: falta elegir el curso.`);
    } else if (seenCourses.has(item.courseId)) {
      // El mismo curso dos veces en un programa no significa nada: son las
      // mismas clases, y `enrollment_courses` quedaría duplicado.
      problems.push(
        `${label}: está repetido (ya aparece en la fila ${(seenCourses.get(item.courseId) ?? 0) + 1}).`,
      );
    } else {
      seenCourses.set(item.courseId, index);
    }

    if (!item.teacherId) {
      problems.push(`${label}: falta asignar el docente.`);
    }

    if (item.startDate && item.endDate && item.endDate < item.startDate) {
      problems.push(`${label}: la fecha de fin es anterior a la de inicio.`);
    }

    /*
     * Línea de carrera = secuencia: el curso N se habilita al aprobar el N−1,
     * así que no puede empezar antes de que ese termine.
     */
    const previous = items[index - 1];
    if (
      options.sequential &&
      previous?.endDate &&
      item.startDate &&
      item.startDate <= previous.endDate.slice(0, 10)
    ) {
      problems.push(
        `${label}: empieza antes de que termine ${previous.name || `el curso ${index}`}.`,
      );
    }

    /*
     * El curso no puede empezar antes de que abra la matrícula: nadie podría
     * haberse inscrito. Terminar después del cierre sí es normal —la matrícula
     * cierra y el programa sigue dictándose—, así que solo se acota el inicio.
     */
    if (
      item.startDate &&
      enrollmentStart &&
      item.startDate < enrollmentStart.slice(0, 10)
    ) {
      problems.push(
        `${label}: no puede iniciar antes de que abra la matrícula.`,
      );
    }

    if (item.meetLink && !/^https?:\/\/\S+$/i.test(item.meetLink)) {
      problems.push(
        `${label}: el enlace de videoconferencia no es una URL válida.`,
      );
    }

    if (!item.schedules.length) {
      problems.push(`${label}: debe tener al menos un horario.`);
    }

    item.schedules.forEach((schedule, sIndex) => {
      const sLabel = `${label} · horario ${sIndex + 1}`;

      if (!schedule.dayOfWeek) {
        problems.push(`${sLabel}: falta elegir el día.`);
      } else {
        // Un día puede repetirse con otra hora; lo que no puede es pisarse.
        const clash = item.schedules.some((other, oIndex) => {
          if (oIndex >= sIndex || other.dayOfWeek !== schedule.dayOfWeek) return false;
          const s1 = toMinutes(schedule.startTime);
          const e1 = toMinutes(schedule.endTime);
          const s2 = toMinutes(other.startTime);
          const e2 = toMinutes(other.endTime);
          return s1 !== null && e1 !== null && s2 !== null && e2 !== null && s1 < e2 && s2 < e1;
        });
        if (clash) problems.push(`${sLabel}: se pisa con otro horario del mismo día.`);
      }

      const start = toMinutes(schedule.startTime);
      if (
        start !== null &&
        schedule.durationMin &&
        start + schedule.durationMin >= MINUTES_IN_DAY
      ) {
        problems.push(`${sLabel}: la clase pasaría de medianoche.`);
      } else if (!schedule.startTime || !schedule.endTime) {
        problems.push(`${sLabel}: faltan la hora de inicio y de fin.`);
      } else if (schedule.endTime <= schedule.startTime) {
        problems.push(
          `${sLabel}: la hora de fin debe ser posterior a la de inicio.`,
        );
      }
    });
  });

  const firstClass = firstClassDay(items);
  if (
    firstClass &&
    options.enrollmentEnd &&
    options.enrollmentEnd.slice(0, 10) > firstClass
  ) {
    problems.push(
      "La matrícula debe cerrar antes (o el mismo día) de la primera clase.",
    );
  }

  return problems;
};

/**
 * Une un día (`YYYY-MM-DD…`) con una hora (`HH:mm:ss`) en el formato que espera
 * la API. Devuelve null si no hay día: media fecha no sirve.
 */
export const withTime = (
  day: string | null | undefined,
  time: string,
): string | null => (day ? `${day.slice(0, 10)} ${time}` : null);

/** Hora (`HH:mm:ss`) de una fecha guardada; el default si no la trae. */
export const timeOf = (
  value: string | null | undefined,
  fallback: string,
): string => {
  if (!value || typeof value !== "string") return fallback;
  const time = value.slice(11, 19);
  return /^\d{2}:\d{2}:\d{2}$/.test(time) ? time : fallback;
};

/** Día (`YYYY-MM-DD`) de una fecha guardada, para armar el rango del picker. */
export const dayOf = (value: string | null | undefined): string | null =>
  value && typeof value === "string" ? value.slice(0, 10) : null;

/**
 * Fecha de inicio de matrícula como `Date`, que es lo que necesita el picker de
 * los horarios del curso. El formulario guarda el string de la API.
 */
export const enrollmentStartAsDate = (value: unknown): Date | undefined => {
  if (!value || typeof value !== "string") return undefined;
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

// ─── Fechas (días locales `YYYY-MM-DD`, sin zona horaria) ──────────────────

/** `YYYY-MM-DD` o `DD/MM/YYYY` → `Date` a medianoche local. */
export const parseDay = (value?: string | null): Date | null => {
  if (!value || typeof value !== "string") return null;
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const dmy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (dmy) return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
  return null;
};

export const formatDay = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const addDays = (day: string, days: number): string => {
  const date = parseDay(day)!;
  date.setDate(date.getDate() + days);
  return formatDay(date);
};

/**
 * Semanas que ocupa un tramo contando ambos extremos: 4 semanas de curso son
 * 28 días (del 28-oct al 24-nov) → 4, no 5. El `round(...) + 1` del diseño
 * contaba una semana de más siempre que el tramo no cerrara en múltiplo de 7.
 */
export const weeksSpan = (start?: string | null, end?: string | null): number | null => {
  const from = parseDay(start);
  const to = parseDay(end);
  if (!from || !to) return null;
  const days = Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
  return Math.max(1, Math.ceil(days / 7));
};

/** `monday`…`sunday` → `getDay()` de JS (domingo = 0). */
const WEEKDAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/** Días que dura un curso: semanas × 7; un mes cuenta como 30 días (diseño). */
export const courseDays = (value: number, unit: CourseDurationUnit): number =>
  unit === "months" ? Math.round(value * 30) : value * 7;

/** Último día del curso: "9 semanas" desde el martes 3 = el lunes de la semana 9. */
export const courseEnd = (
  start: string,
  value: number,
  unit: CourseDurationUnit,
): string => addDays(start, courseDays(value, unit) - 1);

/** Ese día si es lunes; si no, el lunes siguiente. */
export const nextMonday = (day: string): string => {
  const weekday = parseDay(day)!.getDay();
  return weekday === 1 ? day : addDays(day, (8 - weekday) % 7);
};

/**
 * Fechas de cada curso EN CASCADA desde el inicio de clases (diseño
 * `crear-programa.jsx`): el curso 1 empieza el inicio de clases y dura lo que
 * diga su duración; en una línea de carrera cada curso siguiente arranca el
 * LUNES posterior a que termina el anterior — la línea se cursa en secuencia.
 */
export const cascadeCourseDates = (
  items: OfferCourseItem[],
  classStart: string | null,
  sequential: boolean,
): void => {
  if (!classStart) {
    for (const item of items) {
      item.startDate = null;
      item.endDate = null;
    }
    return;
  }

  let cursor: string = classStart;
  for (const item of items) {
    const start = sequential ? cursor : classStart;
    item.startDate = start;
    item.endDate = item.durationValue
      ? courseEnd(start, item.durationValue, item.durationUnit ?? "weeks")
      : null;
    if (sequential && item.endDate) cursor = nextMonday(addDays(item.endDate, 1));
  }
};

/** "martes" para los avisos. */
const DAY_NAME: Record<string, string> = {
  monday: "lunes",
  tuesday: "martes",
  wednesday: "miércoles",
  thursday: "jueves",
  friday: "viernes",
  saturday: "sábado",
  sunday: "domingo",
};

const hhmm = (time: string) => time.slice(0, 5);

/** "03 nov 2026". */
export const dayLabel = (day: string | null | undefined): string => {
  const date = parseDay(day);
  return date
    ? new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" })
        .format(date)
        .replace(/\./g, "")
    : "—";
};

/**
 * Avisos de UNA tarjeta de curso (diseño `admCursoWarnings`): se muestran en
 * ámbar dentro de la tarjeta y tiñen su barra del resumen. Un curso puede
 * repetir día, pero no la hora.
 */
export const courseWarnings = (
  item: OfferCourseItem,
  previous?: OfferCourseItem | null,
): string[] => {
  const warnings: string[] = [];

  if (!item.schedules.length) warnings.push("Este curso no tiene ningún horario asignado.");

  if (previous?.endDate && item.startDate && item.startDate <= previous.endDate) {
    warnings.push(
      `Se solapa con "${previous.name}": empieza el ${dayLabel(item.startDate)}, antes de que termine (${dayLabel(previous.endDate)}).`,
    );
  }

  for (let a = 0; a < item.schedules.length; a++) {
    for (let b = a + 1; b < item.schedules.length; b++) {
      const one = item.schedules[a]!;
      const two = item.schedules[b]!;
      if (!one.dayOfWeek || one.dayOfWeek !== two.dayOfWeek) continue;
      const s1 = toMinutes(one.startTime);
      const s2 = toMinutes(two.startTime);
      const e1 = toMinutes(one.endTime);
      const e2 = toMinutes(two.endTime);
      if (s1 === null || s2 === null) continue;
      const day = DAY_NAME[one.dayOfWeek] ?? one.dayOfWeek;
      if (s1 === s2) {
        warnings.push(
          `Dos horarios del curso caen el mismo día y la misma hora: ${day} ${hhmm(one.startTime)}. Puede repetirse el día, pero no la hora.`,
        );
      } else if (e1 !== null && e2 !== null && s1 < e2 && s2 < e1) {
        warnings.push(
          `Dos horarios del curso se pisan el ${day} (${hhmm(one.startTime)}–${hhmm(one.endTime)} y ${hhmm(two.startTime)}–${hhmm(two.endTime)}).`,
        );
      }
    }
  }

  return warnings;
};

/**
 * Matrícula calculada: abre `daysBefore` días antes de la primera clase y
 * cierra el día anterior a ella.
 */
export const enrollmentFromFirstClass = (
  firstClass: string,
  daysBefore: number,
): [string, string] => [addDays(firstClass, -daysBefore), addDays(firstClass, -1)];

/** Primera clase del programa: el inicio más temprano entre sus cursos. */
export const firstClassDay = (items: OfferCourseItem[]): string | null =>
  items
    .map((item) => item.startDate)
    .filter((day): day is string => !!day)
    .sort()[0] ?? null;

/** Última clase del programa. */
export const lastClassDay = (items: OfferCourseItem[]): string | null =>
  items
    .map((item) => item.endDate)
    .filter((day): day is string => !!day)
    .sort()
    .reverse()[0] ?? null;

// ─── Horas: inicio, duración y fin enlazados ───────────────────────────────

/** Duraciones rápidas del horario, en minutos. */
export const DURATION_PRESETS = [30, 45, 60, 90, 120, 180];

const MINUTES_IN_DAY = 24 * 60;

export const toMinutes = (time?: string | null): number | null => {
  const match = (time ?? "").match(/^(\d{2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
};

export const fromMinutes = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00`;

/** "1 h 30", "45 min", "2 h". */
export const formatDuration = (minutes: number | null | undefined): string => {
  if (!minutes || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
};

/** Duración vigente: la elegida o, si no, la que da fin − inicio (al editar). */
export const scheduleDuration = (schedule: OfferSchedule): number | null => {
  if (schedule.durationMin) return schedule.durationMin;
  const start = toMinutes(schedule.startTime);
  const end = toMinutes(schedule.endTime);
  return start !== null && end !== null && end > start ? end - start : null;
};

/*
 * El INICIO es el ancla:
 * - cambiar la duración mueve el fin;
 * - cambiar el fin recalcula la duración;
 * - cambiar el inicio conserva la duración y corre el fin.
 * Si inicio + duración pasa de medianoche, el fin queda vacío y la validación
 * lo explica: una clase no cruza al día siguiente.
 */
const applyEnd = (schedule: OfferSchedule) => {
  const start = toMinutes(schedule.startTime);
  const duration = schedule.durationMin;
  if (start === null || !duration) return;
  schedule.endTime = start + duration < MINUTES_IN_DAY ? fromMinutes(start + duration) : "";
};

export const setScheduleStart = (schedule: OfferSchedule, time: string) => {
  schedule.durationMin = scheduleDuration(schedule);
  schedule.startTime = time;
  applyEnd(schedule);
};

export const setScheduleDuration = (schedule: OfferSchedule, minutes: number | null) => {
  schedule.durationMin = minutes && minutes > 0 ? minutes : null;
  applyEnd(schedule);
};

export const setScheduleEnd = (schedule: OfferSchedule, time: string) => {
  schedule.endTime = time;
  const start = toMinutes(schedule.startTime);
  const end = toMinutes(time);
  schedule.durationMin = start !== null && end !== null && end > start ? end - start : null;
};

/** Copia del horario para otro día: el primero de la semana que el curso aún no usa. */
export const copyScheduleToNextDay = (
  schedules: OfferSchedule[],
  source: OfferSchedule,
): OfferSchedule => {
  const used = new Set(schedules.map((s) => s.dayOfWeek));
  const order = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const from = order.indexOf(source.dayOfWeek);
  const next =
    [...order.slice(from + 1), ...order.slice(0, Math.max(from, 0))].find((d) => !used.has(d)) ?? "";
  return {
    dayOfWeek: next,
    startTime: source.startTime,
    endTime: source.endTime,
    durationMin: scheduleDuration(source),
  };
};

// ─── Estimados del resumen ─────────────────────────────────────────────────

/** Clases que salen de los horarios de un curso entre su inicio y su fin. */
export const estimateClasses = (item: OfferCourseItem): number => {
  const start = parseDay(item.startDate);
  const end = parseDay(item.endDate);
  if (!start || !end || end < start) return 0;

  const totalDays = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  return item.schedules.reduce((sum, schedule) => {
    const weekday = WEEKDAY_INDEX[schedule.dayOfWeek];
    if (weekday === undefined) return sum;
    const offset = (weekday - start.getDay() + 7) % 7;
    return sum + (offset < totalDays ? Math.floor((totalDays - 1 - offset) / 7) + 1 : 0);
  }, 0);
};

/**
 * Momento (fecha + hora) de la primera clase del programa: el primer día de
 * algún horario a partir del inicio de cada curso, a su hora de inicio. Sin
 * horarios con hora, cae a la medianoche del inicio del curso.
 */
export const firstClassMoment = (items: OfferCourseItem[]): Date | null => {
  let first: Date | null = null;
  for (const item of items) {
    const start = parseDay(item.startDate);
    if (!start) continue;
    const candidates = item.schedules
      .map((schedule) => {
        const weekday = WEEKDAY_INDEX[schedule.dayOfWeek];
        const minutes = toMinutes(schedule.startTime);
        if (weekday === undefined || minutes === null) return null;
        const day = new Date(start);
        day.setDate(day.getDate() + ((weekday - start.getDay() + 7) % 7));
        day.setMinutes(minutes);
        return day;
      })
      .filter((day): day is Date => !!day);
    for (const day of candidates.length ? candidates : [start]) {
      if (!first || day < first) first = day;
    }
  }
  return first;
};

/** Minutos de clase por semana de un curso. */
export const weeklyMinutes = (item: OfferCourseItem): number =>
  item.schedules.reduce((sum, schedule) => sum + (scheduleDuration(schedule) ?? 0), 0);
