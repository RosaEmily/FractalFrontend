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
      ...k,
      icon: KPI_ICONS[i] ?? KeyIcon,
    })),
    partners: dto.partners.map((p) => ({
      ...p,
      image_alt: `Logo de ${p.name}`,
    })),
  }),
};
