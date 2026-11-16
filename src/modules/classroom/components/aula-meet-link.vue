<script setup lang="ts">
/**
 * Enlace de videollamada del docente (Sesiones de clase).
 *
 * Dos modos, como el diseño:
 * - **Un enlace para todo el curso**: se guarda en el curso y pasa a todas sus
 *   clases PENDIENTES (las dictadas conservan el que usaron).
 * - **Uno por clase**: se guarda solo en la clase seleccionada.
 *
 * El modo no se persiste: se DEDUCE de los datos al abrir el curso. Si todas
 * las clases pendientes usan el enlace del curso, es "todo el curso"; si alguna
 * tiene uno propio, es "uno por clase". El padre remonta el componente con
 * `:key` al cambiar de curso para volver a deducirlo.
 *
 * Guardado del aula: sin botón suelto, ✓ que se vuelve spinner mientras
 * responde. Lo guardado se aplica desde la RESPUESTA, sin recargar.
 */
import { computed, ref } from "vue";
import { HeroCore, InputTextCore } from "@/shared/components";
import { mdiCheck, mdiClose, mdiLinkVariant, mdiVideoOutline } from "@mdi/js";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import teacherService from "../services/teacher.service";
import type {
  CourseMeetLinkDTO,
  SessionMeetLinkDTO,
  TeacherCourseDTO,
  TeacherSessionDTO,
} from "../dto/teacher.dto";
import { AulaCard, AulaSpinner } from "./ui";

type Scope = "course" | "session";

const props = defineProps<{
  course: TeacherCourseDTO;
  sessions: TeacherSessionDTO[];
  session: TeacherSessionDTO | null;
}>();

const emit = defineEmits<{
  saved: [scope: Scope, link: string | null];
}>();

const toastStore = useToastStore();

const SCOPES: { value: Scope; label: string }[] = [
  { value: "course", label: "Un enlace para todo el curso" },
  { value: "session", label: "Uno por clase" },
];

const scope = ref<Scope>(
  props.sessions
    .filter((s) => s.status === 0)
    .every((s) => (s.meet_link ?? null) === (props.course.meet_link ?? null))
    ? "course"
    : "session",
);

const link = computed(() =>
  scope.value === "course"
    ? props.course.meet_link
    : (props.session?.meet_link ?? null),
);

/** Una clase dictada no cambia de enlace: la API lo rechaza. */
const locked = computed(
  () => scope.value === "session" && (!props.session || props.session.status !== 0),
);

const editing = ref(false);
const draft = ref("");
const saving = ref(false);
const draftError = ref<string | null>(null);

const startEdit = () => {
  draft.value = link.value ?? "";
  draftError.value = null;
  editing.value = true;
};

const cancel = () => {
  editing.value = false;
  draftError.value = null;
};

const setScope = (value: Scope) => {
  scope.value = value;
  cancel();
};

const save = async () => {
  const value = draft.value.trim() || null;

  if (value && !/^https?:\/\/\S+$/i.test(value)) {
    draftError.value = "Pega el enlace completo, empezando por https://";
    return;
  }

  saving.value = true;
  const { data } = await safeRequest((): Promise<CourseMeetLinkDTO | SessionMeetLinkDTO | null> =>
    scope.value === "course"
      ? teacherService.setCourseMeetLink(props.course.id, value)
      : teacherService.setSessionMeetLink(props.session!.id, value),
  );
  saving.value = false;

  if (!data) return;

  emit("saved", scope.value, data.meet_link);
  editing.value = false;

  if (scope.value === "course" && "updated_sessions" in data) {
    toastStore.showToastSuccess({
      detail: data.updated_sessions
        ? `Enlace aplicado al curso y a ${data.updated_sessions} ${data.updated_sessions === 1 ? "clase pendiente" : "clases pendientes"}.`
        : "Enlace guardado en el curso.",
    });
  } else {
    toastStore.showToastSuccess({ detail: "Enlace de la clase guardado." });
  }
};
</script>

<template>
  <AulaCard pad="none">
    <div
      class="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-3.5"
    >
      <span
        class="flex items-center gap-2 font-mono text-adm-xs uppercase tracking-[0.06em] text-secondary-400"
      >
        <HeroCore :path="mdiVideoOutline" class="size-4" />
        Enlace de videollamada · opcional
      </span>
      <div
        class="inline-flex rounded-pill border border-line bg-surface-page p-0.5"
        role="radiogroup"
        aria-label="Alcance del enlace"
      >
        <button
          v-for="option in SCOPES"
          :key="option.value"
          type="button"
          role="radio"
          :aria-checked="scope === option.value"
          class="cursor-pointer rounded-pill px-3.5 py-1.5 text-adm-sm font-semibold transition-colors"
          :class="
            scope === option.value
              ? 'border border-primary-500 bg-surface-paper text-primary-600'
              : 'border border-transparent text-secondary-400 hover:text-secondary-900'
          "
          @click="setScope(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div class="px-5 py-4">
      <div v-if="editing" class="flex items-start gap-2">
        <InputTextCore
          v-model="draft"
          class="flex-1"
          placeholder="https://meet.google.com/…"
          :invalid="!!draftError"
          :message-error="draftError"
          @keydown.enter.prevent="save"
          @keydown.esc="cancel"
        />
        <button
          type="button"
          class="mt-1 grid size-7 shrink-0 place-items-center rounded-pill bg-success-soft text-success-DEFAULT disabled:opacity-60"
          :class="saving ? 'cursor-default' : 'cursor-pointer'"
          title="Guardar"
          :disabled="saving"
          @click="save"
        >
          <AulaSpinner v-if="saving" :size="13" />
          <HeroCore v-else :path="mdiCheck" class="size-4" />
        </button>
        <button
          type="button"
          class="mt-1 grid size-7 shrink-0 cursor-pointer place-items-center rounded-pill text-secondary-400 hover:text-secondary-900"
          title="Cancelar"
          :disabled="saving"
          @click="cancel"
        >
          <HeroCore :path="mdiClose" class="size-4" />
        </button>
      </div>

      <div
        v-else
        class="flex items-center gap-2.5 rounded-adm-sm border border-line bg-surface-page px-3.5 py-2.5"
      >
        <HeroCore :path="mdiLinkVariant" class="size-4 shrink-0 text-secondary-400" />
        <span
          class="min-w-0 flex-1 truncate font-mono text-adm-sm"
          :class="link ? 'text-secondary-500' : 'italic text-secondary-400'"
        >
          {{ link ?? "Sin enlace todavía" }}
        </span>
        <button
          v-if="!locked"
          type="button"
          class="shrink-0 cursor-pointer text-adm-sm font-semibold text-primary-600"
          @click="startEdit"
        >
          {{ link ? "Editar" : "Agregar" }}
        </button>
      </div>

      <p v-if="scope === 'session' && session" class="mt-2 text-adm-sm text-secondary-400">
        {{
          locked
            ? "Esta clase ya fue dictada: su enlace no se cambia."
            : `Solo para esta clase: ${session.topic ?? session.name ?? "sin tema"}.`
        }}
      </p>
    </div>
  </AulaCard>
</template>
