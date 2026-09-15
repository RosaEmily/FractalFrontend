<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "primevue";
import { HeroCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import {
  mdiAccountOutline,
  mdiShieldLockOutline,
  mdiDevices,
  mdiSchoolOutline,
} from "@mdi/js";

/*
 * Se reutilizan los componentes del perfil del admin: son los mismos endpoints
 * (`auth/profile`, `change-password`, `auth/sessions`), que derivan la identidad
 * del token y no distinguen rol. Duplicarlos habría significado mantener dos
 * formularios contra el mismo contrato.
 */
import PersonalInfo from "@/modules/admin/modules/profile/components/personal-info.vue";
import ChangePassword from "@/modules/admin/modules/profile/components/change-password.vue";
import ActiveSessions from "@/modules/admin/modules/profile/components/active-sessions.vue";
import profileService from "@/modules/admin/modules/profile/services/profile.service";
import type {
  Profile,
  Session,
} from "@/modules/admin/modules/profile/models/profile.model";

import studentService from "../../services/student.service";
import type { StudentCourse } from "../../models/classroom.model";
import { AulaCard, AulaPageHeader, AulaPill } from "../../components/ui";
import { formatDate } from "../../utils/format";

const route = useRoute();
const router = useRouter();

const TABS = ["info", "enrollments", "security", "sessions"] as const;

const tabFromQuery = (value: unknown): string =>
  typeof value === "string" && (TABS as readonly string[]).includes(value)
    ? value
    : "info";

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
const courses = ref<StudentCourse[]>([]);
const sessionsRef = ref<InstanceType<typeof ActiveSessions> | null>(null);

/**
 * Cambiar la contraseña revoca las demás sesiones en el backend, así que la
 * lista queda desactualizada y hay que recargarla.
 */
const onPasswordChanged = () => sessionsRef.value?.load();

// El componente de sesiones es el único que llama a `auth/sessions`: pedirlo
// también desde acá dispararía dos requests idénticos y ApiRequest cancela el
// primero, dejando la lista vacía.
const onSessionsLoaded = (_list: Session[]) => {};

onMounted(async () => {
  const [profileRes, coursesRes] = await Promise.all([
    safeRequest(() => profileService.show(), { showAlert: false }),
    safeRequest(() => studentService.courses(), { showAlert: false }),
  ]);

  profile.value = profileRes.data;
  courses.value = coursesRes.data ?? [];
});
</script>

<template>
  <div>
    <AulaPageHeader
      eyebrow="MI CUENTA"
      title="Mi cuenta"
      sub="Tus datos, tus matrículas y los dispositivos donde tienes la sesión abierta."
    />

    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab value="info">
          <span class="inline-flex items-center gap-2">
            <HeroCore :path="mdiAccountOutline" class="size-4" />
            Información personal
          </span>
        </Tab>
        <Tab value="enrollments">
          <span class="inline-flex items-center gap-2">
            <HeroCore :path="mdiSchoolOutline" class="size-4" />
            Mis matrículas
          </span>
        </Tab>
        <Tab value="security">
          <span class="inline-flex items-center gap-2">
            <HeroCore :path="mdiShieldLockOutline" class="size-4" />
            Contraseña
          </span>
        </Tab>
        <Tab value="sessions">
          <span class="inline-flex items-center gap-2">
            <HeroCore :path="mdiDevices" class="size-4" />
            Sesiones activas
          </span>
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel value="info">
          <PersonalInfo :profile="profile" @updated="profile = $event" />
        </TabPanel>

        <!-- Matrículas: agrupadas por oferta, que es como el alumno compró -->
        <TabPanel value="enrollments">
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

            <p
              v-if="!courses.length"
              class="text-adm-base text-secondary-500 px-2 py-4"
            >
              Todavía no tienes matrículas registradas.
            </p>
          </AulaCard>
        </TabPanel>

        <TabPanel value="security">
          <ChangePassword @changed="onPasswordChanged" />
        </TabPanel>

        <TabPanel value="sessions">
          <ActiveSessions ref="sessionsRef" @loaded="onSessionsLoaded" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
