export type RedirectType = "external" | "internal";

export interface GoToOptions<
    TParams extends Record<string, unknown> = Record<string, unknown>,
    TQuery extends Record<string, unknown> = Record<string, unknown>
> {
    type?: RedirectType;
    params?: TParams;
    query?: TQuery;
    newTab?: boolean;
    reload?: boolean;
}
