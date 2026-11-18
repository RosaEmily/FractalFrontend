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

/** Contraseña temporal que cumple `strongPassword`: 12 caracteres, con letras y números, sin símbolos confusos. */
export function generatePassword(length = 12): string {
  const letters = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const pick = (set: string) => set[crypto.getRandomValues(new Uint32Array(1))[0] % set.length];
  const chars = [pick(letters), pick(digits)];
  while (chars.length < length) chars.push(pick(letters + digits));
  // Mezcla para que letra y número no queden siempre al inicio.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
