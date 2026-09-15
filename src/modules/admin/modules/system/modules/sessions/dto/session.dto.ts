export interface SystemSessionDTO {
  id: number;
  ip_address: string | null;
  device_info: string | null;
  browser: string | null;
  device_type: string | null;
  geo_location: string | null;
  user_name: string | null;
  user_email: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}
