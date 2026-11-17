import { z } from "zod";
import { isValidPhone } from "@/shared/components/core/input/phone/countries";
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
 * Teléfono en E.164 (+51987654321), que es lo que envía `InputPhoneCore`.
 *
 * Los valores guardados antes del selector de país son 9 dígitos sin prefijo:
 * se normalizan a +51 para que al guardar queden todos en el mismo formato.
 * Por ahora solo se aceptan móviles peruanos; al habilitar otro país en
 * `PHONE_COUNTRIES`, ampliar aquí y en la regla `PeruvianMobile` de la API.
 */
export const phoneSchema = () =>
  z
    .string({ message: "El teléfono es obligatorio" })
    .transform((value) => {
      const clean = value.replace(/\s/g, "");
      return PHONE_PE.regex.test(clean) ? `+51${clean}` : clean;
    })
    .refine(
      (value) => value.startsWith("+51") && isValidPhone(value),
      { message: "Ingresa un móvil peruano válido (9 dígitos que empiece en 9)" },
    );
