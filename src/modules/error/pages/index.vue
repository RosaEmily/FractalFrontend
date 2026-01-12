<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({ status: Number, message: String });

const title = computed(() => {
  return (
    {
      400: "400 - Bad Request",
      401: "401 - Unauthenticated",
      403: "403 - Unauthorized",
      404: "404 - Page not found",
      500: "500 - It seems something went wrong...",
      503: "503 - We are working.",
      502: "502 - We have a little problem...",
    }[props.status ?? 404] ?? "An error occurred on client"
  );
});

const information = computed(() => {
  return (
    {
      400: {
        img: "https://cdn.joinnus.com/files/ticket-404.svg",
        status: "400",
        message: props.message ?? "¡Ocurrió un error en la petición!",
        description: `No te preocupes te regresaremos a la principal.`,
      },
      403: {
        img: "https://cdn.joinnus.com/files/ticket-404.svg",
        status: "403",
        message: "¡No se encuentra autorizado para acceder a este recurso!",
        description: `No te preocupes te regresaremos a la principal.`,
      },
      404: {
        img: "https://cdn.joinnus.com/files/ticket-404.svg",
        status: "404",
        message: "¡Página no encontrada!",
        description: `No te preocupes te regresaremos a la principal.`,
      },
      500: {
        img: "https://cdn.joinnus.com/files/ticket-500.svg",
        status: "500",
        message: "Parece que algo salió mal...",
        description: `Intenta de nuevo en unos minutos. Si el problema continua
                    puedes contactar al <b>Área de TI</b> y veremos como
                    ayudarte.`,
      },
      502: {
        img: "https://cdn.joinnus.com/files/ticket-502.svg",
        status: "502",
        message: "Tenemos un problemita...",
        description: `Puedes volver un paso atrás e intentar de nuevo en unos
                    minutos. También puedes explorar otras opciones.`,
      },
      503: {
        img: "https://cdn.joinnus.com/files/ticket-503.svg",
        status: "503",
        message: "Estamos trabajando.",
        description: `Estamos realizando algunos cambios para mejorar tu
                    experiencia en Joinnus. Regresamos en breves. Intenta de
                    nuevo más tarde.`,
      },
    }[props.status ?? 404] ?? null
  );
});
</script>

<template>
  <div class="min-h-[97vh] w-full flex flex-col font-sans font-poppins">
    <div class="flex flex-col items-center justify-center flex-grow">
      <div
        class="grid gap-[1.5rem] justify-items-center lg:gap-[2rem]"
        v-if="information"
      >
        <img class="max-w-full" :src="information.img" alt="error-icon" />

        <div class="text-center order-[-1] lg:order-[0]">
          <span
            class="block text-[3.75rem] leading-[3.75rem] font-extrabold lg:text-[6rem] lg:leading-[6rem]"
          >
            {{ information.status }}
          </span>
          <p
            class="text-green-300 text-[1.25rem] font-black m-0 lg:text-[1.5rem]"
          >
            {{ information.message }}
          </p>
        </div>

        <p
          class="text-center text-[0.875rem] font-medium m-0 max-w-[26.5625rem] text-[#4B545C] lg:text-[1rem]"
          v-html="information.description"
        ></p>
      </div>

      <div v-else>
        <p
          class="text-green-300 text-[1.25rem] font-black m-0 lg:text-[1.5rem]"
        >
          An error occurred on client
        </p>
      </div>

      <div
        class="flex flex-col items-center justify-center gap-[0.75rem] mt-[2rem] lg:mt-[2.5rem]"
      >
        <a
          href="/admin"
          class="py-[0.625rem] min-w-[13.75rem] max-w-[19.5rem] border-none text-[0.875rem] w-full lg:py-[0.75rem] lg:text-[1rem] lg:w-auto rounded-[2rem] bg-gray-400 text-white text-center font-semibold"
        >
          Ir al inicio
        </a>
      </div>
    </div>
  </div>
</template>
