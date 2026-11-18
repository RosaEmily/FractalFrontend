<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed, ref } from "vue";
import type { ZodTypeAny } from "zod";
import { CardCore, ButtonCore, TextAreaCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import {
  downloadCsv,
  normalizeKey,
  parseDelimited,
} from "@/shared/utils/csv";

/**
 * Importación masiva desde Excel/CSV, reutilizable por cualquier módulo.
 *
 * El admin pega las celdas (o sube un .csv), ve una vista previa con el error
 * de cada fila y envía solo las válidas, UNA POR UNA a la API de siempre: así
 * cada fila pasa por las mismas reglas que el formulario (correo único,
 * documento, contraseña…) y un fallo no tumba al resto.
 *
 * Cada módulo solo declara sus columnas, el esquema y cómo se envía una fila.
 */
export interface ImportColumn {
  key: string;
  label: string;
  required?: boolean;
  /** Otros nombres aceptados en la cabecera. */
  aliases?: string[];
  example?: string;
  /** Convierte el texto de la celda (etiqueta → valor, fecha → ISO…). */
  map?: (raw: string) => unknown;
}

const props = defineProps<{
  title: string;
  /** "estudiantes", "docentes": para los textos. */
  entity: string;
  /** Ruta a la que vuelve Cancelar / Volver. */
  redirect: string;
  columns: ImportColumn[];
  /** Valida UNA fila ya convertida. */
  schema: ZodTypeAny;
  /** Claves que no pueden repetirse dentro del archivo. */
  uniqueKeys?: string[];
  /** Arma lo que se envía; `secret` (p. ej. clave temporal) va solo al reporte final. */
  build: (row: Record<string, unknown>) => { body: T; secret?: string };
  send: (body: T) => Promise<unknown>;
  /** Columnas que identifican la fila en el reporte. */
  identity: string[];
  /** Nombre de la columna del dato secreto en el reporte. */
  secretLabel?: string;
  filename?: string;
}>();

/** Más de 60 por minuto agota el límite general de la API. */
const PACE_MS = 1100;
const MAX_ROWS = 300;

type Status = "pending" | "invalid" | "sending" | "ok" | "failed";
interface Row {
  n: number;
  raw: Record<string, string>;
  values: Record<string, unknown>;
  errors: string[];
  status: Status;
  detail: string;
  secret?: string;
}

const toast = useToastStore();
const text = ref("");
const rows = ref<Row[]>([]);
const running = ref(false);
const stopRequested = ref(false);
const analyzed = ref(false);

const byKey = computed(() => {
  const m = new Map<string, ImportColumn>();
  for (const c of props.columns) {
    m.set(normalizeKey(c.label), c);
    m.set(normalizeKey(c.key), c);
    for (const a of c.aliases ?? []) m.set(normalizeKey(a), c);
  }
  return m;
});

const counts = computed(() => ({
  total: rows.value.length,
  valid: rows.value.filter((r) => r.status === "pending").length,
  invalid: rows.value.filter((r) => r.status === "invalid").length,
  ok: rows.value.filter((r) => r.status === "ok").length,
  failed: rows.value.filter((r) => r.status === "failed").length,
}));

const pendingDone = computed(() => counts.value.ok + counts.value.failed);

function analyze() {
  const grid = parseDelimited(text.value);
  rows.value = [];
  analyzed.value = true;
  if (!grid.length) return;

  // ¿La primera fila es la cabecera? Basta con que reconozca la mitad de las columnas.
  const first = (grid[0] ?? []).map((c) => byKey.value.get(normalizeKey(c)));
  const hasHeader = first.filter(Boolean).length >= Math.ceil(props.columns.length / 2);
  const order: (ImportColumn | undefined)[] = hasHeader ? first : props.columns;
  const body = hasHeader ? grid.slice(1) : grid;

  if (body.length > MAX_ROWS) {
    toast.showToastError({
      detail: `Máximo ${MAX_ROWS} filas por importación (traes ${body.length}). Divide el archivo.`,
    });
    return;
  }

  const seen = new Map<string, Map<string, number>>();
  rows.value = body.map((cells, i) => {
    const raw: Record<string, string> = {};
    const values: Record<string, unknown> = {};
    order.forEach((col, idx) => {
      if (!col) return;
      const cell = (cells[idx] ?? "").trim();
      raw[col.key] = cell;
      values[col.key] = cell === "" ? undefined : col.map ? col.map(cell) : cell;
    });

    const errors: string[] = [];
    const parsed = props.schema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const col = props.columns.find((c) => c.key === issue.path[0]);
        errors.push(`${col?.label ?? issue.path.join(".")}: ${issue.message}`);
      }
    }
    for (const key of props.uniqueKeys ?? []) {
      const v = String(raw[key] ?? "").toLowerCase();
      if (!v) continue;
      const map = seen.get(key) ?? new Map<string, number>();
      if (map.has(v)) errors.push(`${props.columns.find((c) => c.key === key)?.label ?? key} repetido (fila ${map.get(v)})`);
      else map.set(v, i + 1);
      seen.set(key, map);
    }

    return {
      n: i + 1,
      raw,
      values: parsed.success ? (parsed.data as Record<string, unknown>) : values,
      errors,
      status: errors.length ? "invalid" : "pending",
      detail: errors.join(" · "),
    } as Row;
  });
}

function onFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    text.value = String(reader.result ?? "");
    analyze();
  };
  reader.readAsText(file, "utf-8");
}

function template() {
  downloadCsv(`plantilla-${props.entity}.csv`, [
    props.columns.map((c) => c.label),
    props.columns.map((c) => c.example ?? ""),
  ]);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function run() {
  running.value = true;
  stopRequested.value = false;
  for (const row of rows.value) {
    if (stopRequested.value) break;
    if (row.status !== "pending") continue;
    row.status = "sending";

    const { body, secret } = props.build(row.values);
    let attempt = 0;
    for (;;) {
      const res = await safeRequest(() => props.send(body), { showAlert: false });
      if (res.status) {
        row.status = "ok";
        row.detail = "Creado";
        row.secret = secret;
        break;
      }
      const tooMany = /demasiad|too many|429|RATE_LIMIT|TOO_MANY/i.test(
        `${res.error?.code} ${res.error?.message}`,
      );
      if (tooMany && attempt < 3) {
        attempt++;
        row.detail = "Esperando por límite de peticiones…";
        await sleep(20000);
        continue;
      }
      row.status = "failed";
      row.detail = describeError(res.error);
      break;
    }
    await sleep(PACE_MS);
  }
  running.value = false;
  const { ok, failed } = counts.value;
  if (!stopRequested.value) {
    (failed ? toast.showToastError : toast.showToastSuccess)({
      detail: `${ok} ${props.entity} creados${failed ? ` y ${failed} con error` : ""}.`,
    });
  }
}

function describeError(error: { message: string | null; details?: unknown } | null): string {
  if (!error) return "Error desconocido";
  const d = error.details;
  if (d && typeof d === "object" && !Array.isArray(d)) {
    const msgs = Object.values(d as Record<string, unknown>)
      .flat()
      .map(String);
    if (msgs.length) return msgs.join(" · ");
  }
  return error.message || "Error desconocido";
}

const STATUS_LABEL: Record<Status, string> = {
  pending: "Lista",
  invalid: "Con errores",
  sending: "Enviando…",
  ok: "Creado",
  failed: "Falló",
};
const STATUS_CLASS: Record<Status, string> = {
  pending: "bg-info-50 text-info-DEFAULT",
  invalid: "bg-danger-50 text-danger-DEFAULT",
  sending: "bg-amber-50 text-amber-DEFAULT",
  ok: "bg-success-50 text-success-DEFAULT",
  failed: "bg-danger-50 text-danger-DEFAULT",
};

function report() {
  const head = ["Fila", ...props.identity.map((k) => props.columns.find((c) => c.key === k)?.label ?? k), "Estado", "Detalle"];
  if (props.secretLabel) head.push(props.secretLabel);
  downloadCsv(`resultado-${props.entity}.csv`, [
    head,
    ...rows.value.map((r) => [
      String(r.n),
      ...props.identity.map((k) => r.raw[k] ?? ""),
      STATUS_LABEL[r.status],
      r.detail,
      ...(props.secretLabel ? [r.secret ?? ""] : []),
    ]),
  ]);
}
</script>

<template>
  <CardCore>
    <template #title>
      <span class="font-display text-adm-xl font-bold tracking-tight text-secondary-900">
        {{ title }}
      </span>
    </template>

    <div class="space-y-4">
      <p class="text-adm-sm text-secondary-500">
        Pega aquí las filas copiadas de Excel o sube un archivo .csv. Máximo
        {{ MAX_ROWS }} filas. Cada fila se valida con las mismas reglas del
        formulario y solo se envían las correctas.
      </p>

      <div class="flex flex-wrap gap-2">
        <ButtonCore class="!w-auto" size="small" severity="secondary" outlined label="Descargar plantilla" @click="template" />
        <label class="inline-flex">
          <input type="file" accept=".csv,.tsv,.txt,text/csv" class="sr-only" @change="onFile" />
          <span class="p-button p-component p-button-sm p-button-secondary p-button-outlined cursor-pointer !w-auto">
            Subir archivo CSV
          </span>
        </label>
      </div>

      <details class="rounded-adm border border-line-soft bg-admin-bg p-3 text-adm-sm">
        <summary class="cursor-pointer font-semibold text-secondary-900">Columnas esperadas</summary>
        <ul class="mt-2 grid gap-1 sm:grid-cols-2">
          <li v-for="c in columns" :key="c.key" class="text-secondary-600">
            <b class="text-secondary-900">{{ c.label }}</b>
            <span v-if="c.required" class="text-danger-DEFAULT"> *</span>
            <span v-if="c.example"> · ej. {{ c.example }}</span>
          </li>
        </ul>
      </details>

      <TextAreaCore v-model="text" label="Datos" :rows="7" placeholder="Pega aquí las filas…" :disabled="running" />

      <div class="flex flex-wrap items-center gap-2">
        <ButtonCore class="!w-auto" label="Revisar datos" :disabled="!text.trim() || running" @click="analyze" />
        <span v-if="analyzed && counts.total" class="text-adm-sm text-secondary-500">
          {{ counts.total }} filas · {{ counts.valid + counts.ok }} válidas · {{ counts.invalid }} con errores
        </span>
      </div>

      <div v-if="rows.length" class="overflow-x-auto rounded-adm border border-line-soft">
        <table class="w-full min-w-[40rem] text-left text-adm-sm">
          <thead class="bg-admin-bg text-secondary-500">
            <tr>
              <th class="px-3 py-2">#</th>
              <th v-for="k in identity" :key="k" class="px-3 py-2">
                {{ columns.find((c) => c.key === k)?.label }}
              </th>
              <th class="px-3 py-2">Estado</th>
              <th class="px-3 py-2">Detalle</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.n" class="border-t border-line-soft">
              <td class="px-3 py-2 text-secondary-400">{{ r.n }}</td>
              <td v-for="k in identity" :key="k" class="px-3 py-2">{{ r.raw[k] }}</td>
              <td class="px-3 py-2">
                <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="STATUS_CLASS[r.status]">
                  {{ STATUS_LABEL[r.status] }}
                </span>
              </td>
              <td class="px-3 py-2 text-secondary-600">{{ r.detail }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pendingDone" class="rounded-adm border border-line-soft bg-admin-bg p-3 text-adm-sm text-secondary-700">
        {{ counts.ok }} creados, {{ counts.failed }} con error.
        <template v-if="secretLabel">
          Descarga el reporte ahora: la {{ secretLabel.toLowerCase() }} solo se muestra aquí y
          hay que entregarla a cada persona.
        </template>
      </div>
    </div>

    <div class="flex flex-wrap gap-2.5 justify-end items-center mt-7 -mx-5 -mb-5 px-7 py-4.5 border-t border-line-soft bg-admin-bg rounded-b-adm-lg">
      <ButtonCore as="RouterLink" :to="{ name: redirect }" class="!w-auto" severity="secondary" outlined label="Volver" />
      <ButtonCore v-if="pendingDone" class="!w-auto" severity="secondary" outlined label="Descargar reporte" @click="report" />
      <ButtonCore v-if="running" class="!w-auto" severity="danger" outlined label="Detener" @click="stopRequested = true" />
      <ButtonCore
        v-else
        class="!w-auto"
        :label="`Importar ${counts.valid} ${entity}`"
        :disabled="!counts.valid"
        @click="run"
      />
    </div>
  </CardCore>
</template>
