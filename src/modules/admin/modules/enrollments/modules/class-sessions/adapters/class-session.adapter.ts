import dayjs from "dayjs";
import type { ClassSession } from "../models/class-session.model";
import type { ClassSessionDTO } from "../dto/class-session.dto";

export const ClassSessionAdapter = {
  one: (dto: ClassSessionDTO): ClassSession => ({
    id: dto.id,
    sessionDate: dto.session_date
      ? dayjs(dto.session_date).format("DD/MM/YYYY")
      : "—",
    name: dto.name,
    topic: dto.topic,
    meetLink: dto.meet_link,
    status: dto.status,
    updated_at: dto.updated_at,
  }),

  many: (dtos: ClassSessionDTO[]): ClassSession[] =>
    dtos.map((dto) => ClassSessionAdapter.one(dto)),
};
