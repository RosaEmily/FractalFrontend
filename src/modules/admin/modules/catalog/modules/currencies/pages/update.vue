<script setup lang="ts">
import { z } from "zod";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore, InputNumberCore, SelectCore } from "@/shared/components";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { DECIMAL_PLACES_LIMIT } from "@/modules/admin/constants/numeric-limits";
import CurrencyHint from "../components/currency-hint.vue";
import currencyService from "../services/currency.service";
import type { CurrencyBodyDTO } from "../dto/currency.dto";
import type { CurrencyCountry } from "../models/currency.model";

/**
 * El país manda: al elegirlo se completan código, símbolo, número ISO,
 * nombre y decimales. La API ya excluye del catálogo las monedas que
 * existen, para no chocar con las reglas `unique`.
 */
const route = useRoute();
const identifier = ref<string>(String(route.params.id));

const countries = ref<CurrencyCountry[]>([]);
const selectedKey = ref<string | null>(null);

const selected = computed(
  () => countries.value.find((c) => c.key === selectedKey.value) ?? null,
);

const initialValues = ref<CurrencyBodyDTO>({
  code: null,
  name: null,
  symbol: null,
  iso_number: null,
  decimal_places: null,
  country: null,
});

const formSchema = z.object({
  name: z
    .string({ message: "El nombre es obligatorio" })
    .min(3, { message: "Debe tener al menos 3 caracteres" })
    .max(100, { message: "No puede tener más de 100 caracteres" }),
  decimal_places: z
    .number({ message: "Los decimales son obligatorios" })
    .int()
    .min(DECIMAL_PLACES_LIMIT.min, { message: "No puede ser negativo" })
    .max(DECIMAL_PLACES_LIMIT.max, {
      message: `No puede ser mayor a ${DECIMAL_PLACES_LIMIT.max}`,
    }),
  // Se completan desde el país; el usuario no los escribe.
  code: z.string({ message: "Selecciona un país" }),
  symbol: z.string({ message: "Selecciona un país" }),
  iso_number: z.number({ message: "Selecciona un país" }),
  country: z.string({ message: "Selecciona un país" }),
});

/** Vuelca los datos del país elegido en los campos del formulario. */
const applyCountry = (
  fields: Partial<Record<string, { value: unknown }>>,
) => {
  const country = selected.value;
  if (!country) return;

  const values: Record<string, unknown> = {
    code: country.code,
    symbol: country.symbol,
    iso_number: country.isoNumber,
    country: country.country,
    name: country.name,
    decimal_places: country.decimalPlaces,
  };

  Object.entries(values).forEach(([key, value]) => {
    const field = fields[key];
    if (field) field.value = value;
  });
};

onMounted(async () => {
  const loadingStore = useLoadingStore();
  loadingStore.start();

  // `exclude` evita que la moneda en edición desaparezca del catálogo.
  const [current, list] = await Promise.all([
    currencyService.edit(identifier.value),
    currencyService.countries(identifier.value),
  ]);
  countries.value = list;
  loadingStore.finish();

  if (!current) return;

  initialValues.value = {
    code: current.code,
    name: current.name,
    symbol: current.symbol,
    iso_number: current.isoNumber,
    decimal_places: current.decimalPlaces,
    country: current.country,
  };

  // Se busca por país y no solo por código: hay monedas compartidas por
  // varios países (Ecuador y Estados Unidos usan USD) y por código se
  // preseleccionaría el primero de la lista, no el guardado.
  selectedKey.value =
    countries.value.find(
      (c) => c.country === current.country && c.code === current.code,
    )?.key ??
    countries.value.find((c) => c.code === current.code)?.key ??
    null;
});
</script>

<template>
  <CrudForm
    title="Actualizar moneda"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="currencies.list"
    :service="(body) => currencyService.update(identifier, body)"
    submit-label="Actualizar"
  >
    <template #default="{ fields, errors }">
      <div>
        <SelectCore
          v-model="selectedKey"
          label="País"
          :options="countries"
          option-label="country"
          option-value="key"
          placeholder="Selecciona un país"
          filter
          :invalid="!!errors.code"
          :message-error="errors.code"
          @update:model-value="applyCountry(fields)"
        />
        <span class="text-adm-sm text-secondary-400">
          Selecciona el país y el código, símbolo y número ISO se completan
          solos.
        </span>
      </div>

      <CurrencyHint :selected="selected" />

      <div class="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-4">
        <InputTextCore
          v-model="fields.name.value"
          label="Nombre de la moneda"
          :invalid="!!errors.name"
          :message-error="errors.name"
          messages-info="Se sugiere del país; puedes ajustarlo."
        />
        <InputNumberCore
          v-model="fields.decimal_places.value"
          label="Decimales"
          :min="DECIMAL_PLACES_LIMIT.min"
          :max="DECIMAL_PLACES_LIMIT.max"
          :invalid="!!errors.decimal_places"
          :message-error="errors.decimal_places"
          messages-info="JPY y CLP usan 0."
        />
      </div>
    </template>
  </CrudForm>
</template>
