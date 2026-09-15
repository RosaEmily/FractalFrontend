import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { SystemSessionDTO } from "../dto/session.dto";

export interface SystemSession {
  id: number;
  userName: string;
  userEmail: string;
  roles: string[];
  /** "Panel" / "Aula", ya resuelto para la UI. */
  zoneLabel: string;
  device: string;
  location: string;
  ipAddress: string;
  expiresAt: string;
  lastActivity: string;
  updated_at: string;
}

export interface SystemSessionRepositoryTypes {
  base: RepositoryBase<SystemSession, SystemSessionDTO>;
}
