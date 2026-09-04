<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "primevue";

import { safeRequest } from "@/shared/utils/request";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";

import {
  mdiAccountOutline,
  mdiShieldLockOutline,
  mdiDevices,
} from "@mdi/js";
import { HeroCore } from "@/shared/components";

import ProfileHeader from "../components/profile-header.vue";
import PersonalInfo from "../components/personal-info.vue";
import ChangePassword from "../components/change-password.vue";
import ActiveSessions from "../components/active-sessions.vue";

import profileService from "../services/profile.service";
import type { Profile, Session } from "../models/profile.model";

const route = useRoute();
const router = useRouter();

const TABS = ["info", "security", "sessions"] as const;

const tabFromQuery = (value: unknown): string =>
  typeof value === "string" && (TABS as readonly string[]).includes(value)
    ? value
    : "info";

// El menú de usuario del header enlaza con ?tab=security / ?tab=sessions.
const activeTab = ref<string>(tabFromQuery(route.query.tab));

watch(
  () => route.query.tab,
  (value) => {
    activeTab.value = tabFromQuery(value);
  },
);

// Mantiene la URL en sincronía para que el tab sea enlazable y sobreviva a F5.
watch(activeTab, (value) => {
  if (tabFromQuery(route.query.tab) === value) return;
  router.replace({
    query: value === "info" ? {} : { tab: value },
  });
});
const profile = ref<Profile | null>(null);
const sessionsCount = ref<number>(0);
const lastAccess = ref<string | null>(null);
const sessionsRef = ref<InstanceType<typeof ActiveSessions> | null>(null);

const loadProfile = async () => {
  const loadingStore = useLoadingStore();
  loadingStore.start();
  const { data } = await safeRequest(() => profileService.show(), {
    showAlert: false,
  });
  loadingStore.finish();
  if (data) profile.value = data;
};

/**
 * El componente de sesiones es el único que llama a GET auth/sessions y
 * emite lo que carga. Pedirlo también desde acá disparaba dos requests
 * idénticos y ApiRequest cancelaba el primero, dejando la lista vacía.
 */
const onSessionsLoaded = (list: Session[]) => {
  sessionsCount.value = list.length;

  // El acceso más reciente es la sesión con actividad más nueva.
  const activities = list
    .map((session) => session.last_activity)
    .filter(Boolean)
    .sort();
  lastAccess.value = activities[activities.length - 1] ?? null;
};

/**
 * Cambiar la contraseña revoca las demás sesiones en el backend, así que la
 * lista queda desactualizada y hay que recargarla.
 */
const onPasswordChanged = () => {
  sessionsRef.value?.load();
};

onMounted(loadProfile);
</script>

<template>
  <div>
    <!-- Breadcrumb -->
    <div
      class="px-1 pb-4 font-mono text-adm-xs text-secondary-400 tracking-widest uppercase"
    >
      <span>Admin</span>
      <span class="mx-2">/</span>
      <span class="text-secondary-900">Mi perfil</span>
    </div>

    <ProfileHeader
      :profile="profile"
      :sessions-count="sessionsCount"
      :last-access="lastAccess"
    />

    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab value="info">
          <span class="inline-flex items-center gap-2">
            <HeroCore :path="mdiAccountOutline" class="size-4" />
            Información personal
          </span>
        </Tab>
        <Tab value="security">
          <span class="inline-flex items-center gap-2">
            <HeroCore :path="mdiShieldLockOutline" class="size-4" />
            Seguridad
          </span>
        </Tab>
        <Tab value="sessions">
          <span class="inline-flex items-center gap-2">
            <HeroCore :path="mdiDevices" class="size-4" />
            Sesiones activas
            <span
              v-if="sessionsCount"
              class="font-mono text-adm-xs px-1.5 py-0.5 rounded-full bg-accent-soft text-primary-500 font-bold"
            >
              {{ sessionsCount }}
            </span>
          </span>
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel value="info">
          <PersonalInfo :profile="profile" @updated="profile = $event" />
        </TabPanel>

        <TabPanel value="security">
          <ChangePassword
            :last-update="profile?.password_changed_at"
            @changed="onPasswordChanged"
          />
        </TabPanel>

        <TabPanel value="sessions">
          <ActiveSessions ref="sessionsRef" @loaded="onSessionsLoaded" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
