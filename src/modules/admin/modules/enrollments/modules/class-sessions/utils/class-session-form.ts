import { z } from "zod";

/**
 * Reglas del formulario de Clases.
 *
 * Viven acá y no en las páginas porque crear y editar comparten todas:
 * duplicadas, garantizaban que alguna quedara distinta entre las dos pantallas.
 */

/** `HH:MM:SS`, el formato que emite `DatePicketCore` con `time-only`. */
const TIME_PATTERN = /^\d{2}:\d{2}:\d{2}$/;

const optionalTime = z
  .string()
  .regex(TIME_PATTERN, { message: "Usa el formato HH:MM:SS" })
  .nullable()
  .optional();

export const classSessionSchema = z
  .object({
    schedule_id: z.number({ message: "Selecciona el horario" }),
    session_date: z.string({ message: "La fecha es obligatoria" }),
    /*
     * Las horas son opcionales: el horario semanal ya define el rango habitual y
     * solo se cargan cuando esta clase puntual se corre. Así quedaron las 22
     * clases sin hora que hay en la base.
     */
    start_time: optionalTime,
    end_time: optionalTime,
    name: z
      .string({ message: "El nombre es obligatorio" })
      .min(3, { message: "Debe tener al menos 3 caracteres" })
      .max(255, { message: "No puede tener más de 255 caracteres" }),
    topic: z
      .string({ message: "El tema es obligatorio" })
      .max(255, { message: "No puede tener más de 255 caracteres" }),
    meet_link: z
      .string()
      .url({ message: "Debe ser una URL válida" })
      .max(255)
      .nullable()
      .optional(),
  })
  /*
   * Una hora sola no describe nada: con solo el inicio, el cronograma del aula
   * no puede dibujar el bloque. O las dos, o ninguna.
   */
  .refine((data) => !data.start_time || !!data.end_time, {
    message: "Falta la hora de fin",
    path: ["end_time"],
  })
  .refine((data) => !data.end_time || !!data.start_time, {
    message: "Falta la hora de inicio",
    path: ["start_time"],
  })
  .refine(
    (data) =>
      !data.start_time || !data.end_time || data.end_time > data.start_time,
    {
      message: "La hora de fin debe ser posterior a la de inicio",
      path: ["end_time"],
    },
  );
