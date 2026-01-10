<script lang="ts" setup>
import { z } from "zod";
import { useFormFields } from "@/shared/composables/useFormFields";
import {
  InputPasswordCore,
  InputTextCore,
  ButtonCore,
} from "@/shared/components";

// 1️⃣ Schema Zod
const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
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

// 7️⃣ Función de envío
const onSubmit = handleSubmit((values) => {
  console.log("Formulario guardado:", values);
});
</script>

<template>
  <div class="h-dvh">
    <div
      class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 sm:mx-auto sm:w-full sm:max-w-sm"
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
        <div>
          <InputTextCore
            v-model="fields.email.value"
            label="Correo"
            :invalid="!!errors.email"
            :message-error="errors.email"
          />
        </div>

        <div>
          <InputPasswordCore
            v-model="fields.password.value"
            label="Contraseña"
            :invalid="!!errors.password"
            :message-error="errors.password"
          />
        </div>

        <div>
          <ButtonCore type="submit" label="Iniciar Sesión" />
        </div>
      </form>
    </div>
  </div>
</template>
