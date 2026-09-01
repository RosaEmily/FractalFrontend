import type {
  Offer,
  OfferCourseItem,
  OfferSchedule,
} from "../models/offer.model";
import type { OfferDTO } from "../dto/offer.dto";
import dayjs from "dayjs";
import { OFFER_TYPE_LABEL } from "../constants/offer.constant";

/** Rango de matrícula como lo muestra el diseño: "01/03 – 15/05". */
const formatRange = (start?: string | null, end?: string | null): string => {
  if (!start && !end) return "—";
  const fmt = (value?: string | null) =>
    value ? dayjs(value).format("DD/MM") : "—";
  return `${fmt(start)} – ${fmt(end)}`;
};

export const OfferAdapter = {
  one: (dto: OfferDTO): Offer => {
    const courseItems: OfferCourseItem[] = (dto.course_items ?? []).map(
      (item) => ({
        id: item.id,
        courseId: item.course_id,
        name: item.name,
        teacherId: item.teacher_id,
        startDate: item.start_date,
        endDate: item.end_date,
        meetLink: item.meet_link,
        schedules: (item.schedules ?? []).map(
          (schedule): OfferSchedule => ({
            id: schedule.id,
            dayOfWeek: schedule.day_of_week,
            startTime: schedule.start_time,
            endTime: schedule.end_time,
          }),
        ),
      }),
    );

    return {
      id: dto.id,
      name: dto.name,
      prefix: dto.prefix,
      type: dto.type,
      typeLabel: OFFER_TYPE_LABEL[dto.type] ?? dto.type,
      learningPathId: dto.learning_path_id,
      learningPathName: dto.learning_path,
      enrollmentStartDate: dto.enrollment_start_date,
      enrollmentEndDate: dto.enrollment_end_date,
      minStudents: dto.min_students,
      maxStudents: dto.max_students,
      enrolledStudentsCount: dto.enrolled_students_count,
      seats: `${dto.enrolled_students_count}/${dto.max_students}`,
      enrollmentRange: formatRange(
        dto.enrollment_start_date,
        dto.enrollment_end_date,
      ),
      price: dto.price,
      priceRaw: dto.price_raw !== null ? Number(dto.price_raw) : null,
      currencyId: dto.currency_id,
      imageUrl: dto.image_url,
      status: dto.status,
      created_at: dto.created_at,
      updated_at: dto.updated_at,
      courseItems,
    };
  },

  many: (dtos: OfferDTO[]): Offer[] => dtos.map((dto) => OfferAdapter.one(dto)),
};
