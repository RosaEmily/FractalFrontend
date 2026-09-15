/**
 * Serialización de cuerpos que llevan archivos.
 *
 * El cliente axios fija `Content-Type: application/json`, así que un `File`
 * dentro del body se serializaría como `{}` y llegaría vacío al servidor. Estas
 * funciones detectan ese caso y arman el `FormData` correspondiente.
 */

/** ¿El body lleva algún archivo, en la raíz o dentro de un array? */
export const hasFile = (body: unknown): boolean => {
  if (!body || typeof body !== "object") return false;

  return Object.values(body as Record<string, unknown>).some(
    (value) =>
      value instanceof File ||
      (Array.isArray(value) && value.some((item) => item instanceof File)),
  );
};

/**
 * Convierte un objeto plano en `FormData`.
 *
 * Reglas que importan y que se descubren rompiendo cosas:
 *
 * - **`null` y `undefined` se omiten.** `FormData` los convertiría en los
 *   strings `"null"` / `"undefined"`, y PHP los recibiría como texto — un
 *   `nullable` del FormRequest dejaría de cumplirse.
 * - **Los booleanos van como `1`/`0`.** `String(true)` da `"true"`, que la
 *   validación `boolean` de Laravel rechaza.
 * - **Los arrays se envían como `campo[]`**, que es como PHP los agrupa.
 * - **Los objetos van en JSON**: es lo que espera un campo `array` de Laravel
 *   cuando el valor es un mapa (`social_networks`, por ejemplo).
 */
export const toFormData = (body: Record<string, unknown>): FormData => {
  const payload = new FormData();

  const appendValue = (key: string, value: unknown) => {
    if (value === null || value === undefined) return;

    if (value instanceof File || value instanceof Blob) {
      payload.append(key, value);
      return;
    }

    if (typeof value === "boolean") {
      payload.append(key, value ? "1" : "0");
      return;
    }

    if (value instanceof Date) {
      payload.append(key, value.toISOString());
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => appendValue(`${key}[]`, item));
      return;
    }

    if (typeof value === "object") {
      payload.append(key, JSON.stringify(value));
      return;
    }

    payload.append(key, String(value));
  };

  Object.entries(body).forEach(([key, value]) => appendValue(key, value));

  return payload;
};

/**
 * Cuerpo listo para enviar, con los headers que corresponden.
 *
 * ⚠️ En `PUT`/`PATCH` hay que usar **method spoofing**: PHP no parsea
 * `multipart/form-data` fuera de `POST`, así que el body llegaría vacío. Se
 * envía como POST con `_method`, que es lo que Laravel enruta.
 */
export const buildRequestBody = (
  body: Record<string, unknown>,
  method?: "PUT" | "PATCH",
) => {
  if (!hasFile(body)) {
    return { data: body, config: undefined, spoofed: false };
  }

  const payload = toFormData(body);
  if (method) payload.append("_method", method);

  return {
    data: payload,
    // Sin esto el cliente manda application/json y el navegador no pone el
    // boundary que el multipart necesita.
    config: { headers: { "Content-Type": "multipart/form-data" } },
    spoofed: Boolean(method),
  };
};
