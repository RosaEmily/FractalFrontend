import { safeWebUrl } from "@/shared/utils/safe-url";
import type { TeacherDetailDTO, TeacherDTO } from "../dto/teacher.dto";
import type { Teacher, TeacherDetail, TeacherList } from "../models/teacher.model";

const socialLinks = (links: TeacherDTO["social_networks"]) => ({
  linkedin: safeWebUrl(links?.linkedin),
  instagram: safeWebUrl(links?.instagram),
  other: safeWebUrl(links?.other),
});

export const TeacherAdapter = {
  one: (dto: TeacherDTO): Teacher => ({ ...dto, cv: safeWebUrl(dto.cv) ?? "", social_networks: socialLinks(dto.social_networks) }),

  many: (dto: TeacherDTO[]): TeacherList => ({
    teachers: dto.map((t) => TeacherAdapter.one(t)),
  }),

  detail: (dto: TeacherDetailDTO): TeacherDetail => ({ ...dto, social_networks: socialLinks(dto.social_networks) }),
};
