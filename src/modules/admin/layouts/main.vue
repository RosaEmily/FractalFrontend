<script setup lang="ts">
import {
  AvatarCore,
  ImageCore,
  ModalConfirmationUi,
} from "@/shared/components";
import LayoutStructure from "@/modules/components/structure/index.vue";
import NavVertical from "../components/NavVertical/index.vue";
import Logo from "@/assets/fractal.png";
import authService from "../services/auth.service";
import { useUserStore } from "../stores/useUserStore";
import { onMounted, ref } from "vue";
import Cookies from "js-cookie";
import { safeJsonParse, safeJsonStringify } from "@/shared/utils/safe-json";
import type { MeResponse } from "../models/auth.model";
import { cookieOptions } from "@/shared/config/cookie.config";
import { useRouter } from "vue-router";
import { MENU_LAYOUT } from "../constants/layout";
import {
  COOKIE_NAME_SESSION,
  COOKIE_NAME_EXPIRES,
  COOKIE_NAME_USER,
} from "@/shared/config/env.config";
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
  if (item.redirect) {
    router.push({ name: item.to });
  } else {
    if (item.name == "logout") {
      logoutEnable.value = true;
    }
  }
};

const logout = async () => {
  logoutLoading.value = true;
  await authService.logout();
  Cookies.remove(COOKIE_NAME_SESSION);
  Cookies.remove(COOKIE_NAME_EXPIRES);
  Cookies.remove(COOKIE_NAME_USER);
  router.push({ name: "login" });
  logoutLoading.value = false;
  logoutEnable.value = false;
};

onMounted(async () => {
  const token = Cookies.get(COOKIE_NAME_SESSION);
  const expires_at = Cookies.get(COOKIE_NAME_EXPIRES);
  if (token) {
    let user = safeJsonParse<MeResponse>(Cookies.get(COOKIE_NAME_USER));
    if (!user) {
      user = await authService.me();
      const expires = expires_at
        ? new Date(expires_at)
        : new Date(Date.now() + 60 * 60 * 1000);
      Cookies.set(COOKIE_NAME_USER, safeJsonStringify(user), {
        expires,
        ...cookieOptions,
      });
    }
    if (user) {
      const { first_name, last_name, photo_url, roles } = user as MeResponse;
      userStore.setUserData({
        firstName: first_name,
        lastName: last_name,
        photo: photo_url,
        role: roles[0] ?? "",
      });
    }
  }
});
</script>
<template>
  <div class="h-dvh flex flex-col w-full">
    <header
      class="w-full sticky top-0 z-50 px-4 py-2 flex items-center justify-between shadow-card-sm"
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
            class="absolute shadow-card-sm right-0 top-14 bg-white w-48 p-2 space-y-2 z-[9999] rounded-bl-lg shadow-lg"
          >
            <div
              v-for="(item, index) in MENU_LAYOUT"
              :key="index"
              @click="onRedirect(item)"
              class="p-2 group rounded-lg hover:bg-gray-300 cursor-pointer"
            >
              {{ item.label }}
            </div>
          </div>
        </transition>
      </div>
    </header>
    <LayoutStructure :show-container-footer="false" :show-right="false">
      <template #left>
        <NavVertical
          :avatar="userStore.photo ?? userStore.fullName"
          :full-name="userStore.fullName"
          :role="userStore.role"
        />
      </template>
      <section class="pb-5">
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
