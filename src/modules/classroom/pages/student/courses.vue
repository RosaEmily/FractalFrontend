<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { safeRequest } from "@/shared/utils/request";
import studentService from "../../services/student.service";
import type { StudentCourse } from "../../models/classroom.model";
import { AulaEmpty, AulaPageHeader } from "../../components/ui";
import CourseCard from "../../components/course-card.vue";

const courses = ref<StudentCourse[]>([]);
const loading = ref(true);
const tab = ref<"active" | "closed" | "all">("active");

const active = computed(() =>
  courses.value.filter((c) => c.progressStatus !== "completed"),
);
const closed = computed(() =>
  courses.value.filter((c) => c.progressStatus === "completed"),
);

/** El conteo en la pestaña evita entrar a una lista vacía para descubrirlo. */
const tabs = computed(() => [
  { key: "active", label: `Activos (${active.value.length})` },
  { key: "closed", label: `Cerrados (${closed.value.length})` },
  { key: "all", label: "Todos" },
]);

/**
 * El vacío depende del filtro: "no cerraste ningún curso todavía" dice algo
 * muy distinto de "no tienes cursos", y confundirlos preocupa sin motivo.
 */
const emptyState = computed(() =>
  tab.value === "closed"
    ? {
        title: "Aún no cierras ningún curso",
        sub: "Un curso pasa a cerrado cuando el docente cierra su acta de notas.",
      }
    : {
        title: "Nada por aquí todavía",
        sub: "Cuando se confirme tu matrícula verás tus cursos en esta pantalla.",
      },
);

/** La API ya devuelve la lista ordenada por la clase más próxima. */
const visible = computed(() =>
  tab.value === "all"
    ? courses.value
    : tab.value === "closed"
      ? closed.value
      : active.value,
);

onMounted(async () => {
  const { data } = await safeRequest(() => studentService.courses());
  courses.value = data ?? [];
  loading.value = false;
});
</script>

<template>
  <div>
    <AulaPageHeader
      eyebrow="MIS CURSOS"
      title="Cursos"
      sub="Todo el detalle académico —clases, notas, asistencia y certificado— vive dentro de cada curso."
    />

    <div class="flex gap-1 mb-5 border-b border-line">
      <button
        v-for="item in tabs"
        :key="item.key"
        type="button"
        class="px-3.5 py-2 text-adm-base border-b-2 -mb-px transition-colors cursor-pointer"
        :class="
          tab === item.key
            ? 'border-primary-500 text-primary-500 font-semibold'
            : 'border-transparent text-secondary-500'
        "
        @click="tab = item.key as never"
      >
        {{ item.label }}
      </button>
    </div>

    <AulaSkeleton v-if="loading" kind="table" :rows="4" />

    <div v-else-if="visible.length" class="grid gap-3.5 xl:grid-cols-2">
      <CourseCard
        v-for="course in visible"
        :key="course.id"
        :course="course"
        from="classroom.courses"
      />
    </div>

    <AulaEmpty v-else :title="emptyState.title" :sub="emptyState.sub" />
  </div>
</template>
