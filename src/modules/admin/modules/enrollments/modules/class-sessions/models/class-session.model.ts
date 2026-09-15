import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type {
  ClassSessionDTO,
  ClassSessionBodyDTO,
} from "../dto/class-session.dto";

export interface ClassSession {
  id: number;
  sessionDate: string;
  name: string;
  topic: string | null;
  meetLink: string | null;
  status: number;
  updated_at: string;
}

export interface ClassSessionRepositoryTypes {
  base: RepositoryBase<ClassSession, ClassSessionDTO>;
  create: { body: ClassSessionBodyDTO };
  update: { body: ClassSessionBodyDTO };
}
