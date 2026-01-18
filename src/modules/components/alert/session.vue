<script lang="ts" setup>
import { ModalConfirmationUi, ButtonCore } from "@/shared/components";
import { useSessionStore } from "@/shared/stores/useSessionStore";

import SadFace from "@/shared/icons/SadFace.vue";
import ArrowV2 from "@/shared/icons/ArrowV2.vue";
import ArrowLong from "@/shared/icons/ArrowLong.vue";
import { HOME_BASE_URL } from "@/shared/config/env.config";
const sessionStore = useSessionStore();

const goToLogin = () => {
  const homeBaseUrl = HOME_BASE_URL || "/";
  const currentUrl = window.location.href;

  const query = new URLSearchParams({
    redirect: currentUrl,
    login: "1",
  });

  const url = `${homeBaseUrl}?${query.toString()}`;

  window.open(url, "_blank", "noopener,noreferrer");
};

const reloadPage = () => {
  window.location.reload();
};
</script>
<template>
  <ModalConfirmationUi
    v-model="sessionStore.showSessionModal"
    title="Ups… algo pasó con tu sesión"
    description="Tu sesión expiró o dejó de ser válida. Inicia sesión nuevamente y luego reintenta la acción o recarga la página."
    description-class="text-center"
    :close-show="false"
    :icon="SadFace"
  >
    <template #buttons>
      <div class="px-4 pb-4 flex flex-col gap-4">
        <ButtonCore @click="goToLogin">
          Iniciar sesión
          <ArrowLong />
        </ButtonCore>
        <div class="grid gap-4 grid-cols-2">
          <ButtonCore
            severity="info"
            variant="outlined"
            @click="sessionStore.retryLastRequest"
          >
            <ArrowV2 />
            Intentar de nuevo
          </ButtonCore>
          <ButtonCore severity="info" variant="outlined" @click="reloadPage">
            <ArrowV2 />
            Actualizar página
          </ButtonCore>
        </div>
      </div>
    </template>
  </ModalConfirmationUi>
</template>
