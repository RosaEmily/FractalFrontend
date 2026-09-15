<script setup lang="ts" generic="T">
import ImageCore from "@/shared/components/core/image/index.vue";
import TagCore from "@/shared/components/core/tag/index.vue";
import Filter from "./filters.vue";
import ArrayComponent from "./type/array.vue";

import ColumnActions from "./type/actions.vue";

import { formatValue, formatUrlValue } from "../utils/format";
import type { GridUiColumnProps } from "../type";
import { STATUS } from "../constants";
import Column from "primevue/column";
import { computed } from "vue";

const props = withDefaults(defineProps<{ col: GridUiColumnProps<T> }>(), {});

/**
 * Las clases van literales, no interpoladas: Tailwind escanea el código
 * fuente y no detecta nombres construidos en runtime.
 */
const FIT_CLASS = {
  contain: "object-contain",
  cover: "object-cover",
} as const;

const imageClass = computed(() => {
  const image = props.col.image;
  const fit = FIT_CLASS[image?.fit ?? "contain"];
  const size = image?.class ?? "h-10 w-auto max-w-40";
  return `${fit} rounded ${size}`;
});

const col = computed(() => ({
  ...props.col,
  showAddButton: false,
  showFilterOperator: false,
}));
</script>

<template>
  <Column
    v-bind="col"
    :key="col.field"
    :field="String(col.field)"
    :header-class="`uppercase ${
      col.field === 'actions' ? '!text-right' : '!text-left'
    } ${col.headerClass || ''}`"
  >
    <template #body="{ data }">
      <!--
        El diseño alinea el contenido a la izquierda salvo la columna de
        acciones; `col.class` permite ajustarlo por columna.
      -->
      <div
        class="flex items-center"
        :class="[
          col.field === 'actions'
            ? 'justify-end text-right'
            : 'justify-start text-left',
          col.class,
        ]"
      >
        <slot name="cell" :row="data" :col="col" :value="data[col.field]">
          <template v-if="col.field == 'actions' && col.actions?.length">
            <ColumnActions :col="col" :data="data" />
          </template>
          <template v-else>
            <!-- Imagen -->
            <!--
              ImageCore expone `src` e `imageClass`; `img`/`baseClasses` no
              son props suyas y v-bind las descartaba, dejando la celda vacía.
              Por defecto se usa object-contain con alto fijo y ancho libre:
              `cover` en un cuadrado recorta los banners panorámicos.
            -->
            <ImageCore
              v-if="col.type === 'image' && data[col.field]"
              :src="String(data[col.field])"
              :image-class="imageClass"
              preview
            />

            <span
              v-else-if="col.type === 'image'"
              class="text-secondary-400"
            >
              —
            </span>

            <!-- Status -->
            <template v-else-if="col.type === 'state'">
              <TagCore
                v-if="STATUS[data[col.field]]"
                v-bind="STATUS[data[col.field]]"
              />
            </template>

            <!-- URL -->
            <a
              v-else-if="col.type === 'url'"
              :href="String(formatUrlValue(col, data).href ?? '')"
              :target="col.url?.target ?? '_self'"
              class="underline font-semibold"
            >
              {{ formatUrlValue(col, data).text }}
            </a>

            <!-- Custom -->
            <component
              v-else-if="col.type === 'custom'"
              :is="col.render?.(data)"
            />

            <!-- Array -->
            <ArrayComponent
              v-else-if="Array.isArray(data[col.field])"
              :items="data[col.field]"
              :display-separator="col.displaySeparator"
              :key-separator="col.keySeparator"
              :key-to-render="col.keyToRender"
              :max-visible="col.maxVisible"
              :tone="col.chipTone"
              :numbered="col.chipNumbered"
            />

            <!-- Generales (text, number, currency, date, datetime) -->
            <span v-else>
              {{ formatValue(col, data) }}
            </span>
          </template>
        </slot>
      </div>
    </template>
    <template v-if="col.showFilterMenu" #filter="{ filterModel }">
      <Filter v-model="filterModel.value" :config="col.filterConfig" />
    </template>
  </Column>
</template>
