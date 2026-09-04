<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { HeroCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import { mdiArrowRight, mdiCheckCircleOutline, mdiLockOutline } from "@mdi/js";
import studentService, { groupByOffer } from "../../services/student.service";
import type { LearningPathGroup } from "../../services/student.service";
import {
  AulaCard,
  AulaEmpty,
  AulaPageHeader,
  AulaSkeleton,
  AulaPill,
  AulaProgress,
} from "../../components/ui";

const router = useRouter();

const groups = ref<LearningPathGroup[]>([]);
const loading = ref(true);

/**
 * Solo las líneas de carrera: un curso suelto es una oferta de tipo `course` y
 * se ve en "Cursos", no acá. Las que siguen abiertas van primero.
 */
const paths = computed(() =>
  groups.value
    .filter((g) => g.offerType === "learning_path")
    .sort((a, b) => Number(a.completed) - Number(b.completed)),
);

onMounted(async () => {
  const { data } = await safeRequest(() => studentService.courses());
  groups.value = groupByOffer(data ?? []);
  loading.value = false;
});

const open = (group: LearningPathGroup) => {
  router.push({
    name: "classroom-path",
    params: { offerId: group.offerId },
    query: { from: "classroom.paths" },
  });
};
</script>

<template>
  <div>
    <AulaPageHeader
      eyebrow="LÍNEAS DE CARRERA"
      title="Línea de carrera"
      sub="Cada línea agrupa cursos que se desbloquean en orden. Al completarla se emite el diploma."
    />

    <AulaSkeleton v-if="loading" kind="table" :rows="3" />

    <div v-else-if="paths.length" class="grid gap-3.5 xl:grid-cols-2">
      <AulaCard v-for="group in paths" :key="group.offerId" hover @click="open(group)">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <span
              class="font-mono text-adm-xs text-secondary-400 tracking-[0.06em] uppercase"
            >
              {{ group.offerPrefix ?? "Línea de carrera" }}
            </span>
            <p
              class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight mt-1"
            >
              {{ group.offerName }}
            </p>
          </div>
          <AulaPill :tone="group.completed ? 'success' : 'accent'" size="sm">
            {{ group.completed ? "Completada" : "En progreso" }}
          </AulaPill>
        </div>

        <p class="text-adm-sm text-secondary-500 mt-3">
          {{ group.done }} de {{ group.total }} cursos completados
          <template v-if="group.current">
            · cursando {{ group.current.courseName }}
          </template>
        </p>

        <AulaProgress :value="group.percent" show-label class="mt-2.5" />

        <!-- Chips en el orden de la malla: el número es el desbloqueo -->
        <div class="flex flex-wrap gap-1.5 mt-4 pt-3.5 border-t border-line-soft">
          <span
            v-for="(course, index) in group.courses"
            :key="course.id"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill border font-mono text-adm-xs"
            :class="
              course.progressStatus === 'completed'
                ? 'bg-success-soft text-success-DEFAULT border-success-DEFAULT/25'
                : course.progressStatus === 'locked'
                  ? 'bg-surface-soft text-secondary-400 border-line'
                  : 'bg-accent-soft text-primary-500 border-accent-tint'
            "
          >
            <HeroCore
              v-if="course.progressStatus === 'completed'"
              :path="mdiCheckCircleOutline"
              class="size-3"
            />
            <HeroCore
              v-else-if="course.progressStatus === 'locked'"
              :path="mdiLockOutline"
              class="size-3"
            />
            {{ index + 1 }}. {{ course.courseName }}
          </span>
        </div>

        <div
          class="flex items-center gap-1.5 mt-3.5 text-adm-sm text-primary-500"
        >
          Ver la línea
          <HeroCore :path="mdiArrowRight" class="size-3.5" />
        </div>
      </AulaCard>
    </div>

    <AulaEmpty
      v-else
      title="No estás en ninguna línea de carrera"
      sub="Tus cursos sueltos aparecen en la sección Cursos. Las líneas agrupan varios cursos con un diploma al final."
    />
  </div>
</template>
