<script setup lang="ts">
import { ref } from "vue";
import { SelectCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import offerService from "@/modules/admin/modules/catalog/modules/offers/services/offer.service";
import type { Offer } from "@/modules/admin/modules/catalog/modules/offers/models/offer.model";

/**
 * Selects encadenados Programa → curso del programa.
 *
 * `offer_course_id` no tiene endpoint propio: los cursos solo llegan
 * anidados en el DETALLE de un programa (`course_items`), no en el listado,
 * así que al elegir el programa se pide su detalle.
 */
interface Props {
  modelValue: number | null;
  invalid?: boolean;
  messageError?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: "update:modelValue", value: number | null): void }>();

interface CourseOption {
  id: number;
  name: string;
}

const selectedOffer = ref<number | null>(null);
const courses = ref<CourseOption[]>([]);
const loadingCourses = ref<boolean>(false);

const loadOffers = async (): Promise<Offer[]> =>
  await offerService.all({ status: 1 });

const onOfferChange = async () => {
  emit("update:modelValue", null);
  courses.value = [];

  if (!selectedOffer.value) return;

  loadingCourses.value = true;
  const { data } = await safeRequest(
    () => offerService.edit(selectedOffer.value as number),
    { showAlert: false },
  );
  loadingCourses.value = false;

  courses.value = (data?.courseItems ?? []).map((item) => ({
    id: item.id as number,
    name: item.name,
  }));
};
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <SelectCore
      v-model="selectedOffer"
      label="Programa"
      required
      hint-label="Primero elige el programa."
      filter
      option-label="name"
      option-value="id"
      placeholder="Selecciona un programa"
      :service="loadOffers"
      auto-load
      @update:model-value="onOfferChange"
    />

    <SelectCore
      :model-value="props.modelValue"
      label="Curso del programa"
      required
      :options="courses"
      option-label="name"
      option-value="id"
      :placeholder="
        selectedOffer ? 'Selecciona un curso' : 'Elige un programa primero'
      "
      :loading="loadingCourses"
      :invalid="props.invalid"
      :message-error="props.messageError"
      @update:model-value="emit('update:modelValue', $event as number | null)"
    />
  </div>
</template>
