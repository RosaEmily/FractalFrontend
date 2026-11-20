import { beforeEach, describe, expect, it } from "vitest";
import type { RouteRecordRaw } from "vue-router";
import { hasAnyPermission, hasPermission, permissionNames } from "../src/shared/utils/permissions";
import { routesAdmin } from "../src/modules/admin/router";
import { MENU } from "../src/modules/admin/constants/menu";
import {
  filterMenuByPermissions,
  firstAccessibleRoute,
  permissionForRoute,
  resourceForRoute,
} from "../src/modules/admin/constants/permissions";
import {
  clearSession,
  getSessionPermissions,
  getSessionUserRaw,
  setSessionUser,
} from "../src/shared/utils/session";
import type { MenuItem } from "../src/modules/admin/interface/nav-vertical";

/** Pantallas (rutas con componente) del panel, con el meta que las rodea. */
const screens = (routes: RouteRecordRaw[], inherited: Record<string, unknown> = {}): RouteRecordRaw[] =>
  routes.flatMap((route) => {
    const meta = { ...inherited, ...(route.meta ?? {}) };
    const own = route.component && !route.children?.length ? [{ ...route, meta } as RouteRecordRaw] : [];
    return [...own, ...screens(route.children ?? [], meta)];
  });

const adminScreens = screens(routesAdmin);
const PERMISSION_FORMAT = /^[A-Z]+(?:_[A-Z]+)*$/;

describe("hasPermission", () => {
  it("acepta el permiso exacto y rechaza el que falta", () => {
    expect(hasPermission(["COURSES_VIEW"], "COURSES_VIEW")).toBe(true);
    expect(hasPermission(["COURSES_VIEW"], "COURSES_DELETE")).toBe(false);
    expect(hasPermission([], "COURSES_VIEW")).toBe(false);
  });

  it("el comodín de ADMIN pasa todo", () => {
    expect(hasPermission(["*"], "CUALQUIER_COSA")).toBe(true);
  });

  it("con varios pedidos basta uno", () => {
    expect(hasPermission(["B"], ["A", "B"])).toBe(true);
    expect(hasPermission(["C"], ["A", "B"])).toBe(false);
  });

  it("sin permiso pedido pasa, pero una lista vacía de pedidos se cierra", () => {
    expect(hasPermission([], undefined)).toBe(true);
    expect(hasPermission(["*"], [])).toBe(false);
  });

  it("solo toma nombres válidos de lo que llegue del perfil", () => {
    expect(permissionNames(["A", 3, null, "", "B"])).toEqual(["A", "B"]);
    expect(permissionNames("A")).toEqual([]);
    expect(permissionNames(undefined)).toEqual([]);
  });

  it("un usuario del panel sin permisos no tiene nada que ver", () => {
    expect(hasAnyPermission([])).toBe(false);
    expect(hasAnyPermission(["*"])).toBe(true);
  });
});

describe("permisos por pantalla del panel", () => {
  it("el padre exige acceso al panel y ya no depende de nombres de rol", () => {
    const panel = routesAdmin[0].children?.[0];
    expect(panel?.meta?.panel).toBe(true);
    expect(panel?.meta?.roles).toBeUndefined();
  });

  it("toda pantalla declara su permiso o es explícitamente abierta (nada nace abierto)", () => {
    expect(adminScreens.length).toBeGreaterThan(40);

    const unprotected = adminScreens
      .filter((route) => !route.meta?.permission && !route.meta?.anyPanelUser)
      .map((route) => String(route.name));

    expect(unprotected).toEqual([]);
  });

  it("ninguna pantalla del panel depende de roles escritos a mano", () => {
    const withRoles = adminScreens.filter((route) => route.meta?.roles).map((route) => String(route.name));

    expect(withRoles).toEqual([]);
  });

  it("los permisos tienen el formato del catálogo del backend", () => {
    for (const route of adminScreens) {
      const permission = route.meta?.permission as string | undefined;
      if (permission) expect(permission, String(route.name)).toMatch(PERMISSION_FORMAT);
    }
  });

  it("solo el perfil propio queda abierto a cualquier usuario del panel", () => {
    const open = adminScreens.filter((route) => route.meta?.anyPanelUser).map((route) => String(route.name));

    expect(open).toEqual(["profile.show"]);
  });

  it("crear, editar y listar piden permisos distintos del mismo recurso", () => {
    expect(permissionForRoute("users.list")).toBe("USERS_VIEW");
    expect(permissionForRoute("users.create")).toBe("USERS_CREATE");
    expect(permissionForRoute("users.update")).toBe("USERS_UPDATE");
    expect(permissionForRoute("learningPaths.edit")).toBe("LEARNING_PATHS_UPDATE");
    expect(permissionForRoute("students.import")).toBe("PEOPLE_IMPORTS_CREATE");
    expect(permissionForRoute("reports.revenue")).toBe("REPORTS_REVENUE_VIEW");
    expect(permissionForRoute("admin-home")).toBe("DASHBOARD_VIEW");
    expect(permissionForRoute("footer")).toBe("FOOTER_VIEW");
    expect(permissionForRoute("systemSessions.list")).toBe("SESSIONS_VIEW");
  });

  it("un nombre desconocido no tiene permiso (y entonces se cierra)", () => {
    expect(permissionForRoute("algo-nuevo.list")).toBeUndefined();
    expect(permissionForRoute(undefined)).toBeUndefined();
    expect(permissionForRoute("users.eliminar")).toBeUndefined();
  });

  it("el recurso de una pantalla sale de su nombre", () => {
    expect(resourceForRoute("roles.list")).toBe("ROLES");
    expect(resourceForRoute("nada.list")).toBeUndefined();
  });

  it("crear un permiso pide PERMISSIONS_CREATE (y el backend, además, ser ADMIN)", () => {
    expect(permissionForRoute("permissions.create")).toBe("PERMISSIONS_CREATE");
    expect(adminScreens.map((route) => route.name)).toContain("permissions.create");
  });
});

describe("menú por permisos", () => {
  const names = (items: MenuItem[]): string[] =>
    items.flatMap((item) => (item.children?.length ? names(item.children) : [String((item.route as { name?: string })?.name)]));

  it("todo ítem del menú apunta a una pantalla con permiso", () => {
    const routeNames = new Set(adminScreens.map((route) => String(route.name)));

    for (const name of names(MENU)) {
      expect(routeNames.has(name), `El menú apunta a una ruta que no existe: ${name}`).toBe(true);
      expect(permissionForRoute(name), `Sin permiso conocido: ${name}`).toBeDefined();
    }
  });

  it("el menú coincide con lo que el guard dejaría abrir", () => {
    const byName = new Map(adminScreens.map((route) => [String(route.name), route.meta?.permission]));

    for (const name of names(MENU)) {
      expect(permissionForRoute(name), name).toBe(byName.get(name));
    }
  });

  it("ADMIN ve todo el menú", () => {
    expect(names(filterMenuByPermissions(MENU, ["*"]))).toEqual(names(MENU));
  });

  it("sin permisos no se ve nada", () => {
    expect(filterMenuByPermissions(MENU, [])).toEqual([]);
  });

  it("solo aparece lo que se puede ver y un grupo vacío desaparece", () => {
    const visible = names(filterMenuByPermissions(MENU, ["COURSES_VIEW", "REPORTS_REVENUE_VIEW"]));

    expect(visible).toEqual(["reports.revenue", "courses.list"]);
    const groups = filterMenuByPermissions(MENU, ["COURSES_VIEW"]).map((item) => item.id);
    expect(groups).not.toContain("security");
  });

  it("un permiso de crear no hace aparecer un ítem que pide ver", () => {
    expect(names(filterMenuByPermissions(MENU, ["COURSES_CREATE"]))).toEqual([]);
  });

  it("manda a lo primero que se puede abrir cuando falta «Inicio»", () => {
    expect(firstAccessibleRoute(MENU, ["TAGS_VIEW"])).toEqual({ name: "tags.list" });
    expect(firstAccessibleRoute(MENU, [])).toBeUndefined();
  });
});

describe("permisos en la sesión del navegador", () => {
  beforeEach(() => {
    clearSession("admin");
    localStorage.clear();
  });

  const user = { id: 1, email: "a@example.test", roles: ["COORDINATOR"], permissions: ["COURSES_VIEW", "TAGS_VIEW"] };

  it("la cookie de perfil no guarda los permisos (una cookie pasa de 4 KB con rapidez)", () => {
    setSessionUser("admin", JSON.stringify(user), new Date(Date.now() + 3600_000));

    expect(getSessionUserRaw("admin")).not.toContain("permissions");
    expect(JSON.parse(getSessionUserRaw("admin") as string).roles).toEqual(["COORDINATOR"]);
    expect(getSessionPermissions("admin")).toEqual(["COURSES_VIEW", "TAGS_VIEW"]);
  });

  it("reescribir el perfil sin el campo conserva los permisos guardados", () => {
    setSessionUser("admin", JSON.stringify(user), new Date(Date.now() + 3600_000));
    const { permissions: _omit, ...withoutPermissions } = user;
    setSessionUser("admin", JSON.stringify(withoutPermissions), new Date(Date.now() + 3600_000));

    expect(getSessionPermissions("admin")).toEqual(["COURSES_VIEW", "TAGS_VIEW"]);
  });

  it("sin nada guardado se distingue «no sé» de «ninguno»", () => {
    expect(getSessionPermissions("admin")).toBeNull();

    setSessionUser("admin", JSON.stringify({ ...user, permissions: [] }), new Date(Date.now() + 3600_000));
    expect(getSessionPermissions("admin")).toEqual([]);
  });

  it("cerrar la sesión borra los permisos y no toca los de la otra zona", () => {
    setSessionUser("admin", JSON.stringify(user), new Date(Date.now() + 3600_000));
    setSessionUser("classroom", JSON.stringify({ ...user, permissions: ["X_VIEW"] }), new Date(Date.now() + 3600_000));

    clearSession("admin");

    expect(getSessionPermissions("admin")).toBeNull();
    expect(getSessionPermissions("classroom")).toEqual(["X_VIEW"]);
    clearSession("classroom");
  });

  it("un valor corrupto en el almacenamiento se trata como «no sé»", () => {
    localStorage.setItem("app_user_permissions_admin", "{no es json");
    expect(getSessionPermissions("admin")).toBeNull();

    localStorage.setItem("app_user_permissions_admin", JSON.stringify({ a: 1 }));
    expect(getSessionPermissions("admin")).toBeNull();
  });
});
