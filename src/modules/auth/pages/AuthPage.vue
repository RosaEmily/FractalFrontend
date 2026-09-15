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
import { clearSession, roleNames, setSessionUser } from "@/shared/utils/session";
import { ErrorCode } from "@/shared/constants/error-code";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { safeJsonStringify } from "@/shared/utils/safe-json";
import meService from "@/modules/admin/services/auth.service";
import {
  mdiShieldCheckOutline,
  mdiClipboardTextClockOutline,
  mdiDevices,
  mdiArrowRight,
  mdiInformationOutline,
} from "@mdi/js";
import Logo from "@/assets/fractal.png";
import {
  CLASSROOM_ACCESS_NOTE,
  LOGIN_SUPPORT_EMAIL,
  LOGIN_VARIANTS,
  type LoginVariantKey,
} from "../constants/login";

const toastStore = useToastStore();
const route = useRoute();
const router = useRouter();

const loading = ref<boolean>(false);
const messageError = ref<string | null>(null);

/**
 * Qué puerta es esta. La ruta lo declara en `meta.loginVariant`; sin el dato
 * se asume el panel, que es la ruta histórica.
 */
const variant = computed(
  () => LOGIN_VARIANTS[(route.meta.loginVariant as LoginVariantKey) ?? "admin"],
);

/*
 * Al llegar al login no debe quedar rastro de la sesión anterior DE ESTA ZONA:
 * si se entró por un token vencido, la cookie de perfil podría sobrevivir y el
 * layout la tomaría como válida sin volver a consultar `auth/me`.
 *
 * Se limpia solo la de esta puerta: quien abre el login del panel puede tener
 * el aula abierta en otra pestaña, y borrársela lo dejaría fuera de una sesión
 * que el backend mantiene perfectamente viva.
 */
onMounted(() => {
  clearSession(variant.value.zone);
});

const isClassroom = computed(() => variant.value.stats !== undefined);

/** Iconos de las capacidades del panel, en el orden de `features`. */
const FEATURE_ICONS = [
  mdiShieldCheckOutline,
  mdiClipboardTextClockOutline,
  mdiDevices,
];

/** Rol que entró por la puerta equivocada; corta el acceso y ofrece la otra. */
const wrongDoor = ref(false);

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
    wrongDoor.value = false;
    /*
     * La zona decide qué cookie emite el backend y qué roles admite. El rechazo
     * por puerta equivocada lo resuelve la API con un 403: acá ya no se
     * comprueba el rol después de tener sesión abierta.
     */
    const { data, status, error } = await safeRequest(
      () => authService.login({ ...values, zone: variant.value.zone }),
      { showAlert: false },
    );

    if (!status && error) {
      /*
       * ⚠️ Dos errores distintos viajan como 403, y tratarlos igual confundía:
       * quedarse sin cupo de sesiones mostraba el cartel de "puerta
       * equivocada", que le dice al usuario que entre por la otra zona —
       * justo lo que NO resuelve su problema.
       */
      if (error.code === ErrorCode.INSUFFICIENT_PERMISSIONS) {
        wrongDoor.value = true;
        return;
      }

      /*
       * El cupo de sesiones es lo único que el usuario puede resolver por su
       * cuenta, así que el mensaje dice cómo: el propio backend lo explica, y
       * acá se agrega dónde hacerlo dentro de la app.
       */
      if (error.code === ErrorCode.MAX_SESSIONS_EXCEEDED) {
        messageError.value = `${error.message} También puedes cerrarlas desde Mi cuenta → Sesiones activas.`;
        return;
      }

      messageError.value = error.message;
      return;
    }

    if (data) {
      const { expires_at } = data;

      /*
       * El perfil se carga acá, antes de navegar: el guard del router lee los
       * roles de esta cookie, así que si se dejara para el layout de destino
       * la primera navegación correría sin roles y caería en 403.
       */
      const { data: user } = await safeRequest(() => meService.me(), {
        showAlert: false,
      });

      /*
       * Sin perfil no se puede decidir el destino ni comprobar el rol, así que
       * la sesión se descarta: dejar el token puesto llevaría al usuario a una
       * zona donde cada petición respondería 401.
       */
      if (!user) {
        clearSession(variant.value.zone);
        messageError.value =
          "No pudimos cargar tu perfil. Vuelve a intentarlo en unos segundos.";
        return;
      }

      /*
       * El perfil que llega tiene que corresponder a ESTA puerta. La API ya
       * rechaza la zona equivocada al autenticar, así que esto solo se cumple
       * si `auth/me` resolvió una sesión distinta de la recién creada.
       *
       * Pasó de verdad: mientras el backend elegía mal entre las dos cookies
       * (ver `X-Fractal-Zone`), entrar al aula guardaba el perfil del ADMIN
       * bajo la cookie del aula, y el guard rebotaba cada pantalla del alumno.
       *
       * Guardar un perfil ajeno deja al usuario encerrado, así que se descarta
       * la sesión en vez de persistirla.
       */
      const userRoles = roleNames(user.roles);

      if (!userRoles.some((role) => variant.value.roles.includes(role))) {
        clearSession(variant.value.zone);
        messageError.value =
          "No pudimos confirmar tu acceso a esta zona. Vuelve a intentarlo.";
        return;
      }

      /*
       * El TOKEN no se guarda: viaja en una cookie HttpOnly que puso el
       * backend y que este código no puede leer. Acá solo van el perfil y la
       * caducidad, bajo el nombre de ESTA zona — así el panel y el aula pueden
       * estar abiertos a la vez sin pisarse el perfil, igual que ya ocurre con
       * las dos cookies de sesión del backend.
       */
      setSessionUser(variant.value.zone, safeJsonStringify(user), expires_at);

      toastStore.showToastSuccess({
        detail: "Se ha iniciado sesión correctamente.",
      });

      const redirect = route.query.redirect as string | undefined;
      if (redirect) {
        router.replace(redirect);
      } else {
        router.replace({ name: variant.value.redirectTo });
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
            {{ variant.eyebrow }}
          </span>
          <h1
            class="font-display text-5xl font-bold leading-none tracking-tight mt-3.5 mb-btn-x-sm text-secondary-900"
          >
            {{ variant.headline }}
          </h1>
          <p class="text-[0.938rem] leading-relaxed text-secondary-500 mb-8">
            {{ variant.intro }}
          </p>

          <!-- El panel lista capacidades; el aula, las cifras de la academia -->
          <ul v-if="variant.features" class="flex flex-col gap-2.5">
            <li
              v-for="(feature, index) in variant.features"
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

          <div v-else-if="variant.stats" class="flex gap-8">
            <div v-for="stat in variant.stats" :key="stat.label">
              <div
                class="font-display text-3xl font-extrabold tracking-tight text-secondary-900"
              >
                {{ stat.value }}
              </div>
              <div
                class="font-mono text-adm-xs text-secondary-400 tracking-[0.06em] uppercase mt-0.5"
              >
                {{ stat.label }}
              </div>
            </div>
          </div>
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
            {{ variant.formTitle }}
          </h2>
          <p class="text-adm-md text-secondary-500 mb-7">
            {{ variant.formIntro }}
          </p>

          <!--
            Puerta equivocada: la credencial es válida pero el rol es de la otra
            zona. Se ofrece el enlace en vez de dejarlo en un 403 sin salida.
          -->
          <div
            v-if="wrongDoor"
            class="mb-5 px-3.5 py-3 bg-danger-soft border border-danger-DEFAULT/25 rounded-adm-sm"
          >
            <p class="text-adm-sm text-danger-DEFAULT leading-relaxed">
              {{ variant.wrongDoorMessage }}
            </p>
            <RouterLink
              :to="{ name: variant.wrongDoorLink.to }"
              class="inline-flex items-center gap-1.5 mt-2 font-mono text-adm-xs text-danger-DEFAULT underline underline-offset-2"
            >
              {{ variant.wrongDoorLink.label }}
              <HeroCore :path="mdiArrowRight" class="size-3" />
            </RouterLink>
          </div>

          <form class="space-y-4" @submit.prevent="onSubmit">
            <MessageCore
              v-if="messageError"
              :text="messageError"
              severity="error"
            />
            <InputTextCore
              v-model="fields.email.value"
              :label="isClassroom ? 'Correo electrónico' : 'Correo institucional'"
              required
              :placeholder="
                isClassroom
                  ? 'tucorreo@gmail.com'
                  : 'usuario@proyectofractal.com'
              "
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
              :label="isClassroom ? 'Entrar al aula' : 'Acceder al panel'"
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
              <template v-if="isClassroom">
                {{ CLASSROOM_ACCESS_NOTE }}
              </template>
              <template v-else>
                ¿Problemas para acceder? Contacta a TI:
                <strong>{{ LOGIN_SUPPORT_EMAIL }}</strong>
              </template>
            </p>
          </div>

          <!-- El aula no tiene registro: la matrícula es la que abre la cuenta -->
          <RouterLink
            v-if="isClassroom"
            :to="{ name: 'programs' }"
            class="inline-flex items-center gap-1.5 mt-5 text-adm-sm text-primary-500 hover:opacity-70"
          >
            Ver programas y matricularme
            <HeroCore :path="mdiArrowRight" class="size-3.5" />
          </RouterLink>
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
