<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { mdiCheck } from "@mdi/js";

import { HeroCore, ButtonCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import studentService from "../services/student.service";
import teacherService from "../services/teacher.service";
import coordinatorService from "../services/coordinator.service";
import { useClassroomRole } from "../composables/useClassroomRole";
import type { NotificationDTO } from "../dto/classroom.dto";
import {
  AulaCard,
  AulaEmpty,
  AulaNotice,
  AulaPageHeader,
  AulaSkeleton,
  AulaSpinner,
} from "../components/ui";
import { formatDate } from "../utils/format";
import {
  notificationIcon,
  notificationTarget,
  type NotificationAudience,
} from "../utils/notification-route";

/**
 * Los tres roles tienen avisos, cada uno con su endpoint. Misma resolución que
 * en la campana (`notification-bell.vue`): el contrato es idéntico, solo
 * cambia de dónde vienen.
 */
const { isStudent, isTeacher } = useClassroomRole();

const fetchNotifications = () => {
  if (isStudent.value) return studentService.notifications();
  if (isTeacher.value) return teacherService.notifications();

  return coordinatorService.notifications();
};

/** Marca leídos contra el endpoint del rol. Los tres lo tienen. */
const markRead = (list?: NotificationDTO[]) => {
  if (isStudent.value) return studentService.readNotifications(list);
  if (isTeacher.value) return teacherService.readNotifications(list);

  return coordinatorService.readNotifications(list);
};

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

/**
 * Marca UNA notificación como leída sin navegar.
 *
 * El diseño pone un círculo por fila (notify.jsx:72): revisar la lista y
 * despacharla es una acción distinta de abrir el aviso, y obligar a entrar en
 * cada uno para silenciarlo sería peor.
 */
const marking = ref<string | null>(null);

const toggleRead = async (notification: NotificationDTO) => {
  if (notification.read) return;

  const key = `${notification.entity_type}-${notification.entity_id}`;
  marking.value = key;
  await safeRequest(() => markRead([notification]), { showAlert: false });
  marking.value = null;
  await load();
};

const rows = computed(() =>
  tab.value === "unread" ? items.value.filter((n) => !n.read) : items.value,
);

const load = async () => {
  loading.value = true;
  const { data } = await safeRequest(fetchNotifications, {
    showAlert: false,
  });
  items.value = data?.items ?? [];
  loading.value = false;
};

const markAll = async () => {
  if (!unread.value) return;
  await safeRequest(() => markRead(), {
    showAlert: false,
  });
  await load();
};

/** Qué mapa de destinos aplica. Mismo helper que usa la campana. */
const audience = computed<NotificationAudience>(() =>
  isStudent.value ? "student" : isTeacher.value ? "teacher" : "coordinator",
);

const goTo = async (notification: NotificationDTO) => {
  if (!notification.read) {
    await safeRequest(() => markRead([notification]), {
      showAlert: false,
    });
    await load();
  }

  const target = notificationTarget(notification, audience.value);

  if (target) router.push(target);
};

onMounted(load);
</script>

<template>
  <div>
    <AulaPageHeader
      eyebrow="AVISOS"
      title="Notificaciones"
      sub="Cada aviso apunta a su registro de origen: una clase creada, una asistencia marcada, una nota registrada, un acta cerrada, un pago confirmado."
    >
      <template #actions>
        <!--
          `soft` del diseño (notify.jsx:130), no `outlined`: relleno tenue del
          acento. La misma variante del botón "Editar" del perfil y de "Marcar
          como dictada" — vive en `style.css` como `.v3-btn-soft`.
        -->
        <ButtonCore
          class="!w-auto v3-btn-soft"
          size="small"
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
      <!--
        ⚠️ La fila NO es un botón: contiene dos acciones distintas —abrir el
        aviso y marcarlo leído— y un `<button>` no puede anidar otro.
      -->
      <div
        v-for="(notification, index) in rows"
        :key="`${notification.entity_type}-${notification.entity_id}-${index}`"
        class="flex w-full items-start gap-3 border-b border-line-soft px-4.5 py-4 last:border-b-0"
        :class="{ 'bg-accent-soft/30': !notification.read }"
      >
        <button
          type="button"
          class="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left"
          @click="goTo(notification)"
        >
          <span
            class="grid size-8.5 shrink-0 place-items-center rounded-adm-sm"
            :class="TONES[notification.tone] ?? TONES.accent"
          >
            <HeroCore :path="notificationIcon(notification)" class="size-4.5" />
          </span>

          <span class="min-w-0 flex-1">
            <!-- Título y hora en la MISMA línea, como el diseño (jsx:65). -->
            <span class="flex items-baseline gap-2">
              <span
                class="min-w-0 flex-1 text-adm-md text-secondary-900"
                :class="notification.read ? 'font-semibold' : 'font-bold'"
              >
                {{ notification.title }}
              </span>
              <span
                class="shrink-0 font-mono text-adm-xs whitespace-nowrap text-secondary-400"
              >
                {{ formatDate(notification.at, true) }}
              </span>
            </span>

            <span
              v-if="notification.body"
              class="mt-1 block text-adm-base leading-relaxed text-secondary-500"
            >
              {{ notification.body }}
            </span>

            <!--
              El ORIGEN del aviso. Acá sí va, a diferencia del buscador: el
              diseño lo trata como contenido de la fila y esta pantalla explica
              justamente de qué registro sale cada aviso.
            -->
            <span
              class="mt-1.5 inline-block font-mono text-adm-xs tracking-[0.04em] text-secondary-400 uppercase"
            >
              {{ notification.entity_type }}
            </span>
          </span>
        </button>

        <!-- Marcar leída sin abrir: revisar la lista es otra acción. -->
        <button
          type="button"
          class="mt-1.5 grid size-5 shrink-0 place-items-center rounded-pill border-[1.5px] transition-colors"
          :class="
            notification.read
              ? 'border-success-DEFAULT bg-success-DEFAULT'
              : 'cursor-pointer border-primary-500'
          "
          :disabled="notification.read"
          :title="notification.read ? 'Leída' : 'Marcar como leída'"
          @click="toggleRead(notification)"
        >
          <AulaSpinner
            v-if="marking === `${notification.entity_type}-${notification.entity_id}`"
            :size="11"
          />
          <HeroCore
            v-else-if="notification.read"
            :path="mdiCheck"
            class="size-3 text-white"
          />
        </button>
      </div>
    </AulaCard>

    <AulaNotice v-if="!loading" tone="info" class="mt-4">
      Los avisos se derivan de tus cursos: solo se guarda si los leíste, no el
      aviso en sí. Por eso aparecen y desaparecen con tu avance.
    </AulaNotice>
  </div>
</template>
