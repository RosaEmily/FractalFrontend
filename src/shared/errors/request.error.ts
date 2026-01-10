export class RequestError extends Error {
    public httpCode: number;
    public code: string;
    public errors: string[] | Record<string, string>;

    constructor(
        message: string,
        code: string,
        httpCode: number,
        errors?: string[] | Record<string, string>
    ) {
        super(message);
        this.httpCode = httpCode;
        this.code = code;
        this.errors = errors ?? [];
    }
}
