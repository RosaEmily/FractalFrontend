import type {
  EvaluationDTO,
  MaterialDTO,
  ScheduleDTO,
  SessionDTO,
  StudentCertificateDTO,
  StudentCourseDTO,
} from "../dto/classroom.dto";
import type {
  Evaluation,
  Material,
  Schedule,
  Session,
  StudentCertificate,
  StudentCourse,
} from "../models/classroom.model";
import {
  ATTENDANCE_LABEL,
  ATTENDANCE_TONE,
  COURSE_STATE_LABEL,
  COURSE_STATE_TONE,
  WEEKDAY_LABEL,
} from "../constants/labels";
import { formatBytes } from "../utils/format";

/** Nota aprobatoria institucional. Solo se usa si la BD no trae ninguna. */
const DEFAULT_PASSING_SCORE = 13;

/** MySQL serializa los decimales como string; el resto del front espera number. */
const toNumber = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

/** `18:00:00` → `18:00`. La hora con segundos no aporta nada en pantalla. */
const toShortTime = (value: string | null): string | null =>
  value ? value.slice(0, 5) : null;

const scheduleAdapter = (dto: ScheduleDTO): Schedule => ({
  id: dto.id,
  dayOfWeek: dto.day_of_week,
  dayLabel: WEEKDAY_LABEL[dto.day_of_week] ?? dto.day_of_week,
  startTime: toShortTime(dto.start_time),
  endTime: toShortTime(dto.end_time),
});

export const sessionAdapter = (dto: SessionDTO): Session => ({
  id: dto.id,
  scheduleId: dto.schedule_id,
  enrollmentCourseId: dto.enrollment_course_id,
  date: dto.session_date,
  startTime: toShortTime(dto.start_time),
  endTime: toShortTime(dto.end_time),
  name: dto.name,
  topic: dto.topic,
  meetLink: dto.meet_link,
  isDone: dto.is_done,
  attended: dto.attended,
  attendedLabel:
    dto.attended === null ? null : (ATTENDANCE_LABEL[dto.attended] ?? null),
  attendedTone:
    dto.attended === null ? null : (ATTENDANCE_TONE[dto.attended] ?? null),
  attendedAt: dto.attended_at,
  courseName: dto.course_name,
  offerName: dto.offer_name,
});

/**
 * La aprobación se compara contra la nota mínima del curso, que puede diferir
 * por cohorte: por eso el adapter la recibe en vez de asumir un 13.
 */
const evaluationAdapter = (
  dto: EvaluationDTO,
  passingScore: number,
): Evaluation => {
  const score = toNumber(dto.score);

  return {
    id: dto.id,
    name: dto.name,
    weight: toNumber(dto.weight) ?? 0,
    maxScore: toNumber(dto.max_score) ?? 20,
    typeName: dto.evaluation_type_name,
    score,
    feedback: dto.feedback,
    evaluatedAt: dto.evaluated_at,
    contribution: toNumber(dto.contribution),
    passed: score === null ? null : score >= passingScore,
  };
};

export const materialAdapter = (dto: MaterialDTO): Material => ({
  id: dto.id,
  classSessionId: dto.class_session_id,
  name: dto.name,
  url: dto.url,
  type: dto.type,
  typeLabel: dto.type_label,
  size: dto.size,
  sizeLabel: formatBytes(dto.size),
  visibleFrom: dto.visible_from,
  isVisible: dto.is_visible,
  uploaderName: dto.uploader_name,
  sessionName: dto.session_name ?? null,
  sessionDate: dto.session_date ?? null,
});

/** Texto del horario: "Lunes 18:00–20:00 · Miércoles 14:00–16:00". */
const scheduleText = (schedules: Schedule[]): string =>
  schedules
    .map((s) => `${s.dayLabel} ${s.startTime ?? "—"}–${s.endTime ?? "—"}`)
    .join(" · ");

export const studentCourseAdapter = {
  one: (dto: StudentCourseDTO): StudentCourse => {
    /*
     * Precedencia de la nota mínima: la cohorte pisa al curso, y el curso al
     * default institucional. Es la misma regla que aplica el backend al cerrar
     * el acta — acá se replica solo para pintar el color de cada nota.
     */
    const passingScore =
      toNumber(dto.offer_passing_score) ??
      toNumber(dto.course_passing_score) ??
      DEFAULT_PASSING_SCORE;

    const schedules = (dto.schedules ?? []).map(scheduleAdapter);

    return {
      id: dto.id,
      offerCourseId: dto.offer_course_id,
      enrollmentId: dto.enrollment_id,
      progressStatus: dto.progress_status,
      state: dto.state,
      stateLabel: COURSE_STATE_LABEL[dto.state] ?? dto.state,
      stateTone: COURSE_STATE_TONE[dto.state] ?? "neutral",

      courseId: dto.course_id,
      courseName: dto.course_name,
      courseDescription: dto.course_description,
      courseImage: dto.course_image_url,

      offerId: dto.offer_id,
      offerName: dto.offer_name,
      offerPrefix: dto.offer_prefix,
      offerType: dto.offer_type,
      learningPathId: dto.learning_path_id,

      teacherName: dto.teacher_name,
      teacherSpecialty: dto.teacher_specialty,

      startDate: dto.start_date,
      endDate: dto.end_date,
      meetLink: dto.meet_link,
      schedules,
      scheduleText: scheduleText(schedules),

      sessionsTotal: dto.sessions_total,
      sessionsDone: dto.sessions_done,
      sessionsPercent: dto.sessions_percent,

      weightTotal: toNumber(dto.weight_total) ?? 0,
      evaluatedWeight: toNumber(dto.evaluated_weight) ?? 0,
      weightPercent: dto.weight_percent,
      accumulated: toNumber(dto.accumulated) ?? 0,
      equivalentScore: toNumber(dto.equivalent_score),
      weightsOk: dto.weights_ok,
      passingScore,

      attendancePercent: dto.attendance_percent,
      attendancePresent: dto.attendance_present,
      attendanceLate: dto.attendance_late,
      attendanceAbsent: dto.attendance_absent,

      finalGrade: dto.final_grade
        ? {
            score: toNumber(dto.final_grade.final_score),
            approved: dto.final_grade.approved,
            calculatedAt: dto.final_grade.calculated_at,
          }
        : null,

      certificate: dto.certificate
        ? {
            id: dto.certificate.id,
            code: dto.certificate.code,
            issuedDate: dto.certificate.issued_date,
            templateName: dto.certificate.template_name,
          }
        : null,

      nextSession: dto.next_session ? sessionAdapter(dto.next_session) : null,

      sessions: (dto.sessions ?? []).map(sessionAdapter),
      evaluations: (dto.evaluations ?? []).map((e) =>
        evaluationAdapter(e, passingScore),
      ),
      materials: (dto.materials ?? []).map(materialAdapter),
    };
  },

  many: (dtos: StudentCourseDTO[]): StudentCourse[] =>
    dtos.map(studentCourseAdapter.one),
};

export const studentCertificateAdapter = {
  one: (dto: StudentCertificateDTO): StudentCertificate => ({
    id: dto.id,
    enrollmentCourseId: dto.enrollment_course_id,
    code: dto.code,
    issuedDate: dto.issued_date,
    templateName: dto.template_name,
    courseName: dto.course_name,
    offerName: dto.offer_name,
    offerPrefix: dto.offer_prefix,
  }),

  many: (dtos: StudentCertificateDTO[]): StudentCertificate[] =>
    dtos.map(studentCertificateAdapter.one),
};
