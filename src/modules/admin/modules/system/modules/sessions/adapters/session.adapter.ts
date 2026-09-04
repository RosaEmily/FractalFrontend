import dayjs from "dayjs";
import type { SystemSession } from "../models/session.model";
import type { SystemSessionDTO } from "../dto/session.dto";

/**
 * El User-Agent crudo llega en device_info cuando el front no envía las
 * cabeceras Browser/Device-Type; se extrae una etiqueta legible.
 */
const readableDevice = (dto: SystemSessionDTO): string => {
  const parts = [dto.device_type, dto.browser].filter(Boolean);
  if (parts.length) return parts.join(" · ");

  const ua = dto.device_info ?? "";
  if (!ua) return "—";
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/Android/i.test(ua)) return "Android";
  if (/Macintosh|Mac OS/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "PC Windows";
  if (/Linux|X11/i.test(ua)) return "PC Linux";
  return "—";
};

/** La zona cruda de la API no es texto de interfaz. */
const ZONE_LABEL: Record<string, string> = {
  admin: "Panel",
  classroom: "Aula",
};

export const SystemSessionAdapter = {
  one: (dto: SystemSessionDTO): SystemSession => ({
    id: dto.id,
    userName: dto.user_name ?? "—",
    userEmail: dto.user_email ?? "—",
    roles: dto.user_roles ?? [],
    zoneLabel: ZONE_LABEL[dto.zone ?? ""] ?? "Panel",
    device: readableDevice(dto),
    location: dto.geo_location ?? "—",
    ipAddress: dto.ip_address ?? "—",
    expiresAt: dto.expires_at
      ? dayjs(dto.expires_at).format("DD/MM/YYYY HH:mm")
      : "—",
    lastActivity: dto.updated_at
      ? dayjs(dto.updated_at).format("DD/MM/YYYY HH:mm")
      : "—",
    updated_at: dto.updated_at,
  }),

  many: (dtos: SystemSessionDTO[]): SystemSession[] =>
    dtos.map((dto) => SystemSessionAdapter.one(dto)),
};
