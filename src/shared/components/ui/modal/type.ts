import { Component } from "vue";

export type SeverityConfig = {
    icon: string | Component;
    title?: string;
    content?: string;
};
