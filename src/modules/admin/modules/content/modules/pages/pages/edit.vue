<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import PageFields from "../components/page-fields.vue";
import pageService from "../services/page.service";
import type { PageBodyDTO } from "../dto/page.dto";
import { PAGE_SCHEMA } from "../constants/page.schema";

const route = useRoute();
const identifier = ref<string>(String(route.params.id));

const initialValues = ref<PageBodyDTO>({
  title: null,
  slug: null,
  content: null,
  published: false,
});

const loadingData = ref<boolean>(true);

onMounted(async () => {
  const resp = await pageService.edit(identifier.value);
  loadingData.value = false;
  if (!resp) return;

  initialValues.value = {
    title: resp.title,
    slug: resp.slug,
    content: resp.content,
    published: resp.published,
  };
});
</script>

<template>
  <CrudForm
    title="Actualizar página"
    :schema="PAGE_SCHEMA"
    :initialValues="initialValues"
    redirect="pages.list"
    :service="(body) => pageService.update(identifier, body)"
    :loading-data="loadingData"
    :skeleton-fields="2"
    skeleton-textarea
    submit-label="Actualizar"
  >
    <template #default="{ fields, errors }">
      <PageFields :fields="fields" :errors="errors" />
    </template>
  </CrudForm>
</template>
