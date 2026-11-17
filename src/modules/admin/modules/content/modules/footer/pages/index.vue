<script setup lang="ts">
/**
 * Pie de página del sitio público.
 *
 * Registro único (`GET`/`PUT landing/footer`). Los textos de marca y de la
 * página de Contacto van en el formulario; las columnas de enlaces, que son una
 * lista anidada, en su propio editor (`CrudForm` no valida shapes anidados, así
 * que esa validación vive acá y se dispara al guardar).
 */
import { z } from "zod";
import { onMounted, ref } from "vue";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore, TextAreaCore } from "@/shared/components";
import FieldPreview from "../../../components/field-preview.vue";
import FooterColumnsField from "../components/footer-columns-field.vue";
import FooterSection from "../components/footer-section.vue";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import footerService from "../services/footer.service";
import pageService from "../../pages/services/page.service";
import type { FooterBodyDTO, FooterColumnDTO } from "../dto/footer.dto";

const toast = useToastStore();

const SECTIONS = [
  { id: "marca", step: 1, label: "Marca" },
  { id: "enlaces", step: 2, label: "Enlaces" },
  { id: "contacto-textos", step: 3, label: "Contacto" },
  { id: "contacto-canales", step: 4, label: "Canales" },
  { id: "contacto-formulario", step: 5, label: "Formulario" },
];

const goTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

const emptyForm = (): FooterBodyDTO => ({
  brand_text: null,
  legal_name: null,
  location_text: null,
  ruc: null,
  legal_address: null,
  cp_eyebrow: null,
  cp_title: null,
  cp_title_accent: null,
  cp_description: null,
  cp_email_note: null,
  cp_phone_note: null,
  cp_address_note: null,
  cp_whatsapp_note: null,
  cp_form_note: null,
});

const initialValues = ref<FooterBodyDTO>(emptyForm());
const columns = ref<FooterColumnDTO[]>([]);
const pageOptions = ref<{ slug: string; title: string }[]>([]);
const columnErrors = ref<Record<string, string>>({});

const optionalText = (max: number, label: string) =>
  z
    .string()
    .max(max, { message: `${label} no puede tener más de ${max} caracteres` })
    .nullable()
    .optional();

const formSchema = z.object({
  brand_text: optionalText(500, "La descripción"),
  legal_name: optionalText(150, "La razón social"),
  location_text: optionalText(100, "El texto de ubicación"),
  ruc: z
    .string()
    .regex(/^\d{11}$/, { message: "El RUC debe tener 11 dígitos" })
    .nullable()
    .optional()
    .or(z.literal("")),
  legal_address: optionalText(255, "La dirección legal"),
  cp_eyebrow: optionalText(80, "El texto"),
  cp_title: optionalText(80, "El título"),
  cp_title_accent: optionalText(80, "El título resaltado"),
  cp_description: optionalText(300, "La descripción"),
  cp_email_note: optionalText(80, "La nota"),
  cp_phone_note: optionalText(80, "La nota"),
  cp_address_note: optionalText(80, "La nota"),
  cp_whatsapp_note: optionalText(80, "La nota"),
  cp_form_note: optionalText(120, "La nota"),
});

/** Devuelve los errores de las columnas, por posición; vacío si todo está bien. */
const validateColumns = (list: FooterColumnDTO[]): Record<string, string> => {
  const found: Record<string, string> = {};
  list.forEach((column, ci) => {
    if (!column.title?.trim()) found[`${ci}`] = "Escribe el título de la columna";
    column.links.forEach((link, li) => {
      if (!link.label?.trim()) found[`${ci}-${li}`] = "Escribe el texto del enlace";
      else if (link.type === "page" && !link.page)
        found[`${ci}-${li}`] = "Elige la página a la que lleva";
      else if (link.type === "url" && !/^https?:\/\/\S+$/i.test(link.url ?? ""))
        found[`${ci}-${li}`] = "Escribe una dirección válida que empiece con https://";
    });
  });
  return found;
};

const save = async (form: FooterBodyDTO) => {
  columnErrors.value = validateColumns(columns.value);
  if (Object.keys(columnErrors.value).length) {
    toast.showToastError({ detail: "Revisa las columnas de enlaces: hay datos incompletos." });
    // safeRequest lo toma como fallo y CrudForm no redirige.
    throw new Error("Columnas incompletas");
  }
  return footerService.update(form, columns.value);
};


onMounted(async () => {
  const loading = useLoadingStore();
  loading.start();
  const [footer, pages] = await Promise.all([footerService.show(), pageService.all()]);
  loading.finish();

  initialValues.value = footer.form;
  columns.value = footer.columns;
  pageOptions.value = (pages ?? []).map((p) => ({ slug: p.slug, title: p.title }));
});
</script>

<template>
  <CrudForm
    title="Pie de página"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="footer"
    :service="(body) => save(body as FooterBodyDTO)"
    submit-label="Guardar"
  >
    <template #default="{ fields, errors }">
      <nav class="flex flex-wrap gap-2 text-adm-sm" aria-label="Secciones">
        <a
          v-for="item in SECTIONS"
          :key="item.id"
          :href="`#${item.id}`"
          class="px-3 py-1 rounded-full border border-line bg-white text-secondary-600 hover:border-primary-500 hover:text-primary-500 transition-colors"
          @click.prevent="goTo(item.id)"
        >{{ item.step }}. {{ item.label }}</a>
      </nav>

      <FooterSection
        id="marca"
        :step="1"
        title="Marca y datos legales"
        description="Lo que aparece junto al logo y en la franja de derechos al pie, y los datos legales del Libro de reclamaciones."
      >
        <TextAreaCore
          v-model="fields.brand_text.value"
          label="Descripción de la marca"
          :rows="3"
          placeholder="Centro Autodesk Authorized Training Center en Perú..."
          :invalid="!!errors.brand_text"
          :message-error="errors.brand_text"
        />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputTextCore
            v-model="fields.legal_name.value"
            label="Razón social"
            placeholder="FRACTAL STUDIO S.A.C."
            :invalid="!!errors.legal_name"
            :message-error="errors.legal_name"
          />
          <InputTextCore
            v-model="fields.location_text.value"
            label="Texto de ubicación"
            placeholder="HECHO EN LIMA · PERÚ"
            :invalid="!!errors.location_text"
            :message-error="errors.location_text"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-4">
          <InputTextCore
            v-model="fields.ruc.value"
            label="RUC"
            hint-label="Libro de reclamaciones"
            placeholder="20123456789"
            :max-length="11"
            inputmode="numeric"
            :invalid="!!errors.ruc"
            :message-error="errors.ruc"
          />
          <InputTextCore
            v-model="fields.legal_address.value"
            label="Domicilio legal"
            hint-label="Libro de reclamaciones"
            placeholder="Av. Ejemplo 123, Lima, Perú"
            :invalid="!!errors.legal_address"
            :message-error="errors.legal_address"
          />
        </div>
        <FieldPreview hint="así se ve al pie de la web">
          <div class="w-full text-adm-base text-secondary-500 space-y-1">
            <p>{{ fields.brand_text.value || "Descripción de la marca" }}</p>
            <p class="font-mono text-adm-xs text-secondary-400">
              © {{ new Date().getFullYear() }}
              {{ fields.legal_name.value || "RAZÓN SOCIAL" }} · TODOS LOS DERECHOS RESERVADOS ·
              {{ fields.location_text.value || "UBICACIÓN" }}
            </p>
          </div>
        </FieldPreview>
      </FooterSection>

      <FooterSection
        id="enlaces"
        :step="2"
        title="Columnas de enlaces"
        description="Los enlaces a páginas informativas, preguntas frecuentes o sitios externos."
      >
        <FooterColumnsField v-model="columns" :page-options="pageOptions" :errors="columnErrors" />
      </FooterSection>

      <FooterSection
        id="contacto-textos"
        :step="3"
        title="Contacto · encabezado"
        description="Texto principal de la página de Contacto. El correo, el teléfono y la dirección salen de Sitio web → Contactos."
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputTextCore
            v-model="fields.cp_eyebrow.value"
            label="Texto superior"
            placeholder="CONTACTO · LIMA · PERÚ"
            :invalid="!!errors.cp_eyebrow"
            :message-error="errors.cp_eyebrow"
          />
          <div class="hidden sm:block" />
          <InputTextCore
            v-model="fields.cp_title.value"
            label="Título"
            placeholder="Conversa con un"
            :invalid="!!errors.cp_title"
            :message-error="errors.cp_title"
          />
          <InputTextCore
            v-model="fields.cp_title_accent.value"
            label="Título resaltado (naranja)"
            placeholder="asesor académico"
            :invalid="!!errors.cp_title_accent"
            :message-error="errors.cp_title_accent"
          />
        </div>
        <TextAreaCore
          v-model="fields.cp_description.value"
          label="Descripción"
          :rows="3"
          :invalid="!!errors.cp_description"
          :message-error="errors.cp_description"
        />
      </FooterSection>

      <FooterSection
        id="contacto-canales"
        :step="4"
        title="Contacto · notas de los canales"
        description="La línea pequeña que acompaña a cada tarjeta de contacto."
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputTextCore
            v-model="fields.cp_email_note.value"
            label="Nota bajo el correo"
            placeholder="Respondemos en menos de 24h"
            :invalid="!!errors.cp_email_note"
            :message-error="errors.cp_email_note"
          />
          <InputTextCore
            v-model="fields.cp_phone_note.value"
            label="Nota bajo el teléfono"
            placeholder="Lun a Vie · 9am – 7pm"
            :invalid="!!errors.cp_phone_note"
            :message-error="errors.cp_phone_note"
          />
          <InputTextCore
            v-model="fields.cp_address_note.value"
            label="Nota bajo la dirección"
            placeholder="Ver en el mapa"
            :invalid="!!errors.cp_address_note"
            :message-error="errors.cp_address_note"
          />
          <InputTextCore
            v-model="fields.cp_whatsapp_note.value"
            label="Nota bajo el WhatsApp"
            placeholder="Atención 24/7"
            :invalid="!!errors.cp_whatsapp_note"
            :message-error="errors.cp_whatsapp_note"
          />
        </div>
      </FooterSection>

      <FooterSection
        id="contacto-formulario"
        :step="5"
        title="Contacto · formulario"
        description="Texto al pie del formulario de mensajes."
      >
        <InputTextCore
          v-model="fields.cp_form_note.value"
          label="Nota al pie del formulario"
          placeholder="Te responderemos en menos de 24 horas hábiles."
          :invalid="!!errors.cp_form_note"
          :message-error="errors.cp_form_note"
        />
      </FooterSection>
    </template>
  </CrudForm>
</template>
