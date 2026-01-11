import type { ToastMessageOptions } from "primevue/toast";

export interface ToastOptions extends ToastMessageOptions {
    position?:
        | "center"
        | "top-left"
        | "top-center"
        | "top-right"
        | "bottom-left"
        | "bottom-center"
        | "bottom-right";
    closable?: boolean;
    showIcon?: boolean;
}

export interface ToastStatusMessage {
    status: boolean;
    message: string;
}
