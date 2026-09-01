<script setup lang="ts">
import { z } from "zod";
import { ref } from "vue";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore, TextAreaCore } from "@/shared/components";
import paymentMethodService from "../services/payment-method.service";
import type { PaymentMethodBodyDTO } from "../dto/payment-method.dto";

const initialValues = ref<PaymentMethodBodyDTO>({
  name: null,
  description: null,
});

const formSchema = z.object({
  name: z
    .string({ message: "El nombre es obligatorio" })
    .min(2, { message: "Debe tener al menos 2 caracteres" })
    .max(255, { message: "No puede tener más de 255 caracteres" }),
  description: z
    .string()
    .max(255, { message: "No puede tener más de 255 caracteres" })
    .nullable()
    .optional(),
});
</script>

<template>
  <CrudForm
    title="Crear método de pago"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="paymentMethods.list"
    :service="(body) => paymentMethodService.create(body)"
  >
    <template #default="{ fields, errors }">
      <InputTextCore
        v-model="fields.name.value"
        label="Nombre"
        :invalid="!!errors.name"
        :message-error="errors.name"
        messages-info="Ej: Niubiz, Yape, Transferencia bancaria"
      />
      <TextAreaCore
        v-model="fields.description.value"
        label="Descripción"
        :rows="3"
        :invalid="!!errors.description"
        :message-error="errors.description"
      />
    </template>
  </CrudForm>
</template>
