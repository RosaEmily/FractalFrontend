<script setup lang="ts">
import MultiSelect from "primevue/multiselect";
import type { MultiSelectCoreProps } from "./type";
import LabelCore from "../label/index.vue";
import MessageCore from "../message/index.vue";
import { computed, onMounted, ref } from "vue";

const propsInit = withDefaults(defineProps<MultiSelectCoreProps>(), {
  size: "small",
});

const model = defineModel<string | null>({
  default: null,
});

/** Solo se usa cuando el componente carga las opciones por su cuenta. */
const serviceOptions = ref<unknown[]>([]);
const loading = ref<boolean>(false);

const usesService = computed(
  () => Boolean(propsInit.autoLoad && propsInit.service),
);

/**
 * Igual que en SelectCore: las opciones del padre llegan de una petición
 * asíncrona, así que se leen por computed en vez de copiarlas a un ref.
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
  if (usesService.value) {
    loading.value = true;
    serviceOptions.value = [];
    try {
      const data = await propsInit.service!();
      serviceOptions.value = data ?? [];
    } catch (error) {
      console.error("Error cargando opciones del servicio:", error);
    } finally {
      loading.value = false;
    }
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
    <MultiSelect class="w-full" v-bind="props" v-model="model" />
    <MessageCore
      v-if="messageError"
      :text="messageError"
      severity="error"
      variant="simple"
    />
  </div>
</template>
