<script lang="ts" setup>
import { z } from "zod";
import { useFormFields } from "@/shared/composables/useFormFields";
import {
  InputPasswordCore,
  InputTextCore,
  ButtonCore,
  MessageCore,
} from "@/shared/components";
import authService from "../services/auth.service";
import { useToastStore } from "@/shared/stores/useToastStore";
import { safeRequest } from "@/shared/utils/request";
import { ref } from "vue";
import Cookies from "js-cookie";
import { useRoute, useRouter } from "vue-router";

const { VITE_COOKIE_NAME_SESSION } = import.meta.env;

const toastStore = useToastStore();
const route = useRoute();
const router = useRouter();

const loading = ref<boolean>(false);
const messageError = ref<string | null>(null);

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const { fields, handleSubmit, errors } = useFormFields<{
  email: string;
  password: string;
}>({
  initialValues: {
    email: "admin@fractal.com",
    password: "password",
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
      { showAlert: false }
    );

    if (!status && error) {
      messageError.value = error.message;
      return;
    }
    if (data) {
      const { token, expires_at } = data;
      Cookies.set(VITE_COOKIE_NAME_SESSION, token, {
        expires: new Date(expires_at),
        path: "/",
        secure: location.protocol === "https:",
        sameSite: "lax",
      });
      toastStore.showToastSuccess({
        detail: "Se ha iniciado sesión correctamente.",
      });
      const redirect = route.query.redirect as string | undefined;
      if (redirect) {
        router.replace(redirect);
      } else {
        router.replace({ name: "layout.main.admin" });
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
  <div
    class="flex h-dvh flex-col justify-center gap-4 sm:mx-auto sm:w-full sm:max-w-sm"
  >
    <div>
      <img class="mx-auto w-full" src="@/assets/fractal.png" />
      <h2
        class="mt-2 text-center text-2xl/9 font-bold tracking-tight text-gray-900"
      >
        Iniciar Sesión
      </h2>
    </div>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <MessageCore v-if="messageError" :text="messageError" severity="error" />
      <InputTextCore
        v-model="fields.email.value"
        label="Correo"
        :invalid="!!errors.email"
        :message-error="errors.email"
      />
      <InputPasswordCore
        v-model="fields.password.value"
        label="Contraseña"
        :invalid="!!errors.password"
        :message-error="errors.password"
      />
      <ButtonCore type="submit" label="Iniciar Sesión" :loading="loading" />
    </form>
  </div>
</template>
