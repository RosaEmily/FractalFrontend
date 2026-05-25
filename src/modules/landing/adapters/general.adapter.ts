import {
  AcademicCapIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  SparklesIcon,
  KeyIcon,
} from "@heroicons/vue/24/outline";
import type { FunctionalComponent } from "vue";
import type { GeneralDTO } from "../dto/general.dto";
import type { General } from "../models/general.model";

const KPI_ICONS: FunctionalComponent[] = [
  AcademicCapIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  SparklesIcon,
];

export const GeneralAdapter = {
  one: (dto: GeneralDTO): General => ({
    logo: dto.logo,
    banner: dto.banner.map((b, i) => ({
      ...b,
      image_alt: `Banner número ${i + 1}`,
    })),
    kpis: dto.kpis.map((k, i) => ({
      id: String(k.id),
      label: k.description,
      value: k.number,
      suffix: k.format.replace('{n}', '').trim() || undefined,
      icon: KPI_ICONS[i] ?? KeyIcon,
    })),
    partners: dto.partners.map((p) => ({
      id: p.id,
      name: p.name,
      image_url: p.image,
      image_alt: p.name,
    })),
  }),
};
