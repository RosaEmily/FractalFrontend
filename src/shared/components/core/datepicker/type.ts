import type { DatePickerProps } from "primevue/datepicker";

export interface DatePickerCoreProps {
  label?: string;

  defaultValue?: DatePickerProps["defaultValue"];
  name?: DatePickerProps["name"];

  selectionMode?: DatePickerProps["selectionMode"];
  dateFormat?: DatePickerProps["dateFormat"];
  updateModelType?: DatePickerProps["updateModelType"];

  inline?: DatePickerProps["inline"];
  showOtherMonths?: DatePickerProps["showOtherMonths"];
  selectOtherMonths?: DatePickerProps["selectOtherMonths"];

  showIcon?: DatePickerProps["showIcon"];
  iconDisplay?: DatePickerProps["iconDisplay"];
  icon?: DatePickerProps["icon"];
  prevIcon?: DatePickerProps["prevIcon"];
  nextIcon?: DatePickerProps["nextIcon"];
  incrementIcon?: DatePickerProps["incrementIcon"];
  decrementIcon?: DatePickerProps["decrementIcon"];

  numberOfMonths?: DatePickerProps["numberOfMonths"];
  responsiveOptions?: DatePickerProps["responsiveOptions"];
  breakpoint?: DatePickerProps["breakpoint"];

  view?: DatePickerProps["view"];
  minDate?: DatePickerProps["minDate"];
  maxDate?: DatePickerProps["maxDate"];
  disabledDates?: DatePickerProps["disabledDates"];
  disabledDays?: DatePickerProps["disabledDays"];
  maxDateCount?: DatePickerProps["maxDateCount"];

  showOnFocus?: DatePickerProps["showOnFocus"];
  autoZIndex?: DatePickerProps["autoZIndex"];
  baseZIndex?: DatePickerProps["baseZIndex"];

  showButtonBar?: DatePickerProps["showButtonBar"];
  shortYearCutoff?: DatePickerProps["shortYearCutoff"];

  showTime?: DatePickerProps["showTime"];
  timeOnly?: DatePickerProps["timeOnly"];
  hourFormat?: DatePickerProps["hourFormat"];
  stepHour?: DatePickerProps["stepHour"];
  stepMinute?: DatePickerProps["stepMinute"];
  stepSecond?: DatePickerProps["stepSecond"];
  showSeconds?: DatePickerProps["showSeconds"];

  hideOnDateTimeSelect?: DatePickerProps["hideOnDateTimeSelect"];
  hideOnRangeSelection?: DatePickerProps["hideOnRangeSelection"];
  timeSeparator?: DatePickerProps["timeSeparator"];

  showWeek?: DatePickerProps["showWeek"];
  manualInput?: DatePickerProps["manualInput"];
  showClear?: DatePickerProps["showClear"];

  size?: DatePickerProps["size"];
  invalid?: DatePickerProps["invalid"];
  disabled?: DatePickerProps["disabled"];
  readonly?: DatePickerProps["readonly"];
  required?: DatePickerProps["required"];
  variant?: DatePickerProps["variant"];

  placeholder?: DatePickerProps["placeholder"];

  appendTo?: DatePickerProps["appendTo"];

  inputId?: DatePickerProps["inputId"];
  inputStyle?: DatePickerProps["inputStyle"];
  inputClass?: DatePickerProps["inputClass"];

  panelStyle?: DatePickerProps["panelStyle"];
  panelClass?: DatePickerProps["panelClass"];

  todayButtonProps?: DatePickerProps["todayButtonProps"];
  clearButtonProps?: DatePickerProps["clearButtonProps"];
  navigatorButtonProps?: DatePickerProps["navigatorButtonProps"];
  timepickerButtonProps?: DatePickerProps["timepickerButtonProps"];

  fluid?: DatePickerProps["fluid"];

  ariaLabel?: DatePickerProps["ariaLabel"];
  ariaLabelledby?: DatePickerProps["ariaLabelledby"];

  formControl?: DatePickerProps["formControl"];

  dt?: DatePickerProps["dt"];
  pt?: DatePickerProps["pt"];
  ptOptions?: DatePickerProps["ptOptions"];

  unstyled?: DatePickerProps["unstyled"];

  messageError?: string | null;
  /** Aclaración corta junto al label (el diseño la llama hint). */
  hintLabel?: string | null;

  dayjsFormatValue?: string;
  dayjsFormatInput?: string;

  dateUtc?: boolean;
}

export type DateInput = Date | string | null | undefined;
export type DateArrayInput = DateInput | DateInput[];
