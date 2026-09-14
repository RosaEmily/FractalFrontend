<script setup lang="ts">
/**
 * Detalle de un log.
 *
 * La fila de la tabla ya dice qué pasó y cuándo; lo que falta para diagnosticar
 * es el origen (archivo:línea), el contexto y el stack. Van en un diálogo y no
 * en una pantalla aparte porque se leen sin salir de la bitácora, comparando
 * varias entradas seguidas.
 */
import { ModalCore } from "@/shared/components";
import LevelCell from "./level-cell.vue";
import type { LogDetail } from "../models/log.model";

const props = defineProps<{ log: LogDetail | null; loading?: boolean }>();
const visible = defineModel<boolean>({ default: false });

/** Filas cortas: solo las que el log realmente trae. */
const fields = (log: LogDetail) =>
  [
    { label: "Fecha", value: log.createdAt },
    { label: "Usuario", value: log.userName },
    { label: "Acción", value: log.action },
    { label: "Entidad", value: log.entity },
    {
      label: "Endpoint",
      value: log.httpMethod
        ? `${log.httpMethod} ${log.endpoint ?? ""}`.trim()
        : log.endpoint,
    },
    { label: "IP", value: log.ipAddress },
    { label: "Origen", value: log.origin },
    { label: "Navegador", value: log.userAgent },
  ].filter((field) => !!field.value);
</script>

<template>
  <ModalCore
    v-model="visible"
    header="Detalle del registro"
    modal
    dismissable-mask
    :style="{ width: '40rem', maxWidth: '95vw' }"
  >
    <!-- Sin datos aún: no se muestra un vacío mientras carga. -->
    <p v-if="loading" class="text-adm-sm text-secondary-400">Cargando…</p>

    <div v-else-if="props.log" class="flex flex-col gap-5">
      <div class="flex flex-wrap items-start gap-3">
        <LevelCell :row="props.log" />
        <p class="flex-1 text-adm-md text-secondary-900">
          {{ props.log.message }}
        </p>
      </div>

      <dl class="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <div v-for="field in fields(props.log)" :key="field.label">
          <dt
            class="font-mono text-adm-xs uppercase tracking-wide text-secondary-400"
          >
            {{ field.label }}
          </dt>
          <dd class="mt-0.5 break-words text-adm-sm text-secondary-900">
            {{ field.value }}
          </dd>
        </div>
      </dl>

      <div v-if="props.log.details">
        <p
          class="mb-1 font-mono text-adm-xs uppercase tracking-wide text-secondary-400"
        >
          Detalles
        </p>
        <p class="text-adm-sm whitespace-pre-wrap text-secondary-900">
          {{ props.log.details }}
        </p>
      </div>

      <!--
        Contexto y stack se ENVUELVEN, no scrollean (`admin/sistema.jsx`):
        `whitespace-pre-wrap` + `break-words`, sin `max-height` ni `overflow`.

        ⚠️ Antes eran bloques con `max-h-*` + `overflow-auto`. Eso metía scroll
        HORIZONTAL en el stack y, como su alto fijo se comía el del diálogo,
        quedaba recortado a ~69px visibles: había que scrollear el modal Y
        luego el bloque. Un solo scroll vertical, el del diálogo (`85vh` en el
        diseño, `90%` que PrimeVue ya trae), es todo lo que hace falta.

        ⚠️ Las clases de este archivo estuvieron sin generar mucho tiempo:
        `.gitignore` decía `logs` sin barra e ignoraba el módulo entero, y
        Tailwind v4 respeta `.gitignore` al escanear. Si una clase "no aplica"
        aquí, verificar `git check-ignore -v` ANTES de tocar el CSS.
      -->
      <div v-if="props.log.context">
        <p
          class="mb-1 font-mono text-adm-xs uppercase tracking-wide text-secondary-400"
        >
          Contexto
        </p>
        <p
          class="rounded-adm-md bg-admin-pane p-3 font-mono text-adm-xs break-words whitespace-pre-wrap text-secondary-800"
        >
          {{ props.log.context }}
        </p>
      </div>

      <!-- El stack va en rojo sobre `badSoft`, como en el diseño. -->
      <div v-if="props.log.stackTrace">
        <p
          class="mb-1 font-mono text-adm-xs uppercase tracking-wide text-secondary-400"
        >
          Stack trace
        </p>
        <p
          class="rounded-adm-md bg-danger-soft p-3 font-mono text-adm-xs leading-relaxed break-words whitespace-pre-wrap text-danger-DEFAULT"
        >
          {{ props.log.stackTrace }}
        </p>
      </div>
    </div>

    <p v-else class="text-adm-sm text-secondary-400">
      No se pudo cargar el registro.
    </p>
  </ModalCore>
</template>
