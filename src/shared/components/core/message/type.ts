import type { MessageProps } from "primevue/message";

export interface MessageCoreProps {
  severity?: MessageProps["severity"];

  closable?: MessageProps["closable"];

  sticky?: MessageProps["sticky"];

  life?: MessageProps["life"];

  icon?: MessageProps["icon"];

  closeIcon?: MessageProps["closeIcon"];

  closeButtonProps?: MessageProps["closeButtonProps"];

  dt?: MessageProps["dt"];

  pt?: MessageProps["pt"];

  ptOptions?: MessageProps["ptOptions"];

  unstyled?: MessageProps["unstyled"];

  size?: MessageProps["size"];

  variant?: MessageProps["variant"];

  text: string;
}
