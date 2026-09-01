<script lang="ts" setup>
import { z } from "zod";
import { useFormFields } from "@/shared/composables/useFormFields";
import {
  InputPasswordCore,
  InputTextCore,
  ButtonCore,
  MessageCore,
  HeroCore,
  ImageCore,
} from "@/shared/components";
import authService from "../services/auth.service";
import { useToastStore } from "@/shared/stores/useToastStore";
import { safeRequest } from "@/shared/utils/request";
import { clearSession } from "@/shared/utils/session";
import { onMounted, ref } from "vue";
import Cookies from "js-cookie";
import { useRoute, useRouter } from "vue-router";
import { cookieOptions } from "@/shared/config/cookie.config";
import {
  COOKIE_NAME_SESSION,
  COOKIE_NAME_EXPIRES,
} from "@/shared/config/env.config";
import {
  mdiShieldCheckOutline,
  mdiClipboardTextClockOutline,
  mdiDevices,
  mdiArrowRight,
  mdiInformationOutline,
} from "@mdi/js";
import Logo from "@/assets/fractal.png";
import { LOGIN_FEATURES, LOGIN_SUPPORT_EMAIL } from "../constants/login";

const toastStore = useToastStore();
const route = useRoute();
const router = useRouter();

const loading = ref<boolean>(false);
const messageError = ref<string | null>(null);

/*
 * Al llegar al login no debe quedar rastro de la sesión anterior: si se entró
 * por un token vencido, la cookie de usuario podría sobrevivir y el layout la
 * tomaría como válida sin volver a consultar `auth/me`.
 */
onMounted(() => {
  clearSession();
});

/** Iconos de las capacidades del panel, en el orden de LOGIN_FEATURES. */
const FEATURE_ICONS = [
  mdiShieldCheckOutline,
  mdiClipboardTextClockOutline,
  mdiDevices,
];

/*
 * El login NO valida la política de contraseñas (largo mínimo, etc.): sería
 * revelarle al atacante la forma de las credenciales válidas. Solo se exige
 * que el campo no venga vacío; de la credencial se encarga la API.
 */
const loginSchema = z.object({
  email: z.string().min(1, "Ingresa tu correo").email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

const { fields, handleSubmit, errors } = useFormFields<{
  email: string;
  password: string;
}>({
  initialValues: {
    email: "",
    password: "",
  },
  schema: loginSchema,
});

const onSubmit = handleSubmit(async (values) => {
  try {
    loading.value = true;
    messageError.value = null;
    const { data, status, error } = await safeRequest(
      () => {
        return authService.login(values);
      },
      { showAlert: false },
    );

    if (!status && error) {
      messageError.value = error.message;
      return;
    }
    if (data) {
      const { token, expires_at } = data;
      Cookies.set(COOKIE_NAME_SESSION, token, {
        expires: new Date(expires_at),
        ...cookieOptions,
      });
      Cookies.set(COOKIE_NAME_EXPIRES, expires_at, {
        expires: new Date(expires_at),
        ...cookieOptions,
      });
      toastStore.showToastSuccess({
        detail: "Se ha iniciado sesión correctamente.",
      });
      const redirect = route.query.redirect as string | undefined;
      if (redirect) {
        router.replace(redirect);
      } else {
        router.replace({ name: "admin-home" });
      }
    }
  } catch (error) {
    console.log("error", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-dvh flex flex-col bg-admin-bg">
    <!-- Franja de seguridad: el diseño la usa para dar contexto de acceso -->
    <div
      class="bg-secondary-900 text-white px-7 py-2 flex items-center justify-between font-mono text-adm-xs tracking-[0.08em]"
    >
      <span class="inline-flex items-center gap-2">
        <span class="size-1.5 rounded-pill bg-success-DEFAULT" />
        CONEXIÓN SEGURA · HTTPS
      </span>
      <span class="text-white/70">UTC-5 / LIMA</span>
    </div>

    <div class="flex-1 grid lg:grid-cols-[1.1fr_1fr] min-h-0">
      <!-- ── Panel de marca ─────────────────────────────────────────── -->
      <aside
        class="hidden lg:flex relative overflow-hidden bg-admin-pane border-r border-line px-14 pt-14 pb-10 flex-col"
      >
        <!-- retícula tipo plano, marca de la casa -->
        <div class="pointer-events-none absolute inset-0 opacity-50 login-grid" />

        <div class="relative">
          <ImageCore image-class="h-10" :src="Logo" />
        </div>

        <div class="relative mt-auto max-w-120">
          <span class="font-mono text-adm-xs text-secondary-500 tracking-[0.08em]">
            PANEL ADMINISTRATIVO · ACCESO RESTRINGIDO
          </span>
          <h1
            class="font-display text-5xl font-bold leading-none tracking-tight mt-3.5 mb-btn-x-sm text-secondary-900"
          >
            Gestiona Fractal Studio con la información correcta.
          </h1>
          <p class="text-[0.938rem] leading-relaxed text-secondary-500 mb-8">
            Catálogo, cohortes, matrículas, notas y certificados en un solo
            lugar. Acceso limitado al personal autorizado por el Centro Autodesk
            ATC.
          </p>

          <ul class="flex flex-col gap-2.5">
            <li
              v-for="(feature, index) in LOGIN_FEATURES"
              :key="feature"
              class="flex items-center gap-3 text-adm-base text-secondary-900"
            >
              <span
                class="size-7 shrink-0 rounded-adm-sm bg-accent-soft text-primary-500 inline-flex items-center justify-center"
              >
                <HeroCore :path="FEATURE_ICONS[index]" class="size-3.5" />
              </span>
              {{ feature }}
            </li>
          </ul>
        </div>

        <div
          class="relative mt-10 pt-btn-x border-t border-line flex justify-between items-center font-mono text-adm-xs text-secondary-400 tracking-[0.06em]"
        >
          <span>© {{ new Date().getFullYear() }} FRACTAL STUDIO S.A.C.</span>
        </div>
      </aside>

      <!-- ── Formulario ─────────────────────────────────────────────── -->
      <main
        class="bg-surface-paper px-6 py-12 sm:px-16 flex flex-col justify-center"
      >
        <div class="w-full max-w-105 mx-auto">
          <!-- El logo solo aquí cuando no hay panel de marca -->
          <ImageCore image-class="h-9 mb-8 lg:hidden" :src="Logo" />

          <span class="font-mono text-adm-xs text-secondary-400 tracking-widest">
            FORMULARIO DE ACCESO
          </span>
          <h2
            class="font-display text-[2rem] font-bold text-secondary-900 mt-2.5 mb-1.5 tracking-tight leading-none"
          >
            Iniciar sesión
          </h2>
          <p class="text-adm-md text-secondary-500 mb-7">
            Ingresa con tus credenciales de administrador.
          </p>

          <form class="space-y-4" @submit.prevent="onSubmit">
            <MessageCore
              v-if="messageError"
              :text="messageError"
              severity="error"
            />
            <InputTextCore
              v-model="fields.email.value"
              label="Correo institucional"
              required
              placeholder="usuario@proyectofractal.com"
              :invalid="!!errors.email"
              :message-error="errors.email"
            />
            <InputPasswordCore
              v-model="fields.password.value"
              label="Contraseña"
              required
              placeholder="••••••••••••"
              :invalid="!!errors.password"
              :message-error="errors.password"
            />
            <!--
              El label va como prop, no por slot: sin `label` PrimeVue trata al
              botón como icon-only (cuadrado de ancho fijo) y, con el radio
              pill del preset, se deforma en un círculo.
            -->
            <ButtonCore
              type="submit"
              label="Acceder al panel"
              icon-pos="right"
              :loading="loading"
            >
              <template #icon>
                <HeroCore :path="mdiArrowRight" class="size-3.5" />
              </template>
            </ButtonCore>
          </form>

          <!-- Regla real del sistema: el login falla al superar el límite -->
          <p
            class="flex items-start gap-2 mt-3.5 text-adm-sm text-secondary-400 leading-relaxed"
          >
            <HeroCore :path="mdiDevices" class="size-3.5 shrink-0 mt-0.5" />
            Tu cuenta permite un número limitado de sesiones abiertas a la vez.
            Al llegar al límite deberás cerrar una desde otro dispositivo.
          </p>

          <div
            class="mt-6 px-3.5 py-3 bg-accent-soft border border-accent-tint rounded-adm-sm flex items-start gap-2.5"
          >
            <HeroCore
              :path="mdiInformationOutline"
              class="size-3.5 shrink-0 mt-0.5 text-primary-500"
            />
            <p class="text-adm-sm text-primary-600 leading-relaxed">
              ¿Problemas para acceder? Contacta a TI:
              <strong>{{ LOGIN_SUPPORT_EMAIL }}</strong>
            </p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Retícula del panel de marca: patrón puntual, no reutilizable como token. */
.login-grid {
  background-image:
    linear-gradient(color-mix(in srgb, var(--color-secondary-900) 5%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--color-secondary-900) 5%, transparent) 1px, transparent 1px);
  background-size: 2rem 2rem;
}
</style>
