import type { RouteLocationRaw } from "vue-router";

export interface MenuItem {
  id: string | number;
  label: string;
  icon?: string | null;
  route?: RouteLocationRaw | null;
  children?: MenuItem[];
  module?: string;
}
