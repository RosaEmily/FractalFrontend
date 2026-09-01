<script setup lang="ts">
import { Password } from "primevue";
import type { InputPasswordCoreProps } from "./type";
import LabelCore from "../../label/index.vue";
import MessageCore from "../../message/index.vue";
import HeroCore from "../../hero/index.vue";
import { mdiEyeOutline, mdiEyeOffOutline } from "@mdi/js";

const props = withDefaults(defineProps<InputPasswordCoreProps>(), {
  size: "small",
  // El cursor de los iconos ahora va en los slots de abajo, no aquí.
  pt: () => ({
    root: { class: "w-full" },
  }),
  inputClass: "w-full",
  toggleMask: true,
  feedback: false,
});

const model = defineModel<string | null>({
  default: null,
});
</script>
<template>
  <div>
    <LabelCore
      v-if="props.label"
      :text="props.label"
      :html-for="props.inputId"
      :required="props.required"
      :hint="props.hintLabel"
    />

    <!--
      Los iconos van por slot con @mdi/js: PrimeVue los renderiza con clases
      `pi pi-eye` y primeicons NO está instalado, así que por defecto el
      toggle queda invisible (no se ve que la contraseña cambió de estado).
      `maskicon` se muestra con el texto visible (sirve para ocultar) y
      `unmaskicon` al revés.

      ⚠️ Hay que conservar `p-password-toggle-mask-icon`: esa clase posiciona
      el icono (absolute + inset-inline-end) y, vía un selector `:has(...)`,
      es la que hace que el input reserve el padding derecho. Sin ella el ojo
      se dibuja fuera del campo.
    -->
    <Password v-trim v-bind="props" v-model="model">
      <template #maskicon="{ toggleCallback }">
        <HeroCore
          :path="mdiEyeOffOutline"
          class="p-password-toggle-mask-icon cursor-pointer text-secondary-500"
          @click="toggleCallback"
        />
      </template>
      <template #unmaskicon="{ toggleCallback }">
        <HeroCore
          :path="mdiEyeOutline"
          class="p-password-toggle-mask-icon cursor-pointer text-secondary-500"
          @click="toggleCallback"
        />
      </template>
    </Password>

    <MessageCore
      v-if="messageError"
      :text="messageError"
      severity="error"
      variant="simple"
    />
  </div>
</template>
