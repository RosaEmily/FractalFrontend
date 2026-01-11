export interface ItemRule {
    value: number;
    messageError?: string;
    message?: string;
    showMessage?: boolean;
}

export interface Format {
    message?: string;
    items: string[];
    showMessage?: boolean;
}

export type KeyCharacteristics =
    | "size"
    | "messageDimension"
    | "width"
    | "height"
    | "formats";

export interface Rule {
    min?: ItemRule;
    max?: ItemRule;
    exact?: ItemRule;
}

export interface FileValidationResult {
    previewUrl: string;
    fileName: string;
    extension: string | null;
    sizeKB: number;
    width?: number;
    height?: number;
    errors?: string[];
}

export interface ValidationHandlers {
    onValid: (previewUrl: FileValidationResult) => void;
    onError: (errors: string[]) => void;
    onFinished?: () => void;
    onInit?: () => void;
    onDetailedError?: (errors: ValidationErrorDetail) => void;
}

export interface DimensionRules {
    width?: Rule;
    height?: Rule;
    message?: string;
}

export interface SingleValidationErrorDetail {
    message: string | null;
    hasError: boolean;
}

export type ValidationErrorDetail = {
    size: SingleValidationErrorDetail;
    format: SingleValidationErrorDetail;
    dimensions: SingleValidationErrorDetail;
};
