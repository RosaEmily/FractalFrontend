export interface PermissionDTO {
  id: number;
  name: string;
  description: string;
  status: number;
  is_system?: number | boolean;
  created_at: Date;
  updated_at: Date;
}

export type PermissionCreateBodyDTO = {
  name: string | null;
  description: string | null;
};

export type PermissionUpdateBodyDTO = {
  name?: string;
  description?: string;
};
