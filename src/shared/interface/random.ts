export type IdCharType = "alphanumeric" | "numeric" | "letters";

export interface GenerateIdOptions {
    prefix?: string;
    suffix?: string;
    length?: number; // default 6
    type?: IdCharType; // default "alphanumeric"
}
