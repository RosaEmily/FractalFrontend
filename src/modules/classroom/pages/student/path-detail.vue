<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { HeroCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import {
  mdiArrowLeft,
  mdiCertificateOutline,
  mdiChartBoxOutline,
  mdiSourceBranch,
} from "@mdi/js";
import studentService, { groupByOffer } from "../../services/student.service";
import type { LearningPathGroup } from "../../services/student.service";
import {
  AulaEmpty,
  AulaNotice,
  AulaPageHeader,
  AulaSkeleton,
  AulaProgress,
  AulaStat,
} from "../../components/ui";
import CourseCard from "../../components/course-card.vue";
import { formatScore } from "../../utils/format";

const props = defineProps<{ offerId: string }>();
const router = useRouter();

const group = ref<LearningPathGroup | null>(null);
const loading = ref(true);

/** Promedio de los cursos ya cerrados. Null si ninguno tiene nota final. */
const average = computed(() => {
  const scores = (group.value?.courses ?? [])
    .map((c) => c.finalGrade?.score)
    .filter((s): s is number => s !== null && s !== undefined);

  if (!scores.length) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
});

const certificates = computed(
  () => group.value?.courses.filter((c) => c.certificate).length ?? 0,
);

onMounted(async () => {
  const { data } = await safeRequest(() => studentService.courses());
  group.value =
    groupByOffer(data ?? []).find(
      (g) => String(g.offerId) === String(props.offerId),
    ) ?? null;
  loading.value = false;
});
</script>

<template>
  <div>
    <button
      type="button"
      class="inline-flex items-center gap-1.5 text-adm-sm text-secondary-500 mb-4 cursor-pointer hover:text-secondary-900"
      @click="router.push({ name: 'classroom-paths' })"
    >
      <HeroCore :path="mdiArrowLeft" class="size-3.5" />
      Líneas de carrera
    </button>

    <AulaSkeleton v-if="loading" kind="page" :rows="3" />

    <AulaEmpty
      v-else-if="!group"
      title="Línea no encontrada"
      sub="Puede que no esté en tu matrícula o que ya no exista."
    />

    <template v-else>
      <AulaPageHeader
        :eyebrow="group.offerPrefix ?? 'LÍNEA DE CARRERA'"
        :title="group.offerName"
        :sub="`${group.total} cursos que se desbloquean en orden.`"
      />

      <div class="grid gap-3.5 sm:grid-cols-3 mb-5">
        <AulaStat
          label="Avance de la línea"
          :value="`${group.percent}%`"
          :delta="`${group.done} de ${group.total} cursos`"
          :icon="mdiSourceBranch"
        />
        <AulaStat
          label="Promedio"
          :value="formatScore(average)"
          :delta="
            average === null
              ? 'Sin cursos cerrados todavía'
              : 'de los cursos con acta cerrada'
          "
          :icon="mdiChartBoxOutline"
          tone="info"
        />
        <AulaStat
          label="Certificados"
          :value="certificates || '—'"
          delta="uno por cada curso aprobado"
          :icon="mdiCertificateOutline"
          tone="warning"
        />
      </div>

      <AulaProgress :value="group.percent" class="mb-6" />

      <AulaNotice v-if="group.completed" tone="success" class="mb-5">
        Completaste los {{ group.total }} cursos de esta línea. El diploma se
        emite desde coordinación académica.
      </AulaNotice>

      <AulaNotice v-else-if="group.current" tone="info" class="mb-5">
        Estás cursando <strong>{{ group.current.courseName }}</strong
        >. Los siguientes se desbloquean al cerrarse el acta del anterior.
      </AulaNotice>

      <h2
        class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight mb-3"
      >
        Cursos de la línea
      </h2>

      <div class="grid gap-3.5 xl:grid-cols-2">
        <CourseCard
          v-for="course in group.courses"
          :key="course.id"
          :course="course"
          from="classroom.paths"
        />
      </div>
    </template>
  </div>
</template>
