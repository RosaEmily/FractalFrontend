export interface PermissionDTO {
  id: number;
  name: string;
  description: string;
  status: number;
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
