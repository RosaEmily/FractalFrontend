<script setup lang="ts">
import { z } from "zod";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore } from "@/shared/components";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import ImageField from "../../../components/image-field.vue";
import FieldPreview from "../../../components/field-preview.vue";
import sponsorService from "../services/sponsor.service";
import type { SponsorBodyDTO } from "../dto/sponsor.dto";

const route = useRoute();
const identifier = ref<string>(String(route.params.id));

const initialValues = ref<SponsorBodyDTO>({ name: null });
const image = ref<File | null>(null);
const currentImage = ref<string | null>(null);

const formSchema = z.object({
  name: z
    .string({ message: "El nombre es obligatorio" })
    .min(3, { message: "Debe tener al menos 3 caracteres" })
    .max(255, { message: "No puede tener más de 255 caracteres" }),
});

onMounted(async () => {
  const loadingStore = useLoadingStore();
  loadingStore.start();
  const resp = await sponsorService.edit(identifier.value);
  loadingStore.finish();
  if (!resp) return;

  initialValues.value = { name: resp.name };
  currentImage.value = resp.image;
});
</script>

<template>
  <CrudForm
    title="Actualizar Patrocinador"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="sponsors.list"
    :service="(body) => sponsorService.update(identifier, { ...body, image })"
    submit-label="Actualizar"
  >
    <template #default="{ fields, errors }">
      <InputTextCore
        v-model="fields.name.value"
        label="Nombre"
        :invalid="!!errors.name"
        :message-error="errors.name"
      />
      <!-- Sin archivo nuevo se conserva el logo actual. -->
      <ImageField
        label="Logo"
        hint="Déjalo vacío para conservar el logo actual. Máximo 100 KB."
        :max-kb="100"
        :current="currentImage"
        @select="(file) => (image = file)"
      />

      <FieldPreview hint="Así se ve en la franja de patrocinadores.">
        <span class="text-adm-base text-secondary-500">
          {{ fields.name.value || "Nombre del patrocinador" }}
        </span>
      </FieldPreview>
    </template>
  </CrudForm>
</template>
