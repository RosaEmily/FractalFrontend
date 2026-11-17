<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { InputText, Select } from "primevue";
import LabelCore from "../../label/index.vue";
import MessageCore from "../../message/index.vue";
import { PHONE_COUNTRIES, formatNational, splitE164 } from "./countries";
import type { InputPhoneCoreProps } from "./type";

const props = withDefaults(defineProps<InputPhoneCoreProps>(), {
  countries: () => PHONE_COUNTRIES,
  placeholder: "987 654 321",
});

/** Número en formato E.164 (+51987654321) o null si está vacío. */
const model = defineModel<string | null>({ default: null });

const emit = defineEmits<{ blur: [] }>();

const iso = ref<string>(props.countries[0]?.iso ?? PHONE_COUNTRIES[0]!.iso);
const national = ref("");
const input = ref<{ $el: HTMLInputElement } | null>(null);

const country = computed(
  () =>
    props.countries.find((c) => c.iso === iso.value) ??
    props.countries[0] ??
    PHONE_COUNTRIES[0]!,
);

function format(digits: string) {
  return formatNational(country.value, digits);
}

/** Lee el valor que llega de afuera (carga inicial, reset). */
watch(
  model,
  (value) => {
    if (!value) {
      if (national.value) national.value = "";
      return;
    }
    // Valores previos al selector de país: 9 dígitos sin prefijo.
    const legacy = /^\d{9}$/.test(value);
    if (legacy) {
      national.value = format(value);
      emitValue();
      return;
    }
    const parsed = splitE164(value);
    if (parsed && props.countries.some((c) => c.iso === parsed.country.iso)) {
      iso.value = parsed.country.iso;
      national.value = formatNational(parsed.country, parsed.national);
      return;
    }
    national.value = value;
  },
  { immediate: true },
);

function emitValue() {
  const digits = national.value.replace(/\D/g, "");
  const next = digits ? `+${country.value.dial}${digits}` : null;
  if (next !== model.value) model.value = next;
}

function onInput(value: string | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");
  national.value = format(digits);
  emitValue();

  // Si el recorte deja el mismo texto que ya había, Vue no repinta y el input
  // conservaría los dígitos de más: se fuerza el valor ya formateado.
  nextTick(() => {
    const el = input.value?.$el;
    if (el && el.value !== national.value) el.value = national.value;
  });
}

function onCountry() {
  national.value = format(national.value.replace(/\D/g, ""));
  emitValue();
}
</script>

<template>
  <div>
    <LabelCore
      v-if="label"
      :text="label"
      :html-for="name"
      :required="required"
      :hint="hintLabel"
    />
    <div class="flex">
      <Select
        v-model="iso"
        :options="countries"
        option-label="name"
        option-value="iso"
        size="small"
        :disabled="disabled"
        :invalid="invalid"
        :pt="{ root: { class: 'phone-core__select !rounded-r-none shrink-0' } }"
        aria-label="País"
        @update:model-value="onCountry"
      >
        <template #value>
          <span class="flex items-center gap-2">
            <img :src="country.flag" :alt="country.name" class="h-3.5 w-5 rounded-[2px] object-cover" />
            <span class="font-mono text-sm">+{{ country.dial }}</span>
          </span>
        </template>
        <template #option="{ option }">
          <span class="flex items-center gap-2">
            <img :src="option.flag" :alt="option.name" class="h-3.5 w-5 rounded-[2px] object-cover" />
            <span>{{ option.name }}</span>
            <span class="ml-auto font-mono text-xs text-secondary-500">
              +{{ option.dial }}
            </span>
          </span>
        </template>
      </Select>
      <InputText
        :id="name"
        ref="input"
        :name="name"
        :model-value="national"
        :placeholder="placeholder"
        :disabled="disabled"
        :invalid="invalid"
        size="small"
        inputmode="tel"
        autocomplete="tel-national"
        class="phone-core__input w-full !rounded-l-none"
        @update:model-value="onInput"
        @blur="emit('blur')"
      />
    </div>
    <MessageCore
      v-if="messageError"
      :text="messageError"
      severity="error"
      variant="simple"
    />
  </div>
</template>
