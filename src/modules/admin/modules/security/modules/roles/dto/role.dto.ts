export interface RoleDTO {
  id: number;
  name: string;
  description: string;
  status: number;
  created_at: Date;
  updated_at: Date;
  permissions: string[];
}
