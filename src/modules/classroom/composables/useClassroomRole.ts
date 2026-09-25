import { computed, ref } from "vue";
import {
  getActiveRole,
  getSessionUserRaw,
  restoreSessionUser,
  roleNames,
  setActiveRole,
} from "@/shared/utils/session";
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
 * Rol activo, en un ref de MÓDULO para que sea reactivo y compartido.
 *
 * ⚠️ La cookie es la persistencia (sobrevive a un F5), pero `Cookies.get()` no
 * es reactivo: un `computed` que lo llame no se recalcula al cambiar de vista,
 * y el menú se quedaría dibujado con el rol anterior hasta recargar. El ref se
 * siembra desde la cookie al cargar el módulo y se actualiza al elegir; el
 * layout y el nav llaman al composable por separado y ven el mismo valor porque
 * vive fuera de la función.
 */
const chosenRole = ref<string | undefined>(getActiveRole());

/**
 * Vuelve a leer la cookie.
 *
 * El ref se siembra UNA vez, al cargar el módulo, así que sin esto una sesión
 * nueva en la misma carga de página (logout y login de otro usuario) heredaría
 * el rol del anterior. Lo llama el login después de elegir.
 */
export const syncActiveRole = (): void => {
  chosenRole.value = getActiveRole();
};

/** Lee la cookie de perfil del aula, o null si no hay o está corrupta. */
const readClassroomUser = (): ClassroomUser | null => {
  const raw = safeJsonParse<ClassroomUser>(getSessionUserRaw("classroom"));

  return !raw || typeof raw === "string" ? null : raw;
};

/**
 * EL perfil del aula. Es la fuente de verdad de las vistas; la cookie es solo
 * su persistencia entre recargas.
 *
 * ⚠️ Antes esto era un `computed` que leía la cookie, y **una cookie no es
 * reactiva**: `Cookies.get()` se evalúa una vez y el valor queda congelado. Al
 * cambiar la foto, el header seguía mostrando las iniciales hasta recargar la
 * página entera. Con un `ref` el problema desaparece de raíz: quien lo escribe
 * dispara la actualización de todo lo que lo muestre, sin que cada pantalla
 * tenga que acordarse de avisar.
 *
 * Es un `ref` de módulo, así que TODAS las llamadas a `useClassroomRole()`
 * comparten la misma instancia.
 */
const classroomUser = ref<ClassroomUser | null>(readClassroomUser());

/**
 * Vuelve a leer la cookie.
 *
 * El ref se siembra al cargar el módulo, así que un login nuevo en la misma
 * carga de página (logout y entrada de otro usuario) heredaría el perfil
 * anterior. Lo llama el login, igual que `syncActiveRole`.
 */
export const syncClassroomUser = (): void => {
  classroomUser.value = readClassroomUser();
};

/**
 * Actualiza el perfil: el ref primero —para que la UI reaccione al instante— y
 * la cookie después, para que sobreviva a un F5.
 *
 * ⚠️ Con `restoreSessionUser`, que CONSERVA la caducidad de la sesión.
 * Reescribir la cookie con una fecha nueva la alargaría sin que el backend lo
 * sepa.
 */
export const updateClassroomUser = (patch: Partial<ClassroomUser>): void => {
  const current = classroomUser.value;

  if (!current) return;

  const merged = { ...current, ...patch };

  classroomUser.value = merged;
  restoreSessionUser("classroom", merged);
};

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
  const user = computed<ClassroomUser | null>(() => classroomUser.value);

  // Los roles llegan como objetos {name, description} desde `auth/me`.
  const roles = computed<string[]>(() => roleNames(user.value?.roles));

  /**
   * Los roles del usuario que EL AULA sabe dibujar, en el orden en que se
   * ofrecen. Un `ADMIN` que además sea docente entra como docente: su rol de
   * panel no pinta nada acá.
   */
  const classroomRoles = computed<string[]>(() =>
    CLASSROOM_ROLE_PRIORITY.filter((role) => roles.value.includes(role)),
  );

  /** Si hay que preguntarle con cuál de sus roles quiere entrar. */
  const hasMultipleRoles = computed(() => classroomRoles.value.length > 1);

  /**
   * El rol con el que se dibuja el aula.
   *
   * ⚠️ Es una ELECCIÓN del usuario, no una precedencia calculada: quien es
   * alumno y docente a la vez elige al entrar y puede cambiar de vista después
   * (así lo define `aula/login.jsx` y el bloque "CAMBIAR DE VISTA" del shell).
   *
   * La precedencia solo queda como respaldo para quien todavía no eligió —el
   * caso de un rol único, donde no hay nada que preguntar— y para descartar una
   * cookie que ya no corresponde: si el rol elegido se le quitó al usuario, se
   * cae al primero que sí tenga en vez de dejar el aula en blanco.
   */
  const activeRole = computed<string | null>(() => {
    const chosen = chosenRole.value;

    if (chosen && classroomRoles.value.includes(chosen)) return chosen;

    return classroomRoles.value[0] ?? null;
  });

  const menu = computed<ClassroomMenuItem[]>(() =>
    activeRole.value ? (CLASSROOM_MENU[activeRole.value] ?? []) : [],
  );

  const fullName = computed(() =>
    user.value
      ? `${user.value.first_name ?? ""} ${user.value.last_name ?? ""}`.trim()
      : "",
  );

  /**
   * Solo el nombre de pila, para la topbar.
   *
   * ⚠️ El diseño usa `user.first` ahí (shell.jsx:477), no el nombre completo:
   * junto al rol y en una barra estrecha, un "Diego Vargas Meléndez" se corta.
   */
  const firstName = computed(() => user.value?.first_name?.trim() ?? "");

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

  /**
   * Cambia la vista activa. No toca la sesión: el token y el perfil son los
   * mismos, solo cambia con qué cara de ese perfil se dibuja el aula.
   *
   * Se ignora un rol que el usuario no tenga — la cookie es una preferencia y
   * quien la escriba a mano no gana acceso a nada.
   */
  const switchRole = (role: string): boolean => {
    if (!classroomRoles.value.includes(role)) return false;

    setActiveRole(role);
    chosenRole.value = role;
    return true;
  };

  return {
    user,
    roles,
    classroomRoles,
    hasMultipleRoles,
    switchRole,
    activeRole,
    menu,
    fullName,
    firstName,
    initials,
    isStudent,
    isTeacher,
    isCoordinator,
  };
}
