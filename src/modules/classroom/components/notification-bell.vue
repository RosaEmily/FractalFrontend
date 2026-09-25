<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { HeroCore } from "@/shared/components";
import { useClickOutsideMulti } from "@/shared/composables/useClickOutside";
import { safeRequest } from "@/shared/utils/request";
import { mdiBellOutline, mdiCheck } from "@mdi/js";
import studentService from "../services/student.service";
import teacherService from "../services/teacher.service";
import coordinatorService from "../services/coordinator.service";
import { useClassroomRole } from "../composables/useClassroomRole";
import type { NotificationDTO } from "../dto/classroom.dto";
import { AulaBar, AulaPill, AulaSpinner } from "./ui";
import {
  notificationIcon,
  notificationTarget,
  type NotificationAudience,
} from "../utils/notification-route";
import { formatDate } from "../utils/format";

const router = useRouter();

/**
 * Los TRES roles tienen avisos, cada uno con su endpoint:
 * `classroom/me/*` (alumno), `classroom/teacher/*` y `dashboard/*`
 * (coordinación, porque COORDINATOR no tiene endpoints propios en Classroom).
 *
 * Todos derivan sus avisos de las tablas reales y comparten la tabla
 * `notifications` solo para registrar lo leído, así que el contrato es el
 * mismo y el panel no cambia según quién mire.
 */
const { isStudent, isTeacher } = useClassroomRole();

/** Qué mapa de destinos aplica. */
const audience = computed<NotificationAudience>(() =>
  isStudent.value ? "student" : isTeacher.value ? "teacher" : "coordinator",
);

const open = ref(false);
const items = ref<NotificationDTO[]>([]);
const loading = ref(false);

const bellRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
useClickOutsideMulti([bellRef, panelRef], () => (open.value = false));

const unread = computed(() => items.value.filter((n) => !n.read).length);

const TONES: Record<string, string> = {
  accent: "bg-accent-soft text-primary-500",
  success: "bg-success-soft text-success-DEFAULT",
  warning: "bg-amber-soft text-amber-DEFAULT",
  danger: "bg-danger-soft text-danger-DEFAULT",
  info: "bg-info-soft text-info-DEFAULT",
};

/** El servicio del rol activo. */
const fetchNotifications = () => {
  if (isStudent.value) return studentService.notifications();
  if (isTeacher.value) return teacherService.notifications();

  return coordinatorService.notifications();
};

const load = async () => {
  loading.value = true;
  const { data } = await safeRequest(fetchNotifications, {
    showAlert: false,
  });
  items.value = data?.items ?? [];
  loading.value = false;
};

/**
 * Marca UNA como leída sin navegar.
 *
 * Revisar la bandeja y despacharla es una acción distinta de abrir el aviso:
 * obligar a entrar en cada uno para silenciarlo sería peor.
 */
const marking = ref<string | null>(null);

const toggleRead = async (notification: NotificationDTO) => {
  if (notification.read) return;

  marking.value = `${notification.entity_type}-${notification.entity_id}`;
  await safeRequest(() => markRead([notification]), { showAlert: false });
  marking.value = null;
  await load();
};

const markAll = async () => {
  if (!unread.value) return;

  await safeRequest(() => markRead(), { showAlert: false });
  await load();
};

/** Marca leídos contra el endpoint del rol. Los tres lo tienen. */
const markRead = (list?: NotificationDTO[]) => {
  if (isStudent.value) return studentService.readNotifications(list);
  if (isTeacher.value) return teacherService.readNotifications(list);

  return coordinatorService.readNotifications(list);
};

/**
 * Cada aviso lleva la ruta a la que pertenece. Se marca leído solo ese, no
 * todos: abrir uno no significa haber visto el resto.
 */
const goTo = async (notification: NotificationDTO) => {
  open.value = false;

  if (!notification.read) {
    await safeRequest(() => markRead([notification]), {
      showAlert: false,
    });
    await load();
  }

  const target = notificationTarget(notification, audience.value);

  if (target) router.push(target);
};

/** Abre la página completa de avisos y cierra el panel. */
const goToAll = () => {
  open.value = false;
  router.push({ name: "classroom-notifications" });
};

onMounted(load);
</script>

<template>
  <div class="relative">
    <button
      ref="bellRef"
      type="button"
      class="relative size-9.5 rounded-pill inline-flex items-center justify-center border cursor-pointer transition-colors"
      :class="
        open
          ? 'border-primary-500 bg-accent-soft'
          : 'border-line bg-surface-paper'
      "
      aria-label="Notificaciones"
      @click="open = !open"
    >
      <HeroCore
        :path="mdiBellOutline"
        class="size-4.5"
        :class="open ? 'text-primary-500' : 'text-secondary-500'"
      />
      <!-- El borde blanco separa el contador del icono -->
      <span
        v-if="unread"
        class="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-pill bg-primary-500 text-white font-mono text-adm-xs font-bold inline-flex items-center justify-center border-2 border-surface-paper"
      >
        {{ unread }}
      </span>
    </button>

    <transition name="fade-scale">
      <div
        v-if="open"
        ref="panelRef"
        class="absolute right-0 top-12 w-100 max-w-[calc(100vw-2rem)] bg-surface-paper border border-line rounded-adm-lg shadow-lg z-9999 overflow-hidden"
      >
        <div class="flex items-center gap-2.5 px-4 py-3.5">
          <span
            class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight"
          >
            Notificaciones
          </span>
          <AulaPill v-if="unread" tone="accent" size="sm">
            {{ unread }} sin leer
          </AulaPill>
          <button
            v-if="unread"
            type="button"
            class="ml-auto text-adm-sm font-semibold text-primary-600 cursor-pointer"
            @click="markAll"
          >
            Marcar todas
          </button>
        </div>

        <div class="max-h-105 overflow-y-auto border-t border-line-soft">
          <div v-if="loading" class="px-4 py-3 space-y-3">
            <div v-for="n in 3" :key="n" class="flex items-start gap-3">
              <AulaBar :w="32" :h="32" :r="8" />
              <span class="flex-1 min-w-0">
                <AulaBar w="70%" :h="12" />
                <AulaBar w="45%" :h="9" class="mt-2" />
              </span>
            </div>
          </div>

          <!--
            ⚠️ La fila NO es un botón: lleva DOS acciones —abrir el aviso y
            marcarlo leído— y un `<button>` no puede anidar otro. Era lo que
            dejaba el círculo sin poder clicarse en la campana.
          -->
          <div
            v-for="notification in items"
            :key="`${notification.entity_type}-${notification.entity_id}`"
            class="flex w-full items-start gap-3 border-b border-line-soft px-4 py-3 last:border-0"
            :class="notification.read ? '' : 'bg-accent-soft/40'"
          >
            <button
              type="button"
              class="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left"
              @click="goTo(notification)"
            >
            <span
              class="size-8.5 shrink-0 rounded-adm-sm inline-flex items-center justify-center"
              :class="TONES[notification.tone] ?? TONES.info"
            >
              <HeroCore :path="notificationIcon(notification)" class="size-4" />
            </span>
            <div class="min-w-0 flex-1">
              <!-- Título y hora en la MISMA línea, como el diseño (jsx:65). -->
              <div class="flex items-baseline gap-2">
                <p
                  class="min-w-0 flex-1 text-adm-md text-secondary-900"
                  :class="notification.read ? 'font-semibold' : 'font-bold'"
                >
                  {{ notification.title }}
                </p>
                <span
                  class="shrink-0 font-mono text-adm-xs whitespace-nowrap text-secondary-400"
                >
                  {{ formatDate(notification.at, true) }}
                </span>
              </div>
              <p
                v-if="notification.body"
                class="text-adm-sm text-secondary-500 mt-1 leading-relaxed"
              >
                {{ notification.body }}
              </p>
              <!-- Origen del aviso: en esta pantalla es contenido, no una nota. -->
              <span
                class="mt-1.5 inline-block font-mono text-adm-xs tracking-[0.04em] text-secondary-400 uppercase"
              >
                {{ notification.entity_type }}
              </span>
            </div>
            </button>

            <!--
              El círculo se queda SIEMPRE, con check verde al leerse: es lo que
              distingue un aviso despachado de uno pendiente. Desapareciendo,
              la fila leída se veía idéntica a una sin tocar.
            -->
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
                v-if="
                  marking === `${notification.entity_type}-${notification.entity_id}`
                "
                :size="11"
              />
              <HeroCore
                v-else-if="notification.read"
                :path="mdiCheck"
                class="size-3 text-white"
              />
            </button>
          </div>

          <p
            v-if="!loading && !items.length"
            class="text-adm-base text-secondary-500 px-4 py-6 text-center"
          >
            No tienes avisos por ahora.
          </p>
        </div>

        <!--
          Pie del panel: el panel solo muestra los últimos avisos, la página
          completa tiene los tabs Todas / Sin leer.
        -->
        <button
          type="button"
          class="w-full cursor-pointer border-t border-line bg-surface-cream py-3.5 text-center text-adm-sm font-semibold text-primary-600"
          @click="goToAll"
        >
          Ver todas las notificaciones
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s cubic-bezier(0.2, 0.7, 0.3, 1);
  transform-origin: top right;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
