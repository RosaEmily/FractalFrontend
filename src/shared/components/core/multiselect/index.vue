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

const optionsData = ref<unknown[]>(propsInit.options || []);
const loading = ref<boolean>(false);

const props = computed(() => ({
  ...propsInit,
  options: optionsData.value,
  loading: loading.value,
  size: "small",
}));

onMounted(async () => {
  if (propsInit.autoLoad && propsInit.service) {
    loading.value = true;
    optionsData.value = [];
    try {
      const data = await propsInit.service();
      optionsData.value = data;
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
    <LabelCore v-if="props.label" :text="props.label" :html-for="props.name" />
    <MultiSelect class="w-full" v-bind="props" v-model="model" />
    <MessageCore
      v-if="messageError"
      :text="messageError"
      severity="error"
      variant="simple"
    />
  </div>
</template>
