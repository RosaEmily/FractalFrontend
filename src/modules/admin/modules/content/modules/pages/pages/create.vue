<script setup lang="ts">
import { ref } from "vue";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import PageFields from "../components/page-fields.vue";
import pageService from "../services/page.service";
import type { PageBodyDTO } from "../dto/page.dto";
import { PAGE_SCHEMA } from "../constants/page.schema";

const initialValues = ref<PageBodyDTO>({
  title: null,
  slug: null,
  content: null,
  published: false,
});
</script>

<template>
  <CrudForm
    title="Crear página"
    :schema="PAGE_SCHEMA"
    :initialValues="initialValues"
    redirect="pages.list"
    :service="(body) => pageService.create(body)"
  >
    <template #default="{ fields, errors }">
      <PageFields :fields="fields" :errors="errors" />
    </template>
  </CrudForm>
</template>
