import type { Component } from "vue";
import type { ButtonCoreProps } from "@/shared/components/type";
import type { ClassNameValue } from "@/shared/interface/class";
export interface ModalConfirmationProps {
  icon?: Component | string;
  iconShow?: boolean;
  iconClass?: ClassNameValue;

  title?: string;
  titleClass?: ClassNameValue;
  description?: string;
  descriptionClass?: ClassNameValue;
  containerDescriptionClass?: ClassNameValue;

  closeIsOutside?: boolean; // si el close va fuera del modal
  closeHasBg?: boolean; // si tiene fondo circular
  closeWrapperClass?: ClassNameValue; // clases extras para el div wrapper
  closeIconClass?: ClassNameValue; // clases extras para el ícono
  closeShow?: boolean;
  closeIcon?: Component | string;

  customHeight?: string;

  headerContainerClass?: string;

  descriptionContainerClass?: string;

  footerBorderShadow?: boolean;
  footerContainerClass?: ClassNameValue; // clases extras para el contenedor de los botones

  // ---------- FOOTER BUTTONS ----------
  buttonCancel?: ButtonCoreProps;
  buttonCancelShow?: boolean;
  buttonConfirm?: ButtonCoreProps;
  buttonConfirmShow?: boolean;
}

export interface ModalConfirmationEmits {
  (e: "cancel"): void;
  (e: "confirm"): void;
}
