import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import HomeView from "../views/home/HomeView.vue";

import { COOKIE_NAME_SESSION } from "@/shared/config/env.config";
import Cookies from "js-cookie";

import { routesAuth } from "@/modules/auth/router";
import { routesAdmin } from "@/modules/admin/router";
import { routesError } from "@/modules/error/router";
import { applyPageMeta } from "@/shared/utils/meta";

const routes: RouteRecordRaw[] = [
  { path: "/", name: "home", component: HomeView },
  ...routesAuth,
  ...routesAdmin,
  ...routesError,
];

const router = createRouter({
  history: createWebHistory("/FractalFrontend/"),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

const getUserRoles = (): string[] => {
  const roles = Cookies.get("roles");
  if (!roles) return ["ADMIN"];
  if (Array.isArray(roles)) return roles;
  return roles.split(",").map((r) => r.trim());
};

router.beforeEach((to, _, next) => {
  // Page
  if (to.meta.page) {
    applyPageMeta(to.meta.page);
  }

  const isAuthenticated = Boolean(Cookies.get(COOKIE_NAME_SESSION));
  const userRoles = getUserRoles();

  if (to.meta.guestOnly && isAuthenticated) {
    return next({ name: "admin-home" });
  }

  // 🔒 Auth
  if (to.meta.auth && !isAuthenticated) {
    return next({
      name: "login",
      query: {
        redirect: to.fullPath,
      },
    });
  }

  // 🔐 Roles
  if (to.meta.roles) {
    // no tiene roles
    if (userRoles.length === 0) {
      return next({ name: "error-403" });
    }
    const allowedRoles = to.meta.roles as string[];
    const hasAccess = allowedRoles.some((role) => userRoles.includes(role));
    if (!hasAccess) {
      return next({ name: "error-403" });
    }
  }

  next();
});

export default router;
