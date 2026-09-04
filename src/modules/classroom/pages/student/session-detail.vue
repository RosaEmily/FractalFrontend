<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { HeroCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import {
  mdiArrowLeft,
  mdiVideoOutline,
  mdiContentCopy,
  mdiCalendarBlankOutline,
} from "@mdi/js";
import studentService from "../../services/student.service";
import type { Session, StudentCourse } from "../../models/classroom.model";
import { useToastStore } from "@/shared/stores/useToastStore";
import {
  AulaCard,
  AulaEmpty,
  AulaPageHeader,
  AulaSkeleton,
  AulaPill,
} from "../../components/ui";
import {
  formatDate,
  formatTime,
  formatTimeRange,
  weekdayLabel,
} from "../../utils/format";

const props = defineProps<{ sessionId: string }>();
const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();

const session = ref<Session | null>(null);
const course = ref<StudentCourse | null>(null);
const loading = ref(true);

/** Clases del mismo curso alrededor de esta, para saltar entre ellas. */
const around = computed(() => {
  if (!course.value || !session.value) return [];
  const list = course.value.sessions;
  const index = list.findIndex((s) => s.id === session.value?.id);
  if (index === -1) return [];
  return list.slice(Math.max(0, index - 2), index + 3);
});

const copyLink = async () => {
  if (!session.value?.meetLink) return;
  await navigator.clipboard.writeText(session.value.meetLink);
  toastStore.showToastSuccess({ detail: "Enlace copiado." });
};

const goBack = () => {
  const from = route.query.from as string | undefined;
  if (from === "classroom.courses" && course.value) {
    router.push({ name: "classroom-course", params: { id: course.value.id } });
    return;
  }
  router.push({ name: "classroom-agenda" });
};

onMounted(async () => {
  /*
   * No hay endpoint de sesión suelta: se busca en la agenda del alumno, que ya
   * está acotada a lo suyo. Con el `enrollment_course_id` de esa sesión se pide
   * el curso, que trae el resto de clases para la navegación.
   */
  const { data: agenda } = await safeRequest(() => studentService.agenda());
  const found =
    (agenda ?? []).find((s) => String(s.id) === String(props.sessionId)) ?? null;

  session.value = found;

  if (found?.enrollmentCourseId) {
    const { data } = await safeRequest(
      () => studentService.course(found.enrollmentCourseId as number),
      { showAlert: false },
    );
    course.value = data;
  }

  loading.value = false;
});
</script>

<template>
  <div>
    <button
      type="button"
      class="inline-flex items-center gap-1.5 text-adm-sm text-secondary-500 mb-4 cursor-pointer hover:text-secondary-900"
      @click="goBack"
    >
      <HeroCore :path="mdiArrowLeft" class="size-3.5" />
      Volver
    </button>

    <AulaSkeleton v-if="loading" kind="panel" />

    <AulaEmpty
      v-else-if="!session"
      title="Clase no encontrada"
      sub="Puede que no pertenezca a tus cursos o que ya no exista."
    />

    <template v-else>
      <AulaPageHeader
        :eyebrow="session.courseName ?? 'CLASE'"
        :title="session.topic ?? session.name ?? 'Sesión de clase'"
        :sub="`${weekdayLabel(session.date)} ${formatDate(session.date, true)} · ${formatTimeRange(session.startTime, session.endTime)}`"
      />

      <!-- Clase en vivo: el enlace es lo único que el alumno viene a buscar -->
      <AulaCard
        v-if="!session.isDone && session.meetLink"
        class="mb-5 bg-secondary-900 border-secondary-900"
      >
        <span
          class="font-mono text-adm-xs text-white/60 tracking-[0.08em] uppercase"
        >
          Clase en vivo
        </span>
        <p class="text-adm-base text-white/70 mt-2 mb-4">
          La tolerancia de ingreso es de 10 minutos. Después de ese margen el
          docente puede marcarte tardanza.
        </p>
        <div class="flex flex-wrap gap-2">
          <a
            :href="session.meetLink"
            target="_blank"
            rel="noopener"
            class="v3-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-pill bg-primary-500 text-white text-adm-base font-semibold"
          >
            <HeroCore :path="mdiVideoOutline" class="size-4" />
            Entrar a la videollamada
          </a>
          <button
            type="button"
            class="v3-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-pill border border-white/25 text-white text-adm-base cursor-pointer"
            @click="copyLink"
          >
            <HeroCore :path="mdiContentCopy" class="size-4" />
            Copiar enlace
          </button>
        </div>
      </AulaCard>

      <!-- Clase dictada: lo relevante pasa a ser la asistencia -->
      <AulaCard v-else-if="session.isDone" class="mb-5">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span
              class="font-mono text-adm-xs text-secondary-400 tracking-[0.06em] uppercase"
            >
              Clase dictada
            </span>
            <p class="text-adm-base text-secondary-500 mt-2">
              El docente cerró esta clase y registró la asistencia.
            </p>
          </div>
          <div class="text-right">
            <span
              class="font-mono text-adm-xs text-secondary-400 uppercase block mb-1"
            >
              Mi asistencia
            </span>
            <AulaPill
              v-if="session.attendedLabel"
              :tone="session.attendedTone as never"
            >
              {{ session.attendedLabel }}
            </AulaPill>
            <span v-else class="text-adm-sm text-secondary-400">
              Sin registro
            </span>
          </div>
        </div>
        <p
          v-if="session.attendedAt"
          class="font-mono text-adm-xs text-secondary-400 mt-3 pt-3 border-t border-line-soft"
        >
          REGISTRADA EL {{ formatDate(session.attendedAt, true) }} A LAS
          {{ formatTime(String(session.attendedAt).split(" ")[1]) }}
        </p>
      </AulaCard>

      <div class="grid gap-3.5 lg:grid-cols-[1fr_20rem]">
        <!-- Clases alrededor -->
        <AulaCard v-if="around.length" pad="sm">
          <p
            class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em] px-2 pt-1 pb-2"
          >
            Clases del curso
          </p>
          <button
            v-for="item in around"
            :key="item.id"
            type="button"
            class="adm-row w-full flex items-center justify-between gap-4 px-2 py-2.5 border-t border-line-soft text-left cursor-pointer"
            :class="item.id === session.id ? 'bg-accent-soft rounded-adm-sm' : ''"
            @click="
              router.push({
                name: 'classroom-session',
                params: { sessionId: item.id },
                query: route.query,
              })
            "
          >
            <div class="min-w-0">
              <p class="text-secondary-900 truncate">
                {{ item.name ?? "Sesión" }}
              </p>
              <p class="text-adm-sm text-secondary-500 truncate mt-0.5">
                {{ item.topic ?? "—" }}
              </p>
            </div>
            <div class="text-right shrink-0">
              <div class="text-adm-sm text-secondary-900">
                {{ formatDate(item.date) }}
              </div>
              <AulaPill
                :tone="item.isDone ? 'success' : 'neutral'"
                size="sm"
                class="mt-1"
              >
                {{ item.isDone ? "Dictada" : "Pendiente" }}
              </AulaPill>
            </div>
          </button>
        </AulaCard>

        <!-- Datos de la sesión -->
        <AulaCard pad="sm">
          <p
            class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em] px-2 pt-1 pb-2"
          >
            Datos de la clase
          </p>
          <dl class="text-adm-sm">
            <div
              v-for="row in [
                { label: 'Curso', value: session.courseName ?? '—' },
                { label: 'Programa', value: session.offerName ?? '—' },
                { label: 'Docente', value: course?.teacherName ?? '—' },
                {
                  label: 'Fecha',
                  value: `${weekdayLabel(session.date)} ${formatDate(session.date, true)}`,
                },
                {
                  label: 'Horario',
                  value: formatTimeRange(session.startTime, session.endTime),
                },
                { label: 'Estado', value: session.isDone ? 'Dictada' : 'Pendiente' },
              ]"
              :key="row.label"
              class="flex items-start justify-between gap-3 px-2 py-2 border-t border-line-soft"
            >
              <dt class="text-secondary-500 shrink-0">{{ row.label }}</dt>
              <dd class="text-secondary-900 text-right">{{ row.value }}</dd>
            </div>
          </dl>
          <div
            v-if="course"
            class="flex items-center gap-1.5 px-2 pt-3 mt-1 border-t border-line-soft"
          >
            <HeroCore
              :path="mdiCalendarBlankOutline"
              class="size-3.5 text-secondary-400"
            />
            <button
              type="button"
              class="text-adm-sm text-primary-500 cursor-pointer"
              @click="
                router.push({
                  name: 'classroom-course',
                  params: { id: course.id },
                })
              "
            >
              Ir al curso
            </button>
          </div>
        </AulaCard>
      </div>
    </template>
  </div>
</template>
