import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { ClassSessionRepositoryTypes } from "../models/class-session.model";
import { ClassSessionAdapter } from "../adapters/class-session.adapter";

class ClassSessionRepository extends BaseRepository<ClassSessionRepositoryTypes> {
  constructor() {
    super("offers/class-sessions", ClassSessionAdapter);
  }
}

export default new ClassSessionRepository();
