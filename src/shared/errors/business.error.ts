export class BusinessError extends Error {
    public code: string;
    public errors: string[] | Record<string, string>;

    constructor(
        message: string,
        code: string,
        errors?: string[] | Record<string, string>
    ) {
        super(message);
        this.code = code;
        this.errors = errors ?? [];
    }
}
