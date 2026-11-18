import api from "@/shared/helpers/axios/api-fractal";
import type { ImportKind, ImportResult } from "./types";

const route = "security/people-imports";

export const importRepository = {
  submit: (kind: ImportKind, rows: unknown[]) =>
    api.post<{ results: ImportResult[] }>(
      route,
      { kind, rows },
      { background: true, timeout: 60000 },
    ),
};
