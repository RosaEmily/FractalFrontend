import dayjs from "dayjs";
import type { ClassSession } from "../models/class-session.model";
import type { ClassSessionDTO } from "../dto/class-session.dto";

export const ClassSessionAdapter = {
  one: (dto: ClassSessionDTO): ClassSession => ({
    id: dto.id,
    scheduleId: dto.schedule_id ?? null,
    sessionDate: dto.session_date
      ? dayjs(dto.session_date).format("DD/MM/YYYY")
      : "—",
    // El formulario necesita la fecha cruda: la formateada no la parsea el picker.
    sessionDateRaw: dto.session_date
      ? dayjs(dto.session_date).format("YYYY-MM-DD")
      : null,
    startTime: dto.start_time ?? null,
    endTime: dto.end_time ?? null,
    name: dto.name,
    topic: dto.topic,
    meetLink: dto.meet_link,
    offerId: dto.offer_id ?? null,
    offerCourseId: dto.offer_course_id ?? null,
    courseName: dto.course_name ?? null,
    status: dto.status,
    updated_at: dto.updated_at,
  }),

  many: (dtos: ClassSessionDTO[]): ClassSession[] =>
    dtos.map((dto) => ClassSessionAdapter.one(dto)),
};
