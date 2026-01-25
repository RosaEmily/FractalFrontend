import apiFractal from "@/shared/helpers/axios/api-fractal";
import type {
  ApiResponse,
  DataPaginationMeta,
} from "@/shared/interface/api-response";
import type {
  ListAdapter,
  CreateBody,
  CreateDTO,
  CreateModel,
  EditDTO,
  EditModel,
  ListDTO,
  ListModel,
  UpdateBody,
  UpdateDTO,
  UpdateModel,
  EditAdapter,
  CreateAdapter,
  UpdateAdapter,
  RepositoryTypes,
} from "../interface/base-repository";

export abstract class BaseRepository<T extends RepositoryTypes> {
  protected route: string;

  /** Adapter base obligatorio */
  protected baseAdapter: T["base"]["adapter"];

  /** Adapters opcionales para métodos específicos */
  protected adapters: {
    list?: ListAdapter<T>;
    edit?: EditAdapter<T>;
    create?: CreateAdapter<T>;
    update?: UpdateAdapter<T>;
  };

  constructor(
    route: string,
    baseAdapter: T["base"]["adapter"],
    adapters?: Partial<Omit<BaseRepository<T>["adapters"], "base">>,
  ) {
    this.route = route;
    this.baseAdapter = baseAdapter;
    this.adapters = adapters ?? {};
  }

  /** Devuelve el adapter correcto, usando fallback al baseAdapter */
  protected getAdapter<K extends keyof RepositoryTypes>(
    key: K,
  ): K extends "list"
    ? ListAdapter<T>
    : K extends "edit"
      ? EditAdapter<T>
      : K extends "create"
        ? CreateAdapter<T>
        : K extends "update"
          ? UpdateAdapter<T>
          : never {
    return (this.adapters[key as keyof typeof this.adapters] ??
      this.baseAdapter) as any;
  }

  async list(
    params?: unknown,
  ): Promise<ApiResponse<DataPaginationMeta<ListModel<T>>>> {
    const response = await apiFractal.get<DataPaginationMeta<ListDTO<T>>>(
      this.route,
      { params },
    );
    const adapter = this.getAdapter("list") as ListAdapter<T>;

    if (!response.data || !adapter.many) {
      throw new Error("Respuesta inválida");
    }
    return {
      ...response,
      data: {
        meta: response.data.meta,
        items: adapter.many(response.data.items),
      },
    };
  }

  async edit(id: number | string): Promise<ApiResponse<EditModel<T> | null>> {
    const response = await apiFractal.get<EditDTO<T>>(`${this.route}/${id}`);

    const adapter = this.getAdapter("edit") as EditAdapter<T>;

    return {
      ...response,
      data: response.data && adapter ? adapter.one(response.data) : null,
    };
  }

  async create(
    body: CreateBody<T>,
  ): Promise<ApiResponse<CreateModel<T> | null>> {
    const response = await apiFractal.post<CreateDTO<T>>(this.route, body);

    const adapter = this.getAdapter("create") as CreateAdapter<T>;

    return {
      ...response,
      data: response.data && adapter ? adapter.one(response.data) : null,
    };
  }

  async update(
    id: number | string,
    body: UpdateBody<T>,
  ): Promise<ApiResponse<UpdateModel<T> | null>> {
    const response = await apiFractal.put<UpdateDTO<T>>(
      `${this.route}/${id}`,
      body,
    );

    const adapter = this.getAdapter("update") as UpdateAdapter<T>;

    return {
      ...response,
      data: response.data && adapter ? adapter.one(response.data) : null,
    };
  }

  async delete(ids: (number | string)[]): Promise<ApiResponse<null>> {
    return apiFractal.post(`${this.route}/bulk-delete`, { ids });
  }

  async status(
    ids: (number | string)[],
    status: 0 | 1,
  ): Promise<ApiResponse<null>> {
    return apiFractal.patch(`${this.route}/actions/update-status`, {
      ids,
      status,
    });
  }
}
