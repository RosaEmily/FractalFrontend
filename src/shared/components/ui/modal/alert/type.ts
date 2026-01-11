import type { ClassNameValue } from "@/shared/interface/class";
import type { Severity } from "@/shared/interface/general";
import type { Component } from "vue";

export interface ModalAlertProps {
  severity: Severity;
  icon?: Component | string;
  showIcon?: boolean;
  classIcon?: string;
  title?: string;
  content?: string;
  labelButton?: string;
  autoClose?: boolean;
  autoCloseTime?: number;
  classTitle?: ClassNameValue;
  classContent?: ClassNameValue;
  buttonSize?: ButtonSize;
  classContainer?: ClassNameValue;
}

export type ButtonSize = "sm" | "md" | "lg";
