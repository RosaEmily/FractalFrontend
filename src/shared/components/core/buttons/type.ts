import type { ButtonProps } from "primevue/button";

export interface ButtonCoreProps {
  style?: ButtonProps["style"];
  class?: ButtonProps["class"];
  label?: ButtonProps["label"];
  icon?: ButtonProps["icon"];
  iconPos?: ButtonProps["iconPos"];
  iconClass?: ButtonProps["iconClass"];
  badge?: ButtonProps["badge"];
  badgeClass?: ButtonProps["badgeClass"];
  badgeSeverity?: ButtonProps["badgeSeverity"];
  loading?: ButtonProps["loading"];
  loadingIcon?: ButtonProps["loadingIcon"];
  as?: ButtonProps["as"];
  asChild?: ButtonProps["asChild"];
  link?: ButtonProps["link"];
  severity?: ButtonProps["severity"];
  raised?: ButtonProps["raised"];
  rounded?: ButtonProps["rounded"];
  text?: ButtonProps["text"];
  outlined?: ButtonProps["outlined"];
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  plain?: ButtonProps["plain"];
  fluid?: ButtonProps["fluid"];
  dt?: ButtonProps["dt"];
  pt?: ButtonProps["pt"];
  ptOptions?: ButtonProps["ptOptions"];
  unstyled?: ButtonProps["unstyled"];
}
