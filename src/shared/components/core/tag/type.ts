import type { TagProps } from "primevue/tag";

export interface TagCoreProps {
  value?: TagProps["value"];
  severity?: TagProps["severity"];
  rounded?: TagProps["rounded"];
  icon?: TagProps["icon"];
  dt?: TagProps["dt"];
  pt?: TagProps["pt"];
  ptOptions?: TagProps["ptOptions"];
  unstyled?: TagProps["unstyled"];
}
