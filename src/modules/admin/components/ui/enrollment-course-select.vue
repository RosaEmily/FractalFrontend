<script setup lang="ts">
import { ref } from "vue";
import { SelectCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import enrollmentService from "@/modules/admin/modules/enrollments/modules/enrollments/services/enrollment.service";
import type { Enrollment } from "@/modules/admin/modules/enrollments/modules/enrollments/models/enrollment.model";

/**
 * Selects encadenados Matrícula → curso de la matrícula.
 *
 * `enrollment_course_id` tampoco tiene endpoint propio: los cursos llegan
 * dentro de cada matrícula (`courses`), que sí viene en el listado.
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

const enrollments = ref<Enrollment[]>([]);
const selectedEnrollment = ref<number | null>(null);
const courses = ref<CourseOption[]>([]);

const loadEnrollments = async (): Promise<Enrollment[]> => {
  const { data } = await safeRequest(() => enrollmentService.all(), {
    showAlert: false,
  });
  enrollments.value = data ?? [];
  return enrollments.value;
};

/** Los cursos ya vienen en la matrícula: no hace falta otra petición. */
const onEnrollmentChange = () => {
  emit("update:modelValue", null);

  const enrollment = enrollments.value.find(
    (item) => item.id === selectedEnrollment.value,
  );
  courses.value = (enrollment?.courses ?? []).map((course) => ({
    id: course.id,
    name: course.name,
  }));
};
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <SelectCore
      v-model="selectedEnrollment"
      label="Matrícula"
      required
      hint-label="Primero elige la matrícula del alumno."
      filter
      option-label="studentName"
      option-value="id"
      placeholder="Selecciona una matrícula"
      :service="loadEnrollments"
      auto-load
      @update:model-value="onEnrollmentChange"
    />

    <SelectCore
      :model-value="props.modelValue"
      label="Curso de la matrícula"
      required
      :options="courses"
      option-label="name"
      option-value="id"
      :placeholder="
        selectedEnrollment ? 'Selecciona un curso' : 'Elige una matrícula primero'
      "
      :invalid="props.invalid"
      :message-error="props.messageError"
      @update:model-value="emit('update:modelValue', $event as number | null)"
    />
  </div>
</template>
