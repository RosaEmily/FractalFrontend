export interface BaseItem<T = number | string | boolean> {
    id: T;
    name: string;
}
export interface BaseCheckedItem {
    label: string;
    checked: boolean;
}
