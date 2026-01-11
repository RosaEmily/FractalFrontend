export type LoadingType = "joinnus" | "spinner";

export type SpinnerInfo = {
    text?: string;
};

export type LoadingDetails =
    | { type: "spinner"; info?: SpinnerInfo }
    | { type: "joinnus" };
