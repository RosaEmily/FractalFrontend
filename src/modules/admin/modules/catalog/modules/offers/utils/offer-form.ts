import type { OfferCourseItem, OfferSchedule } from "../models/offer.model";

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
  "de", "del", "la", "las", "el", "los", "y", "e", "en", "para", "con", "a",
  "al", "por", "un", "una",
]);

/**
 * Prefijo sugerido: siglas del nombre + año de inicio de matrícula.
 *
 * El diseño lo llama "código corto interno", así que se buscan siglas y no un
 * slug del nombre completo. El año distingue dos cohortes del mismo programa,
 * que es el caso normal (2026-I y 2026-II comparten nombre).
 */
export const suggestPrefix = (
  name: string | null,
  startDate?: string | null,
): string => {
  if (!name?.trim()) return "";

  const initials = name
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

  const year = startDate
    ? new Date(`${startDate.slice(0, 10)}T00:00:00`).getFullYear()
    : null;

  return year && !Number.isNaN(year) ? `${initials}-${year}` : initials;
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
     * El curso no puede empezar antes de que abra la matrícula: nadie podría
     * haberse inscrito. Terminar después del cierre sí es normal —la matrícula
     * cierra y el programa sigue dictándose—, así que solo se acota el inicio.
     */
    if (
      item.startDate &&
      enrollmentStart &&
      item.startDate < enrollmentStart.slice(0, 10)
    ) {
      problems.push(`${label}: no puede iniciar antes de que abra la matrícula.`);
    }

    if (item.meetLink && !/^https?:\/\/\S+$/i.test(item.meetLink)) {
      problems.push(
        `${label}: el enlace de videoconferencia no es una URL válida.`,
      );
    }

    if (!item.schedules.length) {
      problems.push(`${label}: debe tener al menos un horario.`);
    }

    const seenDays = new Map<string, number>();

    item.schedules.forEach((schedule, sIndex) => {
      const sLabel = `${label} · horario ${sIndex + 1}`;

      if (!schedule.dayOfWeek) {
        problems.push(`${sLabel}: falta elegir el día.`);
      } else if (seenDays.has(schedule.dayOfWeek)) {
        // Dos bloques el mismo día se solapan al generar las clases.
        problems.push(`${sLabel}: ese día ya tiene horario en este curso.`);
      } else {
        seenDays.set(schedule.dayOfWeek, sIndex);
      }

      if (!schedule.startTime || !schedule.endTime) {
        problems.push(`${sLabel}: faltan la hora de inicio y de fin.`);
      } else if (schedule.endTime <= schedule.startTime) {
        problems.push(
          `${sLabel}: la hora de fin debe ser posterior a la de inicio.`,
        );
      }
    });
  });

  return problems;
};
