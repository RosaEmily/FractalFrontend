<script setup lang="ts">
import { computed } from "vue";
import SearchBox from "../components/search-box.vue";
import { AulaPageHeader } from "../components/ui";
import { useClassroomRole } from "../composables/useClassroomRole";

/**
 * Buscador a pantalla completa (`case 'search'` de los tres roles del diseño).
 *
 * Existe porque en móvil la topbar no tiene sitio para el campo: ahí la lupa
 * navega acá en vez de desplegar el panel. En escritorio se llega por el atajo
 * o por enlace directo.
 */
const { isStudent, isTeacher } = useClassroomRole();

/** Textos literales del diseño (student2.jsx:586, teacher.jsx:989, staff.jsx:305). */
const sub = computed(() => {
  if (isStudent.value) return "Cursos, clases, evaluaciones y certificados.";
  if (isTeacher.value) return "Cursos, alumnos y clases.";

  return "Grupos, docentes y alumnos.";
});
</script>

<template>
  <!-- `max-w-130`: el diseño la acota a 520px, no la estira a toda la página. -->
  <div class="max-w-130">
    <AulaPageHeader eyebrow="BUSCAR" title="Buscador" :sub="sub" />
    <SearchBox compact />
  </div>
</template>
