import type { DataPaginationMeta } from "@/shared/interface/api-response";

import type {
  CreateBody,
  CreateModel,
  EditModel,
  ListModel,
  UpdateBody,
  UpdateModel,
  RepositoryTypes,
} from "../interface/base-repository";
import type { BaseRepository } from "../repositories/base.repository";

export abstract class BaseService<
  TRepo extends BaseRepository<T>,
  T extends RepositoryTypes = any,
> {
  protected repository: TRepo;

  constructor(repository: TRepo) {
    this.repository = repository;
  }

  // LIST
  async list(params?: unknown): Promise<DataPaginationMeta<ListModel<T>>> {
    const resp = await this.repository.list(params);

    if (!resp.data) {
      throw new Error("No hay data en el repositorio");
    }

    return resp.data;
  }

  // ALL
  async all(params?: unknown): Promise<ListModel<T>[]> {
    const resp = await this.repository.all(params);
    if (!resp.data) {
      throw new Error("No hay data en el repositorio");
    }
    return resp.data;
  }

  // EDIT
  async edit(id: number | string): Promise<EditModel<T> | null> {
    const resp = await this.repository.edit(id);
    return resp.data;
  }

  // CREATE
  async create(body: CreateBody<T>): Promise<CreateModel<T> | null> {
    const resp = await this.repository.create(body);
    return resp.data;
  }

  // UPDATE
  async update(
    id: number | string,
    body: UpdateBody<T>,
  ): Promise<UpdateModel<T> | null> {
    const resp = await this.repository.update(id, body);
    return resp.data;
  }

  // DELETE
  async delete(ids: (number | string)[]): Promise<null> {
    const resp = await this.repository.delete(ids);
    return resp.data;
  }

  // STATUS
  async status(ids: (number | string)[], status: 0 | 1): Promise<null> {
    const resp = await this.repository.status(ids, status);
    return resp.data;
  }
}
