import type { TooltipOptions } from "primevue/tooltip";
import type { Position } from "@/shared/interface/general";

export interface TooltipCoreProps {
  /**
   * Tooltip text
   */
  value?: TooltipOptions["value"] | null;

  /**
   * top | right | bottom | left
   */
  position?: Position;

  /**
   * Disables the tooltip
   */
  disabled?: TooltipOptions["disabled"];

  /**
   * Custom id
   */
  id?: TooltipOptions["id"];

  /**
   * Custom class
   */
  class?: TooltipOptions["class"];

  /**
   * Escape HTML or not
   */
  escape?: TooltipOptions["escape"];

  /**
   * Auto adjust on overflow
   */
  fitContent?: TooltipOptions["fitContent"];

  /**
   * Delay before showing
   */
  showDelay?: TooltipOptions["showDelay"];

  /**
   * Delay before hiding
   */
  hideDelay?: TooltipOptions["hideDelay"];

  /**
   * Hide when hovering tooltip content
   */
  autoHide?: TooltipOptions["autoHide"];

  tag?: string;
}
