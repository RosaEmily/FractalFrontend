<script setup lang="ts">
import {
  AvatarCore,
  HeroCore,
  ImageCore,
  ModalConfirmationUi,
} from "@/shared/components";
import LayoutStructure from "@/modules/components/structure/index.vue";
import NavVertical from "../components/NavVertical/index.vue";
import Logo from "@/assets/fractal.png";
import authService from "../services/auth.service";
import { useUserStore } from "../stores/useUserStore";
import { onMounted, ref } from "vue";
import { safeJsonParse, safeJsonStringify } from "@/shared/utils/safe-json";
import {
  clearSession,
  getSessionExpires,
  getSessionUserRaw,
  hasSession,
  roleNames,
  setSessionUser,
} from "@/shared/utils/session";
import { safeRequest } from "@/shared/utils/request";
import type { MeResponse } from "../models/auth.model";
import { useRouter } from "vue-router";
import { MENU_LAYOUT } from "../constants/layout";
import { useClickOutsideMulti } from "@/shared/composables/useClickOutside";
import type { MenuLayout } from "@/shared/interface/layout";

const router = useRouter();
const userStore = useUserStore();

const openMenu = ref<boolean>(false);
const menuRef = ref<HTMLElement | null>(null);
const logoutEnable = ref<boolean>(false);
const logoutLoading = ref<boolean>(false);

useClickOutsideMulti(menuRef, () => {
  openMenu.value = false;
});

const onRedirect = async (item: MenuLayout) => {
  openMenu.value = false;
  if (item.redirect) {
    router.push({ name: item.to, query: item.query });
  } else {
    if (item.name == "logout") {
      logoutEnable.value = true;
    }
  }
};

const logout = async () => {
  logoutLoading.value = true;
  // Si el token ya venció, el logout responde 401 y el interceptor se encarga;
  // no debe impedir que se limpie la sesión local.
  await safeRequest(() => authService.logout(), { showAlert: false });
  // Solo la del panel: si el usuario tiene el aula abierta en otra pestaña, esa
  // sesión sigue siendo válida y el backend tampoco la cierra.
  clearSession("admin");
  router.push({ name: "login" });
  logoutLoading.value = false;
  logoutEnable.value = false;
};

onMounted(async () => {
  const expires_at = getSessionExpires("admin");

  /*
   * El token es HttpOnly: no se puede leer desde JS. La cookie de perfil DEL
   * PANEL es la única señal de sesión disponible acá; la verdad la tiene la
   * API. Se consulta explícitamente la del panel: este layout solo se monta
   * bajo `/admin`, y una sesión de aula no debe darle nada por válido.
   */
  if (hasSession("admin")) {
    let user = safeJsonParse<MeResponse>(getSessionUserRaw("admin"));
    if (!user) {
      // Si el token está vencido esto responde 401: el interceptor ya limpió
      // la sesión y redirige al login, así que no hay que cachear la falla.
      const { data } = await safeRequest(() => authService.me(), {
        showAlert: false,
      });
      if (!data) return;

      user = data;
      setSessionUser(
        "admin",
        safeJsonStringify(user),
        expires_at ?? new Date(Date.now() + 60 * 60 * 1000),
      );
    }
    if (user) {
      const { first_name, last_name, photo_url, roles, email } =
        user as MeResponse;
      userStore.setUserData({
        firstName: first_name,
        lastName: last_name,
        photo: photo_url,
        email,
        // `roles` llega como objetos {name, description}: sin normalizar, el
        // store guardaría el objeto entero donde espera el nombre del rol.
        role: roleNames(roles)[0] ?? "",
        // La lista completa: el menú se filtra con TODOS los roles, no solo
        // con el principal (un usuario puede ser ADMIN y COORDINATOR).
        roles: roleNames(roles),
      });
    }
  }
});
</script>
<template>
  <div class="h-dvh flex flex-col w-full bg-admin-bg">
    <header
      class="w-full sticky top-0 z-50 px-7 py-3.5 flex items-center justify-between bg-surface-paper border-b border-line"
    >
      <div>
        <ImageCore image-class="h-10" :src="Logo" />
      </div>
      <div>
        <div ref="menuRef" class="cursor-pointer" @click="openMenu = !openMenu">
          <AvatarCore
            :text="userStore.photo ?? userStore.fullName"
            shape="circle"
          />
        </div>
        <transition name="fade-scale">
          <div
            v-if="openMenu"
            class="absolute right-7 top-16 bg-surface-paper border border-line min-w-[16rem] p-1.5 z-[9999] rounded-adm-md shadow-lg"
          >
            <!-- Cabecera con la identidad del usuario -->
            <div
              class="px-3.5 pt-3.5 pb-3 border-b border-line-soft flex items-center gap-3"
            >
              <AvatarCore
                :text="userStore.photo ?? userStore.fullName"
                shape="circle"
              />
              <div class="min-w-0 flex-1">
                <div
                  class="font-display text-adm-base font-bold text-secondary-900 tracking-tight truncate"
                >
                  {{ userStore.fullName }}
                </div>
                <div class="text-adm-sm text-secondary-500 truncate mt-0.5">
                  {{ userStore.email }}
                </div>
              </div>
              <span
                v-if="userStore.role"
                class="font-mono text-adm-xs text-primary-500 px-1.5 py-0.5 bg-accent-soft rounded-adm-sm tracking-wider font-bold shrink-0"
              >
                {{ userStore.role }}
              </span>
            </div>

            <div class="py-1.5">
              <template v-for="(item, index) in MENU_LAYOUT" :key="index">
                <template v-if="item.name !== 'logout'">
                  <div
                    @click="onRedirect(item)"
                    class="adm-nav-item flex items-center gap-2.5 px-3.5 py-2.5 rounded-adm-sm cursor-pointer text-adm-base text-secondary-900"
                  >
                    <HeroCore
                      :path="item.icon"
                      class="size-4 text-secondary-500"
                    />
                    <span class="flex-1">{{ item.label }}</span>
                    <span
                      v-if="item.hint"
                      class="font-mono text-adm-xs text-secondary-400"
                    >
                      {{ item.hint }}
                    </span>
                  </div>
                </template>
              </template>
            </div>

            <div class="h-px bg-line-soft mx-1.5" />

            <div
              v-for="item in MENU_LAYOUT.filter((i) => i.name === 'logout')"
              :key="item.name"
              @click="onRedirect(item)"
              class="adm-nav-item flex items-center gap-2.5 px-3.5 py-2.5 mt-1.5 rounded-adm-sm cursor-pointer text-adm-base text-danger-DEFAULT font-semibold"
            >
              <HeroCore :path="item.icon" class="size-4" />
              {{ item.label }}
            </div>
          </div>
        </transition>
      </div>
    </header>
    <LayoutStructure
      :show-container-footer="false"
      :show-right="false"
      class-main="!bg-admin-bg"
      class-container="!px-6 !py-6 !mr-0 !my-0"
    >
      <template #left>
        <NavVertical
          :avatar="userStore.photo ?? userStore.fullName"
          :full-name="userStore.fullName"
          :role="userStore.role"
        />
      </template>
      <section class="size-full">
        <router-view />
      </section>
    </LayoutStructure>
  </div>
  <ModalConfirmationUi
    v-model="logoutEnable"
    title="Cerrar sesión"
    description="¿Estás seguro de que deseas cerrar tu sesión? Tendrás que volver a iniciar sesión para continuar."
    description-class="text-center"
    :button-cancel="{ label: 'No' }"
    :button-confirm="{ label: 'Si', loading: logoutLoading }"
    @cancel="logoutEnable = false"
    @confirm="logout"
  />
</template>
