export interface RoleDTO {
  id: number;
  name: string;
  description: string;
  status: number;
  created_at: Date;
  updated_at: Date;
  permissions: string[];
  permissionIds: number[];
}

export interface RoleBodyDTO {
  name: string | null;
  description: string | null;
  permissions?: number[];
}
