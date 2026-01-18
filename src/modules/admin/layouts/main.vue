<script setup lang="ts">
import { AvatarCore, ImageCore } from "@/shared/components";
import LayoutStructure from "@/modules/components/structure/index.vue";
import NavVertical from "../components/NavVertical/index.vue";
import Logo from "@/assets/fractal.png";
import authService from "../services/auth.service";
import { useUserStore } from "../stores/useUserStore";
import { onMounted } from "vue";
import Cookies from "js-cookie";
import { safeJsonParse, safeJsonStringify } from "@/shared/utils/safe-json";
import type { MeResponse } from "../models/auth.model";
import { cookieOptions } from "@/shared/config/cookie.config";

import {
  COOKIE_NAME_SESSION,
  COOKIE_NAME_EXPIRES,
  COOKIE_NAME_USER,
} from "@/shared/config/env.config";

const userStore = useUserStore();

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
        <AvatarCore
          :text="userStore.photo ?? userStore.fullName"
          shape="circle"
        />
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
</template>
