import {
  mdiCellphone,
  mdiTablet,
  mdiMonitor,
  mdiWeb,
} from "@mdi/js";
import type { Profile, Session } from "../models/profile.model";
import type { ProfileDTO, SessionDTO } from "../dto/profile.dto";

export const profileAdapter = {
  one: (dto: ProfileDTO): Profile => ({
    id: dto.id,
    email: dto.email,
    first_name: dto.first_name,
    last_name: dto.last_name,
    full_name: `${dto.first_name ?? ""} ${dto.last_name ?? ""}`.trim(),
    photo_url: dto.photo_url,
    gender: dto.gender,
    gender_name: dto.gender_name,
    roles: (dto.roles ?? []).map((role) => ({
      name: role.name,
      description: role.description,
    })),
    created_at: dto.created_at,
    updated_at: dto.updated_at,
    password_changed_at: dto.password_changed_at,
    status: dto.status,
    max_sessions: dto.max_sessions,
  }),

  many: (dtos: ProfileDTO[]): Profile[] =>
    dtos.map((dto) => profileAdapter.one(dto)),
};

/**
 * El backend guarda el User-Agent crudo en device_info. Cuando el front no
 * envía las cabeceras Browser/Device-Type, se extrae una etiqueta legible.
 */
const readableBrowser = (dto: SessionDTO): string | null => {
  if (dto.browser) return dto.browser;

  const ua = dto.device_info ?? "";
  if (!ua) return null;

  const match = ua.match(/(Edg|OPR|Chrome|Firefox|Safari)\/[\d.]+/);
  const engine = match?.[1];
  if (!engine) return null;

  const labels: Record<string, string> = {
    Edg: "Edge",
    OPR: "Opera",
    Chrome: "Chrome",
    Firefox: "Firefox",
    Safari: "Safari",
  };
  return labels[engine] ?? engine;
};

const readableDevice = (dto: SessionDTO): string | null => {
  if (dto.device_type) return dto.device_type;

  const ua = dto.device_info ?? "";
  if (!ua) return null;
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Macintosh|Mac OS/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "PC Windows";
  if (/Linux|X11/i.test(ua)) return "PC Linux";
  return null;
};

/** Sistema operativo legible, cuando el User-Agent lo permite. */
const readableOs = (dto: SessionDTO): string | null => {
  const ua = dto.device_info ?? "";
  if (!ua) return null;
  if (/Windows NT 10/i.test(ua)) return "Windows 10/11";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac OS X|Macintosh/i.test(ua)) return "macOS";
  if (/iPhone|iPad|iOS/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Linux|X11/i.test(ua)) return "Linux";
  return null;
};

/** Devuelve el path mdi del icono; el proyecto no usa primeicons. */
const deviceIcon = (dto: SessionDTO): string => {
  const ua = dto.device_info ?? "";
  if (/iPhone|Android.*Mobile/i.test(ua)) return mdiCellphone;
  if (/iPad|Tablet/i.test(ua)) return mdiTablet;
  if (/Windows|Macintosh|Linux|X11/i.test(ua)) return mdiMonitor;
  return mdiWeb;
};

export const sessionAdapter = {
  one: (dto: SessionDTO): Session => ({
    id: dto.id,
    ip_address: dto.ip_address,
    device_info: dto.device_info,
    browser: readableBrowser(dto),
    device_type: readableDevice(dto),
    os: readableOs(dto),
    icon: deviceIcon(dto),
    location: dto.geo_location,
    last_activity: dto.updated_at,
    expires_at: dto.expires_at,
    is_current: dto.is_current,
  }),

  many: (dtos: SessionDTO[]): Session[] =>
    dtos.map((dto) => sessionAdapter.one(dto)),
};
