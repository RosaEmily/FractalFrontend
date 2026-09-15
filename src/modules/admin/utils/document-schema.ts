import { z } from "zod";
import {
  getDocumentRule,
  PHONE_PE,
  type DocumentRule,
} from "@/modules/admin/constants/documents";

/**
 * Esquema del número de documento, **dependiente del tipo elegido**.
 *
 * Antes era `max(50)` para todos, así que un DNI de 3 dígitos pasaba. Cada
 * tipo tiene su propia longitud (RENIEC/SUNAT) y el mensaje de error dice el
 * número exacto que se espera, no un genérico.
 *
 * Se llama desde un `computed` que depende de `document_type`: al cambiar el
 * tipo, el esquema se rehace con las reglas nuevas.
 */
export const documentNumberSchema = (type?: string | null) => {
  const rule: DocumentRule = getDocumentRule(type);

  let schema = z.string({ message: "El número de documento es obligatorio" });

  if (rule.length) {
    schema = schema
      .min(rule.length, {
        message: `El ${type} debe tener ${rule.length} dígitos`,
      })
      .max(rule.length, {
        message: `El ${type} debe tener ${rule.length} dígitos`,
      });
  } else {
    const min = rule.min ?? 6;
    const max = rule.max ?? 20;
    schema = schema
      .min(min, { message: `Debe tener al menos ${min} caracteres` })
      .max(max, { message: `No puede tener más de ${max} caracteres` });
  }

  return rule.numericOnly
    ? schema.regex(/^\d+$/, { message: "Solo se permiten dígitos" })
    : schema.regex(/^[A-Za-z0-9]+$/, {
        message: "Solo letras y números, sin espacios ni guiones",
      });
};

/**
 * Teléfono móvil peruano: 9 dígitos que empiezan en 9.
 *
 * El valor llega con la máscara aplicada ("987 654 321"), así que se limpian
 * los espacios antes de validar y de enviar — la API guarda solo dígitos.
 */
export const phoneSchema = () =>
  z
    .string({ message: "El teléfono es obligatorio" })
    .transform((value) => value.replace(/\s/g, ""))
    .refine((value) => PHONE_PE.regex.test(value), {
      message: "Debe ser un móvil peruano de 9 dígitos que empiece en 9",
    });
