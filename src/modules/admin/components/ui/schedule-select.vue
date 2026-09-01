<script setup lang="ts">
import { computed, ref } from "vue";
import { SelectCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import offerService from "@/modules/admin/modules/catalog/modules/offers/services/offer.service";
import { DAY_OF_WEEK_OPTIONS } from "@/modules/admin/modules/catalog/modules/offers/constants/offer.constant";
import type {
  Offer,
  OfferCourseItem,
} from "@/modules/admin/modules/catalog/modules/offers/models/offer.model";

/**
 * Selects encadenados Programa → curso → horario.
 *
 * Una clase cuelga de un `schedule_id`, no del curso: un mismo curso puede
 * dictarse en varios horarios. Los cursos y sus horarios llegan juntos en el
 * DETALLE del programa, así que basta una petición al elegir el programa.
 */
interface Props {
  modelValue: number | null;
  invalid?: boolean;
  messageError?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: "update:modelValue", value: number | null): void }>();

const DAY_LABEL: Record<string, string> = Object.fromEntries(
  DAY_OF_WEEK_OPTIONS.map((day) => [day.value, day.label]),
);

const selectedOffer = ref<number | null>(null);
const selectedCourse = ref<number | null>(null);
const courseItems = ref<OfferCourseItem[]>([]);
const loadingCourses = ref<boolean>(false);

const loadOffers = async (): Promise<Offer[]> =>
  await offerService.all({ status: 1 });

const courses = computed(() =>
  courseItems.value.map((item) => ({ id: item.id, name: item.name })),
);

/** Horarios del curso elegido, con el día y el rango ya legibles. */
const schedules = computed(() => {
  const course = courseItems.value.find(
    (item) => item.id === selectedCourse.value,
  );

  return (course?.schedules ?? []).map((schedule) => ({
    id: schedule.id,
    label: `${DAY_LABEL[schedule.dayOfWeek] ?? schedule.dayOfWeek} ${schedule.startTime?.slice(0, 5)} – ${schedule.endTime?.slice(0, 5)}`,
  }));
});

const onOfferChange = async () => {
  selectedCourse.value = null;
  courseItems.value = [];
  emit("update:modelValue", null);

  if (!selectedOffer.value) return;

  loadingCourses.value = true;
  const { data } = await safeRequest(
    () => offerService.edit(selectedOffer.value as number),
    { showAlert: false },
  );
  loadingCourses.value = false;

  courseItems.value = data?.courseItems ?? [];
};

const onCourseChange = () => emit("update:modelValue", null);
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <SelectCore
      v-model="selectedOffer"
      label="Programa"
      required
      filter
      option-label="name"
      option-value="id"
      placeholder="Selecciona un programa"
      :service="loadOffers"
      auto-load
      @update:model-value="onOfferChange"
    />

    <SelectCore
      v-model="selectedCourse"
      label="Curso"
      required
      :options="courses"
      option-label="name"
      option-value="id"
      :placeholder="
        selectedOffer ? 'Selecciona un curso' : 'Elige un programa primero'
      "
      :loading="loadingCourses"
      @update:model-value="onCourseChange"
    />

    <SelectCore
      :model-value="props.modelValue"
      label="Horario"
      required
      :options="schedules"
      option-label="label"
      option-value="id"
      :placeholder="
        selectedCourse ? 'Selecciona un horario' : 'Elige un curso primero'
      "
      :invalid="props.invalid"
      :message-error="props.messageError"
      @update:model-value="emit('update:modelValue', $event as number | null)"
    />
  </div>
</template>
