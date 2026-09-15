import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { UserDTO, UserBodyDTO } from "../dto/user.dto";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  photo_url: string | null;
  gender_name: string | null;
  roles: string[];
  status: number;
  updated_at: string;
}

export interface UserRepositoryTypes {
  base: RepositoryBase<User, UserDTO>;
  create: { body: UserBodyDTO };
  update: { body: UserBodyDTO };
}
