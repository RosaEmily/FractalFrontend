<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { safeRequest } from "@/shared/utils/request";

/*
 * Se reutilizan los componentes del perfil del admin: son los mismos endpoints
 * (`auth/profile`, `change-password`, `auth/sessions`), que derivan la identidad
 * del token y no distinguen rol. Duplicarlos habría significado mantener dos
 * formularios contra el mismo contrato.
 */
import profileService from "@/modules/admin/modules/profile/services/profile.service";
import type {
  Profile,
  Session,
} from "@/modules/admin/modules/profile/models/profile.model";

import studentService from "../services/student.service";
import {
  updateClassroomUser,
  useClassroomRole,
} from "../composables/useClassroomRole";
import type { StudentCourse } from "../models/classroom.model";
import { AulaCard, AulaPageHeader, AulaPill, AulaTabs } from "../components/ui";
import AulaProfile from "../components/aula-profile.vue";
import AulaSessions from "../components/aula-sessions.vue";
import AulaChangePassword from "../components/aula-change-password.vue";
import type { AulaTabItem } from "../components/ui";
import { formatDate } from "../utils/format";

const route = useRoute();
const router = useRouter();

/**
 * Mi cuenta, para los TRES roles.
 *
 * El diseño le da al docente y a coordinación los mismos tabs salvo
 * **Mis matrículas** (`AulaAccountGeneric`, teacher.jsx:961): quien no compra
 * cursos no tiene matrículas que mirar. Los endpoints (`auth/profile`,
 * `auth/sessions`, `change-password`) operan sobre el TOKEN y no piden rol, así
 * que no hizo falta nada nuevo en la API.
 */
const { isStudent } = useClassroomRole();

/*
 * ⚠️ TRES tabs, no cuatro: en el diseño la contraseña NO es una pestaña
 * (`StuAccount`, student2.jsx:561) — vive dentro de Perfil, en la columna
 * derecha, junto a la foto y los datos bloqueados.
 */
const TABS = computed(() =>
  isStudent.value ? ["info", "enrollments", "sessions"] : ["info", "sessions"],
);

const tabFromQuery = (value: unknown): string =>
  typeof value === "string" && TABS.value.includes(value) ? value : "info";

const activeTab = ref<string>(tabFromQuery(route.query.tab));

watch(
  () => route.query.tab,
  (value) => (activeTab.value = tabFromQuery(value)),
);

// La URL sigue al tab para que sea enlazable y sobreviva a un F5.
watch(activeTab, (value) => {
  if (tabFromQuery(route.query.tab) === value) return;
  router.replace({ query: value === "info" ? {} : { tab: value } });
});

const profile = ref<Profile | null>(null);

/*
 * La contraseña se cambia en un MODAL (`AulaChangePasswordModal` del diseño),
 * no en una pestaña: es una acción puntual, no una sección que se visite.
 */
const passwordOpen = ref(false);

/**
 * Tras guardar, la topbar refleja el cambio al instante.
 *
 * El header no consulta la API: muestra el perfil compartido del aula, así que
 * basta con actualizarlo acá y todo lo que lo use reacciona solo.
 */
const onProfileUpdated = (updated: Profile) => {
  profile.value = updated;

  updateClassroomUser({
    first_name: updated.first_name,
    last_name: updated.last_name,
    photo_url: updated.photo_url,
  });
};

/*
 * El diseño titula con el NOMBRE y pone documento y correo debajo
 * (student2.jsx:559), no un "Mi cuenta" genérico: la página es la ficha de una
 * persona concreta.
 */
const fullName = computed(() =>
  profile.value
    ? `${profile.value.first_name} ${profile.value.last_name}`.trim()
    : "Mi cuenta",
);

const identity = computed(() => {
  const p = profile.value;
  if (!p) return "";

  const document = p.document_number
    ? `${p.document_type ?? ""} ${p.document_number}`.trim()
    : "";

  return [document, p.email].filter(Boolean).join(" · ");
});
const courses = ref<StudentCourse[] | null>(null);
const sessionsRef = ref<InstanceType<typeof AulaSessions> | null>(null);

/**
 * Cambiar la contraseña revoca las demás sesiones en el backend, así que la
 * lista queda desactualizada y hay que recargarla.
 */
const onPasswordChanged = () => sessionsRef.value?.load();

/*
 * El componente de sesiones es el único que llama a `auth/sessions`: pedirlo
 * también desde acá dispararía dos requests idénticos y ApiRequest cancela el
 * primero, dejando la lista vacía. Por eso el contador del tab sale de su
 * evento `loaded`, no de una llamada propia.
 */
const sessionCount = ref<number | null>(null);
const onSessionsLoaded = (list: Session[]) =>
  (sessionCount.value = list.length);

/**
 * Etiquetas con su contador, como el diseño (`StuAccount`, student2.jsx:561):
 * "Mis matrículas (3)" y "Sesiones activas (3/4)". El número es la mitad del
 * dato — dice si queda cupo sin entrar a mirar.
 */
const tabItems = computed<AulaTabItem[]>(() => {
  const items: AulaTabItem[] = [{ key: "info", label: "Perfil" }];

  if (isStudent.value) {
    // Mismo criterio: sin datos cargados, la etiqueta no inventa un cero.
    items.push({
      key: "enrollments",
      label:
        courses.value === null
          ? "Mis matrículas"
          : `Mis matrículas (${courses.value.length})`,
    });
  }

  /*
   * ⚠️ El contador solo aparece cuando la lista YA se cargó, y eso ocurre al
   * abrir el tab: `auth/sessions` lo pide el propio componente, que no se monta
   * antes. Mientras tanto decía "(0/1)", y eso es FALSO —siempre existe al
   * menos la sesión actual—, así que la etiqueta va sin número.
   */
  items.push({
    key: "sessions",
    label:
      sessionCount.value === null
        ? "Sesiones activas"
        : `Sesiones activas (${sessionCount.value}/${profile.value?.max_sessions ?? 1})`,
  });

  return items;
});

onMounted(async () => {
  const { data } = await safeRequest(() => profileService.show(), {
    showAlert: false,
  });
  profile.value = data;

  // `classroom/me/courses` es `authorize:STUDENT`: pedirlo con otro rol da 403.
  if (!isStudent.value) return;

  const coursesRes = await safeRequest(() => studentService.courses(), {
    showAlert: false,
  });
  courses.value = coursesRes.data ?? [];
});
</script>

<template>
  <div>
    <AulaPageHeader eyebrow="MI CUENTA" :title="fullName" :sub="identity" />

    <!--
      `AulaTabs`, no los `Tabs` de PrimeVue: el diseño las dibuja pegadas bajo
      el encabezado, SIN icono y con el contador en la etiqueta
      (`AulaPageHeader` + `AulaTabs`, shell.jsx:149).
    -->
    <AulaTabs v-model="activeTab" :tabs="tabItems" />

    <div class="mt-5">
      <div v-if="activeTab === 'info'">
        <AulaProfile
          :profile="profile"
          @updated="onProfileUpdated"
          @change-password="passwordOpen = true"
        />
      </div>

      <!-- Matrículas: agrupadas por oferta, que es como el alumno compró -->
      <div v-else-if="activeTab === 'enrollments'">
        <AulaCard pad="sm">
          <div
            v-for="course in courses"
            :key="course.id"
            class="flex items-center justify-between gap-4 px-2 py-3 border-b border-line-soft last:border-0"
          >
            <div class="min-w-0">
              <p class="text-secondary-900 truncate">
                {{ course.courseName }}
              </p>
              <p class="text-adm-sm text-secondary-500 truncate mt-0.5">
                {{ course.offerName }} · matrícula #{{ course.enrollmentId }}
              </p>
            </div>
            <div class="text-right shrink-0">
              <AulaPill :tone="course.stateTone as never" size="sm">
                {{ course.stateLabel }}
              </AulaPill>
              <p class="font-mono text-adm-xs text-secondary-400 mt-1">
                {{ formatDate(course.startDate) }}
              </p>
            </div>
          </div>

          <!--
            `courses === null` es "todavía cargando", no "no tiene ninguna":
            afirmar que no hay matrículas antes de preguntarlo es el mismo
            error que el contador "(0)" del tab.
          -->
          <p
            v-if="courses !== null && !courses.length"
            class="text-adm-base text-secondary-500 px-2 py-4"
          >
            Todavía no tienes matrículas registradas.
          </p>
        </AulaCard>
      </div>

      <div v-else-if="activeTab === 'sessions'">
        <AulaSessions
          ref="sessionsRef"
          :max-sessions="profile?.max_sessions"
          @loaded="onSessionsLoaded"
        />
      </div>
    </div>

    <AulaChangePassword
      v-model:visible="passwordOpen"
      @changed="onPasswordChanged"
    />
  </div>
</template>
