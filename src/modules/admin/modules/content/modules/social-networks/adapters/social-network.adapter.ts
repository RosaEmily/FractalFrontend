import {
  mdiFacebook,
  mdiInstagram,
  mdiLinkedin,
  mdiYoutube,
  mdiTwitter,
  mdiWhatsapp,
  mdiWeb,
} from "@mdi/js";
import type { SocialNetwork } from "../models/social-network.model";
import type { SocialNetworkDTO } from "../dto/social-network.dto";

/** Icono mdi por plataforma; mdiWeb cubre las que no están en la lista. */
const PLATFORM_ICONS: Record<string, string> = {
  facebook: mdiFacebook,
  instagram: mdiInstagram,
  linkedin: mdiLinkedin,
  youtube: mdiYoutube,
  twitter: mdiTwitter,
  x: mdiTwitter,
  whatsapp: mdiWhatsapp,
};

export const socialNetworkAdapter = {
  one: (dto: SocialNetworkDTO): SocialNetwork => ({
    id: dto.id,
    name: dto.name,
    url: dto.url,
    icon: PLATFORM_ICONS[(dto.name ?? "").toLowerCase()] ?? mdiWeb,
  }),

  many: (dtos: SocialNetworkDTO[]): SocialNetwork[] =>
    dtos.map((dto) => socialNetworkAdapter.one(dto)),
};
