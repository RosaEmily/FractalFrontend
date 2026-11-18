import { computed, onMounted, onUnmounted, ref, shallowRef } from "vue";
import { downloadCsv } from "@/shared/utils/csv";
import { createImportWorker } from "./worker-client";
import { importService } from "./service";
import {
  IMPORT_LIMITS,
  type ImportColumn,
  type ImportKind,
  type ImportResult,
  type ImportSummary,
  type PreviewRow,
  type RowFilter,
} from "./types";

export function usePeopleImport(props: {
  kind: ImportKind;
  entity: string;
  columns: ImportColumn[];
}) {
  const mode = ref<"file" | "paste">("file");
  const text = ref("");
  const filename = ref("");
  const summary = shallowRef<ImportSummary | null>(null);
  const phase = ref<"review" | "sending" | "paused" | "done">("review");
  const processed = ref(0);
  const created = ref(0);
  const failed = ref(0);
  const rows = shallowRef<PreviewRow[]>([]);
  const visibleTotal = ref(0);
  const page = ref(0);
  const filter = ref<RowFilter>("all");
  const reading = ref(false);
  const sending = ref(false);
  const downloading = ref(false);
  const error = ref("");
  let worker: ReturnType<typeof createImportWorker> | null = null;
  let alive = true;
  let nextOffset = 0;

  const busy = computed(() => reading.value || sending.value);
  const step = computed(() =>
    phase.value !== "review" ? 3 : summary.value ? 2 : 1,
  );
  const validCount = computed(() => summary.value?.valid ?? 0);
  const progress = computed(() =>
    validCount.value
      ? Math.round((100 * processed.value) / validCount.value)
      : 0,
  );
  const pages = computed(() =>
    Math.max(1, Math.ceil(visibleTotal.value / IMPORT_LIMITS.pageSize)),
  );
  const statusText = computed(
    () =>
      ({
        review: "",
        sending: "Importando",
        paused: "Importación interrumpida",
        done: "Importación terminada",
      })[phase.value],
  );
  const number = (value: number) => value.toLocaleString("es-PE");
  const statusLabel = (row: PreviewRow) =>
    ({
      pending: step.value === 3 ? "Pendiente" : "Lista para importar",
      invalid: "Revisar",
      ok: "Creado",
      failed: "Con error",
    })[row.status];
  const message = (cause: unknown) =>
    cause instanceof Error
      ? cause.message
      : "No pudimos completar la operación. Inténtalo de nuevo.";

  async function showPage() {
    if (!alive) return;
    if (!worker || !summary.value) return;
    const result = await worker.call<{ rows: PreviewRow[]; total: number }>({
      type: "page",
      offset: page.value * IMPORT_LIMITS.pageSize,
      filter: filter.value,
    });
    rows.value = result.rows;
    visibleTotal.value = result.total;
  }

  async function read(file?: File) {
    if (busy.value) return;
    error.value = "";
    reading.value = true;
    try {
      summary.value = null;
      rows.value = [];
      phase.value = "review";
      processed.value = created.value = failed.value = nextOffset = 0;
      worker?.dispose();
      worker = createImportWorker();
      filename.value = file?.name ?? "Datos pegados desde Excel";
      if ((file?.size ?? new Blob([text.value]).size) > IMPORT_LIMITS.fileBytes)
        throw new Error("Máximo 2 MB por archivo.");
      summary.value = await worker.call<ImportSummary>({
        type: "analyze",
        kind: props.kind,
        ...(file ? { file } : { text: text.value }),
      });
      page.value = 0;
      filter.value = "all";
      await showPage();
    } catch (cause) {
      error.value = message(cause);
    } finally {
      reading.value = false;
    }
  }

  function warnBeforeLeaving(event: BeforeUnloadEvent) {
    if (sending.value) event.preventDefault();
  }

  async function start() {
    if (!summary.value?.valid || !worker || busy.value) return;
    sending.value = true;
    error.value = "";
    phase.value = "sending";
    filter.value = "all";
    page.value = 0;
    try {
      while (nextOffset < summary.value.valid) {
        if (!alive) return;
        const batch = await worker.call<unknown[]>({
          type: "batch",
          offset: nextOffset,
        });
        if (!batch.length)
          throw new Error("No se pudo preparar el siguiente bloque.");
        const { results } = await importService.submit(props.kind, batch);
        const totals = await worker.call<{ created: number; failed: number }>({
          type: "record",
          results: results as ImportResult[],
        });
        nextOffset += batch.length;
        processed.value = nextOffset;
        created.value = totals.created;
        failed.value = totals.failed;
        await showPage();
      }
      phase.value = "done";
    } catch (cause) {
      phase.value = "paused";
      error.value = `${message(cause)} Las cuentas ya creadas se conservan; puedes continuar con las filas pendientes.`;
    } finally {
      sending.value = false;
    }
  }

  async function changePage(next: number, nextFilter = filter.value) {
    page.value = next;
    filter.value = nextFilter;
    try {
      await showPage();
    } catch (cause) {
      error.value = message(cause);
    }
  }

  function template() {
    downloadCsv(`plantilla-${props.entity}.csv`, [
      props.columns.map((c) => c.label),
      props.columns.map((c) => c.example ?? ""),
    ]);
  }

  async function report(localErrors = false) {
    if (!worker) return;
    downloading.value = true;
    try {
      const blob = await worker.call<Blob>({
        type: localErrors ? "errors" : "report",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${localErrors ? "errores" : "resultado"}-${props.entity}.csv`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      error.value = message(cause);
    } finally {
      downloading.value = false;
    }
  }

  function reset() {
    worker?.dispose();
    worker = null;
    phase.value = "review";
    summary.value = null;
    rows.value = [];
    visibleTotal.value = 0;
    text.value = "";
    error.value = "";
    filename.value = "";
    processed.value = created.value = failed.value = nextOffset = 0;
  }

  onMounted(() => window.addEventListener("beforeunload", warnBeforeLeaving));
  onUnmounted(() => {
    alive = false;
    window.removeEventListener("beforeunload", warnBeforeLeaving);
    worker?.dispose();
  });

  return {
    mode,
    text,
    filename,
    summary,
    phase,
    processed,
    created,
    failed,
    rows,
    visibleTotal,
    page,
    filter,
    reading,
    sending,
    downloading,
    error,
    busy,
    step,
    validCount,
    progress,
    pages,
    statusText,
    number,
    statusLabel,
    read,
    start,
    changePage,
    template,
    report,
    reset,
  };
}
