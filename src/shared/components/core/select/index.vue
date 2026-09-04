<script setup lang="ts">
import { Select } from "primevue";
import type { SelectCoreProps } from "./type";
import LabelCore from "../label/index.vue";
import MessageCore from "../message/index.vue";
import { computed, onMounted, ref } from "vue";

const propsInit = withDefaults(defineProps<SelectCoreProps>(), {
  size: "small",
});

// El `optionValue` suele ser un id numérico (monedas, cursos, docentes),
// no solo strings.
const model = defineModel<string | number | null>({
  default: null,
});

/** Solo se usa cuando el componente carga las opciones por su cuenta. */
const serviceOptions = ref<unknown[]>([]);
const loading = ref<boolean>(false);

const usesService = computed(
  () => Boolean(propsInit.autoLoad && propsInit.service),
);

/**
 * Las opciones del padre suelen llegar de una petición asíncrona, así que
 * cambian después del primer render: se leen por computed para reflejarlas
 * sin duplicar el estado en un ref.
 */
const optionsData = computed<unknown[]>(() =>
  usesService.value ? serviceOptions.value : (propsInit.options ?? []),
);

const props = computed(() => ({
  ...propsInit,
  options: optionsData.value,
  loading: loading.value,
  size: "small",
}));

onMounted(async () => {
  if (!usesService.value) return;

  loading.value = true;
  serviceOptions.value = [];
  try {
    serviceOptions.value = (await propsInit.service!()) ?? [];
  } catch (error) {
    console.error("Error cargando opciones del servicio:", error);
  } finally {
    loading.value = false;
  }
});
</script>
<template>
  <div>
    <LabelCore
      v-if="props.label"
      :text="props.label"
      :html-for="props.name"
      :required="props.required"
      :hint="props.hintLabel"
    />
    <Select class="w-full" v-bind="props" v-model="model" />
    <MessageCore
      v-if="messageError"
      :text="messageError"
      severity="error"
      variant="simple"
    />
  </div>
</template>
