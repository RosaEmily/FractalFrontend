<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { HeroCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import { mdiArrowLeft, mdiBookOpenPageVariantOutline } from "@mdi/js";
import studentService from "../../services/student.service";
import type { StudentCourse } from "../../models/classroom.model";
import {
  AulaCard,
  AulaEmpty,
  AulaNotice,
  AulaPageHeader,
  AulaSkeleton,
  AulaPill,
  AulaStat,
} from "../../components/ui";
import { formatDate } from "../../utils/format";

const props = defineProps<{ enrollmentId: string }>();
const router = useRouter();

const courses = ref<StudentCourse[]>([]);
const loading = ref(true);

/**
 * Los cursos de esta matrícula.
 *
 * `me/courses` ya viene acotado al alumno del token, así que filtrar por
 * `enrollmentId` acá es seguro: no puede traer la matrícula de otro.
 */
const items = computed(() =>
  courses.value.filter(
    (c) => String(c.enrollmentId) === String(props.enrollmentId),
  ),
);

/** Ofertas distintas dentro de la matrícula: es lo que el alumno compró. */
const offers = computed(() => {
  const map = new Map<number, { name: string; prefix: string | null; count: number }>();

  items.value.forEach((course) => {
    const entry = map.get(course.offerId) ?? {
      name: course.offerName,
      prefix: course.offerPrefix,
      count: 0,
    };
    entry.count += 1;
    map.set(course.offerId, entry);
  });

  return [...map.values()];
});

const completed = computed(
  () => items.value.filter((c) => c.progressStatus === "completed").length,
);

onMounted(async () => {
  const { data } = await safeRequest(() => studentService.courses());
  courses.value = data ?? [];
  loading.value = false;
});
</script>

<template>
  <div>
    <button
      type="button"
      class="inline-flex items-center gap-1.5 text-adm-sm text-secondary-500 mb-4 cursor-pointer hover:text-secondary-900"
      @click="router.push({ name: 'classroom-account', query: { tab: 'enrollments' } })"
    >
      <HeroCore :path="mdiArrowLeft" class="size-3.5" />
      Mis matrículas
    </button>

    <AulaSkeleton v-if="loading" kind="page" :rows="3" />

    <AulaEmpty
      v-else-if="!items.length"
      title="Matrícula no encontrada"
      sub="Puede que no sea tuya o que ya no exista."
    />

    <template v-else>
      <AulaPageHeader
        :eyebrow="`MATRÍCULA #${enrollmentId}`"
        :title="offers.map((o) => o.name).join(' · ')"
        :sub="`${items.length} ${items.length === 1 ? 'curso' : 'cursos'} con acceso al aula.`"
      />

      <div class="grid gap-3.5 sm:grid-cols-3 mb-6">
        <AulaStat
          label="Cursos incluidos"
          :value="items.length"
          :icon="mdiBookOpenPageVariantOutline"
        />
        <AulaStat
          label="Completados"
          :value="completed || '—'"
          :delta="`de ${items.length}`"
          tone="success"
        />
        <AulaStat
          label="Programas"
          :value="offers.length"
          tone="info"
        />
      </div>

      <h2
        class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight mb-3"
      >
        Cursos de esta matrícula
      </h2>

      <AulaCard pad="sm">
        <button
          v-for="course in items"
          :key="course.id"
          type="button"
          class="adm-row w-full flex items-center justify-between gap-4 px-2 py-3 border-b border-line-soft last:border-0 text-left cursor-pointer"
          @click="router.push({ name: 'classroom-course', params: { id: course.id } })"
        >
          <div class="min-w-0">
            <p class="text-secondary-900 truncate">{{ course.courseName }}</p>
            <p class="text-adm-sm text-secondary-500 truncate mt-0.5">
              {{ course.offerName }} ·
              {{ course.teacherName ?? "Docente por asignar" }}
            </p>
          </div>
          <div class="text-right shrink-0">
            <AulaPill :tone="course.stateTone as never" size="sm">
              {{ course.stateLabel }}
            </AulaPill>
            <p class="font-mono text-adm-xs text-secondary-400 mt-1">
              {{ formatDate(course.startDate) }} —
              {{ formatDate(course.endDate, true) }}
            </p>
          </div>
        </button>
      </AulaCard>

      <!--
        Los pagos de la matrícula (importe, comprobante, método) todavía no se
        exponen al alumno: `payments/transactions` está restringido al panel.
      -->
      <AulaNotice tone="info" class="mt-4">
        Para el detalle de pagos y comprobantes de esta matrícula, escríbenos a
        administración.
      </AulaNotice>
    </template>
  </div>
</template>
