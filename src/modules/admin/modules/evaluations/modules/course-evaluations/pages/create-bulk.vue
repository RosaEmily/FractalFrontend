<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { mdiClose, mdiRestore } from "@mdi/js";

import {
  SelectCore,
  InputTextCore,
  InputNumberCore,
  HeroCore,
} from "@/shared/components";
import BulkFormShell from "@/modules/admin/components/ui/bulk-form-shell.vue";
import BulkCourseCard from "@/modules/admin/components/ui/bulk-course-card.vue";
import ModeToggle from "@/modules/admin/components/ui/mode-toggle.vue";
import { WEIGHT_LIMIT } from "@/modules/admin/constants/numeric-limits";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import offerService from "@/modules/admin/modules/catalog/modules/offers/services/offer.service";
import type { Offer } from "@/modules/admin/modules/catalog/modules/offers/models/offer.model";
import evaluationTypeService from "../../evaluation-types/services/evaluation-type.service";
import courseEvaluationService from "../services/course-evaluation.service";

/**
 * Alta MASIVA del cuadro de evaluación: un programa, una tarjeta por curso y
 * dentro una fila fija por cada tipo de evaluación configurado.
 *
 * El tipo es una etiqueta fija (no un select): el cuadro se arma sobre los
 * tipos que ya existen, y elegirlos por fila permitiría repetir el mismo tipo.
 */
interface TypeRow {
  evaluationTypeId: number;
  typeName: string;
  name: string;
  weight: number | null;
  include: boolean;
}

interface CourseCard {
  offerCourseId: number;
  courseName: string;
  rows: TypeRow[];
}

/** Puntaje máximo del negocio; el diseño lo fija en 20 para todas. */
const MAX_SCORE = 20;
/** Los pesos de un curso deben sumar esto. La API lo impone. */
const TARGET_WEIGHT = 100;

const mode = defineModel<string>("mode", { required: true });

const MODE_OPTIONS = [
  { value: "individual", label: "Un curso" },
  { value: "bulk", label: "Varios cursos" },
];

const router = useRouter();
const toastStore = useToastStore();

const offerId = ref<number | null>(null);
const cards = ref<CourseCard[]>([]);
const loading = ref(false);
const saving = ref(false);

const loadOffers = async (): Promise<Offer[]> =>
  await offerService.all({ status: 1 });

const onOfferChange = async () => {
  cards.value = [];
  if (!offerId.value) return;

  loading.value = true;
  // Los cursos del programa y los tipos de evaluación son independientes: se
  // piden a la vez en vez de encadenarlos.
  const [offerRes, typesRes] = await Promise.all([
    safeRequest(() => offerService.edit(offerId.value as number), {
      showAlert: false,
    }),
    safeRequest(() => evaluationTypeService.all({ status: 1 }), {
      showAlert: false,
    }),
  ]);
  loading.value = false;

  const types = typesRes.data ?? [];

  cards.value = (offerRes.data?.courseItems ?? [])
    .filter((item) => !!item.id)
    .map((item) => ({
      offerCourseId: item.id as number,
      courseName: item.name,
      rows: types.map((type) => ({
        evaluationTypeId: type.id,
        typeName: type.name,
        name: "",
        weight: null,
        include: true,
      })),
    }));
};

const sumOf = (card: CourseCard): number =>
  card.rows
    .filter((r) => r.include)
    .reduce((acc, r) => acc + (Number(r.weight) || 0), 0);

/** Tono de la suma: gris por debajo, rojo por encima, verde en 100. */
const sumToneOf = (card: CourseCard): string => {
  const sum = sumOf(card);
  if (sum === TARGET_WEIGHT) return "text-success-DEFAULT";
  if (sum > TARGET_WEIGHT) return "text-danger-DEFAULT";
  return "text-secondary-400";
};

/** Solo cuentan las filas con nombre: una fila en blanco no es una evaluación. */
const filledRows = (card: CourseCard) =>
  card.rows.filter((r) => r.include && r.name.trim());

const total = computed(() =>
  cards.value.reduce((acc, card) => acc + filledRows(card).length, 0),
);

const submitLabel = computed(() =>
  total.value
    ? `Crear ${total.value} evaluación${total.value === 1 ? "" : "es"}`
    : "Crear evaluaciones",
);

const onSubmit = async () => {
  if (!total.value) return;

  /*
   * Se valida acá además del servidor para no gastar un viaje: la API rechaza
   * el lote entero si un curso no suma 100, y el mensaje señalaría un solo
   * curso. Acá se nombran todos los que fallan de una vez.
   */
  const wrong = cards.value
    .filter((card) => filledRows(card).length)
    .filter((card) => Math.abs(sumOf(card) - TARGET_WEIGHT) > 0.05);

  if (wrong.length) {
    toastStore.showToastError({
      summary: "Los pesos no suman 100%",
      detail: wrong.map((c) => `${c.courseName}: ${sumOf(c)}%`).join(" · "),
    });
    return;
  }

  const body = cards.value.flatMap((card) =>
    filledRows(card).map((row) => ({
      offer_course_id: card.offerCourseId,
      evaluation_type_id: row.evaluationTypeId,
      name: row.name.trim(),
      weight: Number(row.weight) || 0,
      max_score: MAX_SCORE,
    })),
  );

  saving.value = true;
  const { error } = await safeRequest(() =>
    courseEvaluationService.bulkSync(body),
  );
  saving.value = false;

  if (error) return;

  toastStore.showToastSuccess({
    summary: "Evaluaciones creadas",
    detail: `Se guardaron ${body.length} evaluación(es).`,
  });
  router.replace({ name: "courseEvaluations.list" });
};
</script>

<template>
  <BulkFormShell
    title="Crear evaluaciones en varios cursos"
    :submit-label="submitLabel"
    redirect="courseEvaluations.list"
    :loading="saving"
    :disabled="!total"
    @submit="onSubmit"
  >
    <ModeToggle v-model="mode" :options="MODE_OPTIONS" />

    <SelectCore
      v-model="offerId"
      label="Programa"
      required
      hint-label="Se listan sus cursos abajo, con una fila por tipo de evaluación."
      filter
      option-label="name"
      option-value="id"
      placeholder="Selecciona un programa"
      :service="loadOffers"
      auto-load
      @update:model-value="onOfferChange"
    />

    <p v-if="loading" class="text-sm text-secondary-400">
      Cargando los cursos del programa…
    </p>

    <div
      v-else-if="offerId && !cards.length"
      class="rounded-adm-sm border-[1.5px] border-dashed border-control-border px-3.5 py-5 text-center text-sm text-secondary-400"
    >
      Este programa todavía no tiene cursos configurados.
    </div>

    <div v-else-if="cards.length" class="flex flex-col gap-3">
      <BulkCourseCard
        v-for="card in cards"
        :key="card.offerCourseId"
        :title="card.courseName"
      >
        <template #action>
          <span
            class="font-mono text-[0.6875rem] font-bold"
            :class="sumToneOf(card)"
          >
            suma {{ sumOf(card) }}%{{
              sumOf(card) === TARGET_WEIGHT ? " ✓" : ""
            }}
          </span>
        </template>

        <div class="flex flex-col gap-2">
          <div
            v-for="row in card.rows"
            :key="row.evaluationTypeId"
            class="grid grid-cols-[110px_1fr_90px_32px] items-center gap-2 transition-opacity"
            :class="{ 'opacity-40': !row.include }"
          >
            <span class="text-xs font-semibold text-secondary-500">
              {{ row.typeName }}
            </span>
            <InputTextCore
              v-model="row.name"
              :disabled="!row.include"
              :placeholder="`Nombre, ej: ${row.typeName} Final`"
            />
            <InputNumberCore
              v-model="row.weight"
              :disabled="!row.include"
              :min="WEIGHT_LIMIT.min"
              :max="WEIGHT_LIMIT.max"
              :max-fraction-digits="WEIGHT_LIMIT.fractionDigits"
              placeholder="Peso %"
            />
            <button
              type="button"
              class="adm-icon-btn inline-flex size-7 items-center justify-center rounded-adm-sm text-secondary-500"
              :title="row.include ? 'Quitar este tipo' : 'Volver a incluir'"
              @click="row.include = !row.include"
            >
              <HeroCore :path="row.include ? mdiClose : mdiRestore" size="16" />
            </button>
          </div>
        </div>
      </BulkCourseCard>
    </div>
  </BulkFormShell>
</template>
