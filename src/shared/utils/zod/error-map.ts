import { z } from "zod";

const TYPES: Record<string, string> = {
  string: "texto",
  number: "número",
  integer: "número entero",
  boolean: "verdadero o falso",
  date: "fecha",
  array: "lista",
  object: "objeto",
};

/**
 * Mensajes de zod en español para los casos sin mensaje propio. Los mensajes
 * que cada esquema declara siguen mandando; esto solo evita ver "Required" o
 * "Expected string" en pantalla.
 *
 * Para otro idioma, reemplazar este mapa por uno que lea del idioma activo.
 */
export const spanishErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === "undefined" || issue.received === "null") {
        return { message: "Este campo es obligatorio" };
      }
      return {
        message: `Debe ser ${TYPES[issue.expected] ?? "un valor válido"}`,
      };
    case z.ZodIssueCode.too_small:
      if (issue.type === "string") {
        return {
          message:
            issue.minimum === 1
              ? "Este campo es obligatorio"
              : `Debe tener al menos ${issue.minimum} caracteres`,
        };
      }
      if (issue.type === "array") {
        return { message: `Debe tener al menos ${issue.minimum} elementos` };
      }
      return { message: `Debe ser mayor o igual a ${issue.minimum}` };
    case z.ZodIssueCode.too_big:
      if (issue.type === "string") {
        return { message: `No puede tener más de ${issue.maximum} caracteres` };
      }
      if (issue.type === "array") {
        return { message: `No puede tener más de ${issue.maximum} elementos` };
      }
      return { message: `Debe ser menor o igual a ${issue.maximum}` };
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === "email") {
        return { message: "Ingresa un correo electrónico válido" };
      }
      if (issue.validation === "url") {
        return { message: "Ingresa una URL válida" };
      }
      return { message: "El formato no es válido" };
    case z.ZodIssueCode.invalid_enum_value:
      return { message: "Selecciona una opción válida" };
    case z.ZodIssueCode.invalid_date:
      return { message: "Ingresa una fecha válida" };
    case z.ZodIssueCode.not_multiple_of:
      return { message: `Debe ser múltiplo de ${issue.multipleOf}` };
    default:
      return { message: ctx.defaultError };
  }
};
