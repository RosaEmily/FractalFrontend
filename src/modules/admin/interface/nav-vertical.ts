import type { RouteLocationRaw } from "vue-router";

export interface MenuItem {
  id: string | number;
  label: string;
  icon?: string | null;
  route?: RouteLocationRaw | null;
  roles?: string[];
  children?: MenuItem[];
  module?: string;
}
