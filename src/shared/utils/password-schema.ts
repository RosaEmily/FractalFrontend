import { z } from "zod";

/**
 * Misma política que `StrongPassword` de la API: 8 a 72 caracteres, con al
 * menos una letra y un número. Solo para crear o cambiar la contraseña; el
 * login no la valida.
 */
export const strongPassword = (requiredMessage = "La contraseña es obligatoria") =>
  z
    .string({ message: requiredMessage })
    .min(8, { message: "Debe tener al menos 8 caracteres" })
    .max(72, { message: "No puede tener más de 72 caracteres" })
    .regex(/\p{L}/u, { message: "Debe incluir al menos una letra" })
    .regex(/\d/, { message: "Debe incluir al menos un número" });
