import type { PhoneCountry } from "./countries";

export interface InputPhoneCoreProps {
  label?: string;
  name?: string;
  required?: boolean;
  hintLabel?: string;
  invalid?: boolean;
  messageError?: string;
  placeholder?: string;
  disabled?: boolean;
  countries?: PhoneCountry[];
}
