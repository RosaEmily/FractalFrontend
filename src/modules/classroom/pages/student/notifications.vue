<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { mdiBellOutline } from "@mdi/js";

import { HeroCore, ButtonCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import studentService from "../../services/student.service";
import type { NotificationDTO } from "../../dto/classroom.dto";
import {
  AulaCard,
  AulaEmpty,
  AulaNotice,
  AulaPageHeader,
  AulaSkeleton,
} from "../../components/ui";
import { formatDate } from "../../utils/format";

/**
 * Página completa de avisos. Es el "Ver todas" del panel de la campana
 * (`notification-bell.vue`), que solo muestra los últimos.
 *
 * ⚠️ Solo existe para STUDENT: `/me/notifications` es `authorize:STUDENT` y no
 * hay endpoint de avisos para docente ni coordinación. Mostrarla vacía a los
 * otros roles sería peor que no tenerla.
 */
const router = useRouter();

const items = ref<NotificationDTO[]>([]);
const loading = ref(true);
const tab = ref<"all" | "unread">("all");

const TONES: Record<string, string> = {
  accent: "bg-accent-soft text-primary-500",
  success: "bg-success-soft text-success-DEFAULT",
  warning: "bg-amber-soft text-amber-DEFAULT",
  danger: "bg-danger-soft text-danger-DEFAULT",
  info: "bg-info-soft text-info-DEFAULT",
};

const unread = computed(() => items.value.filter((n) => !n.read).length);

const rows = computed(() =>
  tab.value === "unread" ? items.value.filter((n) => !n.read) : items.value,
);

const load = async () => {
  loading.value = true;
  const { data } = await safeRequest(() => studentService.notifications(), {
    showAlert: false,
  });
  items.value = data?.items ?? [];
  loading.value = false;
};

const markAll = async () => {
  if (!unread.value) return;
  await safeRequest(() => studentService.readNotifications(), {
    showAlert: false,
  });
  await load();
};

/** Mismo mapa que la campana: un `route.name` nuevo se muestra sin enlace. */
const ROUTES: Record<string, string> = {
  course: "classroom-course",
  certificates: "classroom-certificates",
};

const goTo = async (notification: NotificationDTO) => {
  if (!notification.read) {
    await safeRequest(() => studentService.readNotifications([notification]), {
      showAlert: false,
    });
    await load();
  }

  const name = ROUTES[notification.route.name];
  if (!name) return;

  router.push(
    notification.route.id
      ? { name, params: { id: notification.route.id } }
      : { name },
  );
};

onMounted(load);
</script>

<template>
  <div>
    <AulaPageHeader
      eyebrow="AVISOS"
      title="Notificaciones"
      sub="Cada aviso apunta a su registro de origen: una nota registrada, un material nuevo, un certificado emitido o un acta cerrada."
    >
      <template #actions>
        <ButtonCore
          class="!w-auto"
          severity="secondary"
          outlined
          label="Marcar todas como leídas"
          :disabled="!unread"
          @click="markAll"
        />
      </template>
    </AulaPageHeader>

    <!-- Tabs: el contador va en la etiqueta, como en el diseño. -->
    <div class="mb-4 flex gap-1">
      <button
        v-for="item in [
          { key: 'all', label: `Todas (${items.length})` },
          { key: 'unread', label: `Sin leer (${unread})` },
        ]"
        :key="item.key"
        type="button"
        class="cursor-pointer rounded-adm-sm px-3 py-1.5 text-adm-sm"
        :class="
          tab === item.key
            ? 'bg-accent-soft font-semibold text-primary-500'
            : 'text-secondary-500'
        "
        @click="tab = item.key as never"
      >
        {{ item.label }}
      </button>
    </div>

    <!-- Orden del diseño: carga → vacío → datos. -->
    <AulaSkeleton v-if="loading" kind="table" :rows="6" />

    <!--
      El texto del vacío depende del filtro: "no tienes avisos sin leer" dice
      algo muy distinto de "aún no tienes avisos".
    -->
    <AulaEmpty
      v-else-if="!rows.length"
      :title="
        tab === 'unread' ? 'No tienes avisos sin leer' : 'Aún no tienes avisos'
      "
      :sub="
        tab === 'unread'
          ? 'Estás al día con todo.'
          : 'Te avisamos cuando haya una nota nueva, un material o un certificado listo.'
      "
    />

    <AulaCard v-else class="!p-0">
      <button
        v-for="(notification, index) in rows"
        :key="`${notification.entity_type}-${notification.entity_id}-${index}`"
        type="button"
        class="flex w-full cursor-pointer items-start gap-3 border-b border-line-soft p-4 text-left last:border-b-0"
        :class="{ 'bg-accent-soft/20': !notification.read }"
        @click="goTo(notification)"
      >
        <span
          class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-adm-sm"
          :class="TONES[notification.tone] ?? TONES.accent"
        >
          <HeroCore :path="mdiBellOutline" class="size-4" />
        </span>

        <span class="min-w-0 flex-1">
          <span class="block text-adm-base font-semibold text-secondary-900">
            {{ notification.title }}
          </span>
          <span
            v-if="notification.body"
            class="mt-0.5 block text-adm-sm text-secondary-500"
          >
            {{ notification.body }}
          </span>
        </span>

        <span class="shrink-0 font-mono text-adm-xs text-secondary-400">
          {{ formatDate(notification.at, true) }}
        </span>
      </button>
    </AulaCard>

    <AulaNotice v-if="!loading" tone="info" class="mt-4">
      Los avisos se derivan de tus cursos: solo se guarda si los leíste, no el
      aviso en sí. Por eso aparecen y desaparecen con tu avance.
    </AulaNotice>
  </div>
</template>
