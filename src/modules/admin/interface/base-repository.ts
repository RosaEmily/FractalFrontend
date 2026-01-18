// Base adapter
export interface Adapter<Model, DTO> {
  one(dto: DTO): Model;
  many(dto: DTO[]): Model[];
}

// Base repository unit
export interface RepositoryBase<Model = unknown, DTO = unknown> {
  dto: DTO;
  model: Model;
  adapter: Adapter<Model, DTO>;
}

// Repository types con opcionales por método
export interface RepositoryTypes {
  base: RepositoryBase;

  list?: Partial<RepositoryBase>;
  edit?: Partial<RepositoryBase>;
  create?: Partial<RepositoryBase> & { body: unknown };
  update?: Partial<RepositoryBase> & { body: unknown };
}

// Tipos auxiliares para resolver DTO / Model
type BaseDTO<T extends RepositoryTypes> = T["base"]["dto"];
type BaseModel<T extends RepositoryTypes> = T["base"]["model"];

type ResolveDTO<
  T extends RepositoryTypes,
  K extends keyof RepositoryTypes,
> = T[K] extends { dto: infer D } ? D : BaseDTO<T>;
type ResolveModel<
  T extends RepositoryTypes,
  K extends keyof RepositoryTypes,
> = T[K] extends { model: infer M } ? M : BaseModel<T>;

export type ListDTO<T extends RepositoryTypes> = ResolveDTO<T, "list">;
export type ListModel<T extends RepositoryTypes> = ResolveModel<T, "list">;
export type EditDTO<T extends RepositoryTypes> = ResolveDTO<T, "edit">;
export type EditModel<T extends RepositoryTypes> = ResolveModel<T, "edit">;
export type CreateDTO<T extends RepositoryTypes> = ResolveDTO<T, "create">;
export type CreateModel<T extends RepositoryTypes> = ResolveModel<T, "create">;
export type UpdateDTO<T extends RepositoryTypes> = ResolveDTO<T, "update">;
export type UpdateModel<T extends RepositoryTypes> = ResolveModel<T, "update">;

// Body
export type CreateBody<T extends RepositoryTypes> = T["create"] extends {
  body: infer B;
}
  ? B
  : never;
export type UpdateBody<T extends RepositoryTypes> = T["update"] extends {
  body: infer B;
}
  ? B
  : never;

// Adapters por método
export type ListAdapter<T extends RepositoryTypes> = Adapter<
  ListModel<T>,
  ListDTO<T>
>;
export type EditAdapter<T extends RepositoryTypes> = Adapter<
  EditModel<T>,
  EditDTO<T>
>;
export type CreateAdapter<T extends RepositoryTypes> = Adapter<
  CreateModel<T>,
  CreateDTO<T>
>;
export type UpdateAdapter<T extends RepositoryTypes> = Adapter<
  UpdateModel<T>,
  UpdateDTO<T>
>;
