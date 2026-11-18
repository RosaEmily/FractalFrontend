<script setup lang="ts">
import { ref } from "vue";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/vue/24/outline";
import { ButtonCore } from "@/shared/components";
import { usePeopleImport } from "@/modules/admin/modules/people/shared/import/usePeopleImport";
import {
  IMPORT_LIMITS,
  type ImportColumn,
  type ImportKind,
} from "@/modules/admin/modules/people/shared/import/types";

const props = defineProps<{
  title: string;
  entity: string;
  kind: ImportKind;
  redirect: string;
  columns: ImportColumn[];
}>();
const {
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
} = usePeopleImport(props);
const input = ref<HTMLInputElement | null>(null);
const dragging = ref(false);
function onFile(event: Event) {
  const element = event.target as HTMLInputElement;
  const file = element.files?.[0];
  if (file) read(file);
  element.value = "";
}
function onDrop(event: DragEvent) {
  dragging.value = false;
  const file = event.dataTransfer?.files[0];
  if (file) read(file);
}
</script>

<template>
  <section class="import-panel" aria-labelledby="import-title">
    <header class="import-header">
      <div>
        <p class="import-eyebrow">PERSONAS / IMPORTACIÓN MASIVA</p>
        <h2 id="import-title">{{ title }}</h2>
        <p class="import-description">
          Carga tu archivo, revisa los datos y crea las cuentas en un solo
          proceso.
        </p>
      </div>
      <ButtonCore
        class="!w-auto shrink-0"
        size="small"
        severity="secondary"
        outlined
        label="Descargar plantilla"
        @click="template"
        ><template #icon><ArrowDownTrayIcon class="size-4" /></template
      ></ButtonCore>
    </header>
    <ol class="import-steps" aria-label="Pasos de importación">
      <li
        v-for="(label, i) in [
          'Cargar archivo',
          'Revisar datos',
          'Importar y resultados',
        ]"
        :key="label"
        :class="{ current: step === i + 1, done: step > i + 1 }"
        :aria-current="step === i + 1 ? 'step' : undefined"
      >
        <span class="step-number"
          ><CheckIcon v-if="step > i + 1" class="size-3.5" /><template v-else>{{
            i + 1
          }}</template></span
        ><span>{{ label }}</span>
      </li>
    </ol>
    <div class="import-body">
      <div v-if="error" class="import-notice error" role="alert">
        <ExclamationTriangleIcon class="size-5 shrink-0" /><span>{{
          error
        }}</span>
      </div>
      <template v-if="step === 1">
        <div class="import-upload-grid">
          <div class="min-w-0">
            <div
              class="import-mode"
              role="group"
              aria-label="Origen de los datos"
            >
              <button
                :class="{ selected: mode === 'file' }"
                :disabled="busy"
                @click="mode = 'file'"
              >
                Subir archivo</button
              ><button
                :class="{ selected: mode === 'paste' }"
                :disabled="busy"
                @click="mode = 'paste'"
              >
                Pegar desde Excel
              </button>
            </div>
            <div
              v-if="mode === 'file'"
              class="import-drop"
              :class="{ dragging, reading }"
              @dragover.prevent="dragging = true"
              @dragleave.prevent="dragging = false"
              @drop.prevent="onDrop"
            >
              <span class="import-upload-icon"
                ><ArrowUpTrayIcon class="size-6"
              /></span>
              <h3>
                {{
                  reading
                    ? "Leyendo y revisando tu archivo…"
                    : "Arrastra tu archivo aquí"
                }}
              </h3>
              <p>o selecciónalo desde tu equipo</p>
              <ButtonCore
                class="!w-auto"
                :label="reading ? 'Revisando archivo' : 'Seleccionar archivo'"
                :loading="reading"
                :disabled="busy"
                @click="input?.click()"
              />
              <span class="import-file-help"
                >XLSX, CSV o TSV · hasta 2 MB y 1.000 registros</span
              >
            </div>
            <div v-else class="import-paste">
              <label for="import-paste"
                >Copia las celdas, incluida la fila de encabezados</label
              ><textarea
                id="import-paste"
                v-model="text"
                rows="8"
                :disabled="busy"
                placeholder="Pega aquí los datos de tu hoja de cálculo…"
              /><ButtonCore
                class="!w-auto"
                label="Revisar datos"
                :loading="reading"
                :disabled="!text.trim() || busy"
                @click="read()"
              />
            </div>
          </div>
          <aside class="import-guide">
            <span class="import-guide-label">ANTES DE EMPEZAR</span>
            <h3>Un archivo listo,<br />menos correcciones.</h3>
            <ol>
              <li>
                <span>01</span>
                <div>
                  <b>Usa la plantilla</b>
                  <p>
                    Conserva los nombres de las columnas y coloca una persona
                    por fila.
                  </p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <b>Revisa documentos y correos</b>
                  <p>
                    No deben repetirse. Guarda los documentos como texto para
                    conservar los ceros.
                  </p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <b>Nos encargamos de las cuentas</b>
                  <p>
                    Al terminar podrás descargar las contraseñas temporales en
                    el reporte.
                  </p>
                </div>
              </li>
            </ol>
            <p class="import-guide-foot">
              Hasta {{ number(IMPORT_LIMITS.rows) }} registros por archivo. En
              XLSX se lee la primera hoja.
            </p>
          </aside>
        </div>
        <details class="import-columns">
          <summary>
            <span class="import-columns-title"
              >Ver columnas de la plantilla</span
            >
            <span class="import-columns-count"
              >{{ columns.length }} columnas</span
            >
            <ChevronRightIcon class="import-columns-chevron size-4" />
          </summary>
          <div class="import-columns-grid">
            <p
              v-for="column in columns"
              :key="column.key"
              class="import-column"
              :class="{ required: column.required }"
            >
              <span class="import-column-head">
                <b>{{ column.label }}</b>
                <em>{{ column.required ? "Obligatorio" : "Opcional" }}</em>
              </span>
              <small>{{ column.example || "—" }}</small>
            </p>
          </div>
        </details>
      </template>
      <template v-else>
        <div v-if="step === 2" class="import-file-row">
          <span class="import-file-icon"
            ><DocumentTextIcon class="size-5"
          /></span>
          <div class="min-w-0 flex-1">
            <b class="block truncate">{{ filename }}</b
            ><span>{{ number(summary?.total ?? 0) }} registros revisados</span>
          </div>
          <button class="import-text-button" :disabled="busy" @click="reset">
            Cambiar archivo
          </button>
        </div>
        <div v-if="step === 3" class="import-progress-block" aria-live="polite">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h3>{{ statusText }}</h3>
            <span class="font-mono text-adm-sm"
              >{{ number(processed) }} / {{ number(validCount) }}</span
            >
          </div>
          <div
            class="import-progress"
            role="progressbar"
            :aria-valuenow="progress"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Avance de la importación"
          >
            <span :style="{ width: `${progress}%` }" />
          </div>
          <p v-if="phase === 'sending'">
            Mantén esta pantalla abierta hasta terminar. Las contraseñas
            temporales solo se conservan mientras no la cierres.
          </p>
          <p v-else-if="phase === 'paused'">
            Las cuentas ya creadas están guardadas. Puedes continuar con las
            filas pendientes.
          </p>
          <p v-else>
            Descarga el reporte ahora: las contraseñas temporales no se guardan
            y se pierden al salir de esta pantalla.
          </p>
        </div>
        <div class="import-stats">
          <div>
            <span>{{
              step === 2 ? "REGISTROS EN EL ARCHIVO" : "REGISTROS POR IMPORTAR"
            }}</span
            ><b>{{
              number(step === 2 ? (summary?.total ?? 0) : validCount)
            }}</b>
          </div>
          <div class="positive">
            <span>{{
              step === 2 ? "LISTOS PARA IMPORTAR" : "CUENTAS CREADAS"
            }}</span
            ><b>{{ number(step === 2 ? validCount : created) }}</b>
          </div>
          <div :class="{ negative: step === 2 ? summary?.invalid : failed }">
            <span>{{
              step === 2 ? "REQUIEREN REVISIÓN" : "NO SE PUDIERON CREAR"
            }}</span
            ><b>{{ number(step === 2 ? (summary?.invalid ?? 0) : failed) }}</b>
          </div>
        </div>
        <div v-if="step === 2 && summary?.invalid" class="import-notice">
          <ExclamationTriangleIcon class="size-4 shrink-0" /><span
            >Importaremos solo los {{ number(validCount) }} registros válidos.
            Descarga las observaciones para corregir los demás.</span
          ><button
            class="import-text-button shrink-0"
            :disabled="downloading"
            @click="report(true)"
          >
            Descargar observaciones
          </button>
        </div>
        <div class="import-table-panel">
          <div class="import-table-toolbar">
            <h3>{{ step === 2 ? "Vista previa" : "Detalle de resultados" }}</h3>
            <div
              class="import-filters"
              role="group"
              aria-label="Filtrar registros"
            >
              <button
                :class="{ selected: filter === 'all' }"
                :disabled="busy"
                @click="changePage(0, 'all')"
              >
                Todos</button
              ><button
                v-if="step === 2"
                :class="{ selected: filter === 'valid' }"
                :disabled="busy"
                @click="changePage(0, 'valid')"
              >
                Listos</button
              ><button
                :class="{ selected: filter === 'invalid' }"
                :disabled="busy"
                @click="changePage(0, 'invalid')"
              >
                Con errores
              </button>
            </div>
          </div>
          <div class="import-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>FILA</th>
                  <th>PERSONA</th>
                  <th>CORREO</th>
                  <th>ESTADO</th>
                  <th>OBSERVACIONES</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in rows" :key="row.n">
                  <td class="font-mono text-secondary-400">
                    {{ number(row.n) }}
                  </td>
                  <td>
                    <b>{{ row.raw.first_name }} {{ row.raw.last_name }}</b>
                  </td>
                  <td>{{ row.raw.email }}</td>
                  <td>
                    <span class="import-badge" :class="row.status"
                      ><span />{{ statusLabel(row) }}</span
                    >
                  </td>
                  <td class="import-detail">
                    {{
                      row.detail ||
                      (step === 2
                        ? "Datos completos y sin duplicados en el archivo."
                        : "En espera de procesamiento.")
                    }}
                  </td>
                </tr>
                <tr v-if="!rows.length">
                  <td colspan="5" class="import-empty">
                    No hay registros en este filtro.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="import-pagination">
            <span
              >{{
                visibleTotal ? number(page * IMPORT_LIMITS.pageSize + 1) : 0
              }}–{{
                number(
                  Math.min((page + 1) * IMPORT_LIMITS.pageSize, visibleTotal),
                )
              }}
              de {{ number(visibleTotal) }} registros</span
            >
            <div>
              <button
                aria-label="Página anterior"
                :disabled="page === 0 || busy"
                @click="changePage(page - 1)"
              >
                <ChevronLeftIcon class="size-4" /></button
              ><span>{{ page + 1 }} / {{ number(pages) }}</span
              ><button
                aria-label="Página siguiente"
                :disabled="page + 1 >= pages || busy"
                @click="changePage(page + 1)"
              >
                <ChevronRightIcon class="size-4" />
              </button>
            </div>
          </div>
        </div>
        <p v-if="step === 2" class="import-fine-print">
          La revisión comprueba el archivo. Los correos y documentos ya
          registrados se verifican al crear cada cuenta.
        </p>
      </template>
    </div>
    <footer class="import-footer">
      <ButtonCore
        as="RouterLink"
        :to="{ name: redirect }"
        class="!w-auto"
        severity="secondary"
        outlined
        :label="step === 3 ? 'Volver al listado' : 'Cancelar'"
        :disabled="sending"
      /><span v-if="step === 2" class="import-footer-note"
        >{{ number(validCount) }} {{ entity }} listos para crear</span
      >
      <div class="flex flex-wrap items-center gap-2.5">
        <ButtonCore
          v-if="step === 2"
          class="!w-auto"
          :label="`Importar ${number(validCount)} ${entity}`"
          :disabled="!validCount || busy"
          :loading="sending"
          @click="start"
        /><ButtonCore
          v-if="step === 3"
          class="!w-auto"
          severity="secondary"
          outlined
          label="Descargar reporte"
          :loading="downloading"
          @click="report()"
        /><ButtonCore
          v-if="phase === 'paused'"
          class="!w-auto"
          label="Continuar importación"
          :loading="sending"
          @click="start"
        /><ButtonCore
          v-if="phase === 'done'"
          class="!w-auto"
          label="Nueva importación"
          @click="reset"
        />
      </div>
    </footer>
    <input
      ref="input"
      type="file"
      accept=".xlsx,.csv,.tsv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
      class="sr-only"
      aria-label="Archivo de importación"
      :disabled="busy"
      @change="onFile"
    />
  </section>
</template>

<style scoped>
.import-panel {
  background: var(--color-surface-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-adm-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  min-width: 0;
  color: var(--color-secondary-900);
  font-family: var(--font-body);
}
.import-header {
  padding: 20px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid var(--color-line-soft);
}
.import-eyebrow,
.import-guide-label {
  font: 500 10px var(--font-mono);
  letter-spacing: 0.08em;
  color: var(--color-secondary-400);
  margin-bottom: 8px;
}
.import-header h2 {
  font: 700 22px/1.2 var(--font-display);
  letter-spacing: -0.015em;
}
.import-description {
  font-size: 13px;
  color: var(--color-secondary-500);
  margin-top: 8px;
}
.import-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 18px 28px;
  gap: 20px;
  border-bottom: 1px solid var(--color-line-soft);
  background: var(--color-admin-bg);
}
.import-steps li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-secondary-400);
}
.step-number {
  height: 26px;
  width: 26px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  display: flex;
  align-items: center;
  justify-content: center;
  font: 11px var(--font-mono);
  flex-shrink: 0;
  background: var(--color-surface-paper);
}
.import-steps .current {
  color: var(--color-secondary-900);
}
.current .step-number {
  color: var(--color-surface-paper);
  background: var(--color-primary-500);
  border-color: var(--color-primary-500);
}
.done .step-number {
  background: var(--color-success-soft);
  color: var(--color-success-deep);
  border-color: var(--color-success-line);
}
.import-body {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.import-upload-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(240px, 1fr);
  gap: 32px;
}
.import-mode,
.import-filters {
  display: inline-flex;
  gap: 3px;
  padding: 3px;
  background: var(--color-admin-bg);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  margin-bottom: 18px;
}
.import-mode button,
.import-filters button {
  padding: 8px 18px;
  border-radius: var(--radius-pill);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-secondary-400);
  cursor: pointer;
}
.import-mode .selected,
.import-filters .selected {
  background: var(--color-surface-paper);
  color: var(--color-secondary-900);
  box-shadow: var(--shadow-sm);
}
.import-drop {
  border: 1.5px dashed var(--color-line);
  border-radius: var(--radius-adm-md);
  min-height: 295px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 20px;
  gap: 12px;
  text-align: center;
  transition:
    background 0.15s,
    border-color 0.15s;
}
.import-drop.dragging {
  border-color: var(--color-primary-500);
  background: var(--color-accent-soft);
}
.import-drop.reading {
  background: var(--color-admin-bg);
}
.import-upload-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-adm-lg);
  background: var(--color-accent-soft);
  color: var(--color-primary-500);
  margin-bottom: 4px;
}
.import-drop h3 {
  font: 700 19px var(--font-display);
}
.import-drop p {
  font-size: 13px;
  color: var(--color-secondary-500);
  margin-top: -6px;
}
.import-drop :deep(.p-button) {
  margin-top: 8px;
}
.import-file-help {
  font-size: 11px;
  color: var(--color-secondary-400);
  margin-top: 4px;
}
.import-guide {
  padding: 26px;
  border-radius: var(--radius-adm-md);
  background: var(--color-admin-bg);
  border: 1px solid var(--color-line-soft);
}
.import-guide h3 {
  font: 700 23px/1.15 var(--font-display);
  letter-spacing: -0.02em;
  margin: 10px 0 24px;
}
.import-guide ol {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.import-guide li {
  display: flex;
  gap: 12px;
}
.import-guide li > span {
  font: 11px var(--font-mono);
  color: var(--color-primary-500);
  padding-top: 2px;
}
.import-guide b {
  font-size: 13px;
  font-weight: 600;
}
.import-guide p {
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-secondary-500);
  margin-top: 4px;
}
.import-guide .import-guide-foot {
  padding-top: 18px;
  border-top: 1px solid var(--color-line);
  margin-top: 22px;
  font-size: 11px;
}
.import-paste {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}
.import-paste label {
  font-size: 13px;
  font-weight: 600;
}
.import-paste textarea {
  width: 100%;
  border: 1.5px solid var(--color-line);
  border-radius: var(--radius-adm-sm);
  padding: 12px 14px;
  font: 12px/1.7 var(--font-mono);
  resize: vertical;
  min-height: 220px;
  outline: none;
}
.import-paste textarea:focus {
  border-color: var(--color-primary-500);
}
.import-columns {
  border: 1px solid var(--color-line-soft);
  border-radius: var(--radius-adm-md);
  background: var(--color-surface-paper);
}
.import-columns summary {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  cursor: pointer;
  list-style: none;
  border-radius: var(--radius-adm-md);
}
.import-columns summary::-webkit-details-marker {
  display: none;
}
.import-columns summary:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: -2px;
}
.import-columns-title {
  font-size: 13px;
  font-weight: 600;
}
.import-columns-count {
  margin-left: auto;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-secondary-500);
  background: var(--color-admin-bg);
  border: 1px solid var(--color-line-soft);
  border-radius: 999px;
  padding: 2px 9px;
}
.import-columns-chevron {
  order: -1;
  color: var(--color-secondary-400);
  transition: transform 0.15s ease;
}
.import-columns[open] .import-columns-chevron {
  transform: rotate(90deg);
}
.import-columns[open] summary {
  border-bottom: 1px solid var(--color-line-soft);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.import-columns-grid {
  padding: 16px 18px 18px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.import-column {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding: 10px 12px;
  background: var(--color-admin-bg);
  border: 1px solid var(--color-line-soft);
  border-left: 3px solid var(--color-line-soft);
  border-radius: var(--radius-adm-sm);
}
.import-column.required {
  border-left-color: var(--color-primary-500);
}
.import-column-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.import-column b {
  font-size: 12px;
  font-weight: 600;
}
.import-column em {
  flex-shrink: 0;
  font-style: normal;
  font-size: 10px;
  font-weight: 500;
  color: var(--color-secondary-400);
}
.import-column.required em {
  color: var(--color-primary-600);
}
.import-column small {
  font: 11px/1.4 var(--font-mono);
  color: var(--color-secondary-500);
  overflow-wrap: anywhere;
}
.import-file-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: var(--color-admin-bg);
  border: 1px solid var(--color-line-soft);
  border-radius: var(--radius-adm-md);
}
.import-file-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-adm-sm);
  color: var(--color-primary-500);
  flex-shrink: 0;
}
.import-file-row b {
  font-size: 13px;
  font-weight: 600;
}
.import-file-row div > span {
  font-size: 12px;
  color: var(--color-secondary-500);
}
.import-text-button {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary-600);
  cursor: pointer;
}
.import-text-button:hover {
  text-decoration: underline;
}
.import-text-button:disabled {
  opacity: 0.5;
  cursor: default;
}
.import-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: 1px solid var(--color-line);
  border-radius: var(--radius-adm-md);
  overflow: hidden;
}
.import-stats > div {
  padding: 20px 24px;
}
.import-stats > div + div {
  border-left: 1px solid var(--color-line-soft);
}
.import-stats span {
  display: block;
  font: 10px var(--font-mono);
  letter-spacing: 0.04em;
  color: var(--color-secondary-500);
}
.import-stats b {
  display: block;
  margin-top: 10px;
  font: 700 32px/1 var(--font-display);
  letter-spacing: -0.03em;
}
.import-stats .positive b {
  color: var(--color-success-deep);
}
.import-stats .negative b {
  color: var(--color-danger-DEFAULT);
}
.import-notice {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid var(--color-amber-line);
  border-radius: var(--radius-adm-sm);
  color: var(--color-amber-deep);
  background: var(--color-amber-soft);
  font-size: 12px;
  line-height: 1.6;
}
.import-notice > span {
  flex: 1;
  min-width: 160px;
}
.import-notice.error {
  background: var(--color-danger-soft);
  border-color: var(--color-danger-DEFAULT);
  color: var(--color-danger-DEFAULT);
}
.import-progress-block h3 {
  font: 700 20px var(--font-display);
}
.import-progress-block p {
  font-size: 13px;
  color: var(--color-secondary-500);
  line-height: 1.6;
}
.import-progress {
  height: 8px;
  border-radius: var(--radius-pill);
  background: var(--color-admin-pane);
  overflow: hidden;
  margin: 16px 0 12px;
}
.import-progress > span {
  height: 100%;
  display: block;
  background: var(--color-primary-500);
  border-radius: inherit;
  transition: width 0.3s;
}
.import-table-panel {
  border: 1px solid var(--color-line);
  border-radius: var(--radius-adm-md);
  overflow: hidden;
  min-width: 0;
}
.import-table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px 18px;
  border-bottom: 1px solid var(--color-line-soft);
}
.import-table-toolbar h3 {
  font: 700 16px var(--font-display);
}
.import-filters {
  margin: 0;
}
.import-filters button {
  font-size: 11px;
  padding: 6px 12px;
}
.import-table-scroll {
  overflow-x: auto;
}
.import-table-scroll table {
  width: 100%;
  min-width: 780px;
  text-align: left;
  border-collapse: collapse;
  font-size: 12px;
}
.import-table-scroll th {
  background: var(--color-admin-bg);
  font: 10px var(--font-mono);
  letter-spacing: 0.04em;
  color: var(--color-secondary-500);
  padding: 13px 16px;
  white-space: nowrap;
}
.import-table-scroll td {
  padding: 14px 16px;
  border-top: 1px solid var(--color-line-soft);
  vertical-align: top;
  color: var(--color-secondary-500);
}
.import-table-scroll td b {
  font-weight: 600;
  color: var(--color-secondary-900);
}
.import-table-scroll tbody tr:hover {
  background: var(--color-admin-row-hover);
}
.import-detail {
  min-width: 250px;
  max-width: 400px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.import-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: var(--radius-pill);
  padding: 4px 9px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  background: var(--color-info-soft);
  color: var(--color-info-deep);
}
.import-badge > span {
  width: 5px;
  height: 5px;
  border-radius: var(--radius-pill);
  background: currentColor;
}
.import-badge.ok {
  background: var(--color-success-soft);
  color: var(--color-success-deep);
}
.import-badge.invalid,
.import-badge.failed {
  background: var(--color-danger-soft);
  color: var(--color-danger-DEFAULT);
}
.import-empty {
  text-align: center;
  padding: 30px !important;
}
.import-pagination {
  padding: 16px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  border-top: 1px solid var(--color-line-soft);
  font-size: 12px;
  color: var(--color-secondary-400);
}
.import-pagination > div {
  display: flex;
  align-items: center;
  gap: 12px;
}
.import-pagination button {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-line-soft);
  border-radius: var(--radius-adm-sm);
  background: var(--color-admin-bg);
  color: var(--color-secondary-500);
  cursor: pointer;
}
.import-pagination button:disabled {
  opacity: 0.35;
  cursor: default;
}
.import-fine-print {
  font-size: 11px;
  line-height: 1.6;
  color: var(--color-secondary-400);
}
.import-footer {
  padding: 18px 28px;
  border-top: 1px solid var(--color-line-soft);
  background: var(--color-admin-bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.import-footer-note {
  margin-left: auto;
  font-size: 12px;
  color: var(--color-secondary-500);
}
.import-panel button:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 3px;
}
@media (max-width: 767px) {
  .import-header {
    align-items: flex-start;
    flex-direction: column;
    padding: 20px;
  }
  .import-steps {
    padding: 16px 20px;
    gap: 10px;
  }
  .import-steps li {
    gap: 7px;
    font-size: 10px;
    align-items: flex-start;
  }
  .step-number {
    width: 23px;
    height: 23px;
  }
  .import-body {
    padding: 20px;
    gap: 20px;
  }
  .import-upload-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }
  .import-guide {
    padding: 22px;
  }
  .import-guide h3 br {
    display: none;
  }
  .import-columns-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .import-stats > div {
    padding: 16px 12px;
  }
  .import-stats span {
    font-size: 8px;
    line-height: 1.6;
  }
  .import-stats b {
    font-size: 26px;
  }
  .import-file-row {
    flex-wrap: wrap;
  }
  .import-footer {
    padding: 18px 20px;
    gap: 12px;
  }
  .import-footer-note {
    display: none;
  }
  .import-footer > div {
    width: 100%;
  }
  .import-footer > div :deep(.p-button) {
    flex: 1;
  }
  .import-table-toolbar {
    gap: 12px;
  }
  .import-drop {
    min-height: 275px;
  }
}
</style>
