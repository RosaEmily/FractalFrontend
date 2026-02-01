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
    :header-class="`uppercase !text-center ${col.headerClass || ''}`"
  >
    <template #body="{ data }">
      <div
        class="flex items-center justify-center text-center"
        :class="col.class"
      >
        <slot name="cell" :row="data" :col="col" :value="data[col.field]">
          <template v-if="col.field == 'actions' && col.actions?.length">
            <ColumnActions :col="col" :data="data" />
          </template>
          <template v-else>
            <!-- Imagen -->
            <ImageCore
              v-if="col.type === 'image'"
              class="flex items-center justify-center"
              :img="{
                src: String(data[col.field] ?? ''),
              }"
              base-classes="object-cover rounded size-10 object-cover"
            />

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
