/**
 * Decodifica un JSON de forma segura.
 * 🔁 Conversión: string JSON → objeto / array
 */
export function safeJsonParse<T = unknown>(
  json: string | null | undefined,
): T | string | null {
  if (json === null || json === undefined || json.trim() === "") {
    return null;
  }

  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error("Error al decodificar JSON:", {
      error: (error as Error).message,
      input: json,
    });
    return json; // mismo fallback que en PHP
  }
}

/**
 * Codifica un valor a JSON de forma segura.
 * 🔁 Conversión: objeto / array → string JSON
 */
export function safeJsonStringify(data: unknown): string {
  if (data === null || data === undefined || data === "") {
    return "";
  }

  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error("Error al codificar JSON:", {
      error: (error as Error).message,
      input: data,
    });
    return "";
  }
}
