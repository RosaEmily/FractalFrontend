import { computed } from "vue";
import { getSessionUserRaw, roleNames } from "@/shared/utils/session";
import { safeJsonParse } from "@/shared/utils/safe-json";
import {
  CLASSROOM_MENU,
  CLASSROOM_ROLE_PRIORITY,
  type ClassroomMenuItem,
} from "../constants/menu";

interface ClassroomUser {
  first_name?: string;
  last_name?: string;
  email?: string;
  photo_url?: string | null;
  roles?: unknown;
  /**
   * Identidad académica: `enrollments.student_id` y `offer_courses.teacher_id`
   * guardan este documento, no `users.id`. La API lo expone en `auth/me`.
   */
  document_number?: string | null;
}

/**
 * Quién está mirando el aula y qué menú le toca.
 *
 * El rol sale de la cookie de perfil DEL AULA que escribe el login, la misma
 * que lee el guard del router para esta zona. No se consulta la API acá: el
 * layout ya se monta con el perfil cargado, y pedirlo de nuevo mostraría el
 * menú vacío en el primer frame de cada navegación.
 *
 * Se pide la del aula explícitamente: con una sesión de panel abierta a la vez,
 * leer "la cookie de usuario" a secas mezclaría los dos perfiles.
 */
export function useClassroomRole() {
  const user = computed<ClassroomUser | null>(() => {
    const raw = safeJsonParse<ClassroomUser>(getSessionUserRaw("classroom"));
    return !raw || typeof raw === "string" ? null : raw;
  });

  // Los roles llegan como objetos {name, description} desde `auth/me`.
  const roles = computed<string[]>(() => roleNames(user.value?.roles));

  /** El rol con el que se dibuja el aula. Coordinación manda sobre el resto. */
  const activeRole = computed<string | null>(
    () => CLASSROOM_ROLE_PRIORITY.find((r) => roles.value.includes(r)) ?? null,
  );

  const menu = computed<ClassroomMenuItem[]>(() =>
    activeRole.value ? (CLASSROOM_MENU[activeRole.value] ?? []) : [],
  );

  const fullName = computed(() =>
    user.value
      ? `${user.value.first_name ?? ""} ${user.value.last_name ?? ""}`.trim()
      : "",
  );

  /** Iniciales para el avatar: el diseño no depende de `photo_url`. */
  const initials = computed(() =>
    fullName.value
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join(""),
  );

  const isStudent = computed(() => activeRole.value === "STUDENT");
  const isTeacher = computed(() => activeRole.value === "TEACHER");
  const isCoordinator = computed(() => activeRole.value === "COORDINATOR");

  return {
    user,
    roles,
    activeRole,
    menu,
    fullName,
    initials,
    isStudent,
    isTeacher,
    isCoordinator,
  };
}
