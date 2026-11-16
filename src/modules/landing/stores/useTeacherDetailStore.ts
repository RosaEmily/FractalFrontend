import { defineStore } from "pinia";
import { ref } from "vue";
import { safeRequest } from "@/shared/utils/request";
import { teacherService } from "../services/teacher.service";
import type { TeacherDetail } from "../models/teacher.model";

export const useTeacherDetailStore = defineStore("landing-teacher-detail", () => {
  const data = ref<TeacherDetail | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetch(documentNumber: string) {
    loading.value = true;
    error.value = null;
    const { data: result, status } = await safeRequest(
      () => teacherService.getByDocumentNumber(documentNumber),
      { showAlert: false },
    );
    if (status) data.value = result;
    else error.value = "No se pudo cargar el docente.";
    loading.value = false;
  }

  return { data, loading, error, fetch };
});
