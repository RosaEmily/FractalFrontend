import { BaseService } from "@/modules/admin/services/base.service";
import OfferRepository from "../repositories/offer.repository";
import type { OfferRepositoryTypes, OfferCourseItem } from "../models/offer.model";
import type { OfferCourseBodyDTO } from "../dto/offer.dto";

/**
 * Convierte los cursos del formulario al shape que espera la API:
 * `courses[n][course_id|teacher_id|start_date|end_date|schedules[m]]`.
 *
 * Los `id` se conservan cuando existen — la API hace upsert: con `id`
 * actualiza el registro, sin `id` lo crea.
 */
export const toCourseItems = (
  items: OfferCourseItem[] = [],
): OfferCourseBodyDTO[] =>
  items.map((item) => ({
    ...(item.id ? { id: item.id } : {}),
    course_id: Number(item.courseId),
    teacher_id: String(item.teacherId ?? ""),
    start_date: item.startDate ?? "",
    end_date: item.endDate ?? "",
    ...(item.meetLink ? { meet_link: item.meetLink } : {}),
    schedules: (item.schedules ?? []).map((schedule) => ({
      ...(schedule.id ? { id: schedule.id } : {}),
      day_of_week: schedule.dayOfWeek,
      start_time: schedule.startTime,
      end_time: schedule.endTime,
    })),
  }));

class OfferService extends BaseService<
  typeof OfferRepository,
  OfferRepositoryTypes
> {
  constructor() {
    super(OfferRepository);
  }
}

export default new OfferService();
