/**
 * Modelos del aula: lo que consumen las pantallas.
 *
 * Diferencias con el DTO, todas resueltas en el adapter:
 *  - los decimales llegan como string desde MySQL y acá ya son `number`
 *  - `passing_score` se resuelve a un solo valor (cohorte → curso → 13)
 *  - se agregan etiquetas y banderas derivadas que el template usaría igual
 */

export interface Schedule {
  id: number;
  dayOfWeek: string;
  dayLabel: string;
  startTime: string | null;
  endTime: string | null;
}

export interface Session {
  id: number;
  scheduleId: number | null;
  enrollmentCourseId: number | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  name: string | null;
  topic: string | null;
  meetLink: string | null;
  isDone: boolean;
  /** 0 ausente · 1 presente · 2 tardanza. Null = sin marcar. */
  attended: number | null;
  attendedLabel: string | null;
  attendedTone: string | null;
  /** Momento en que el docente registró la marca. */
  attendedAt: string | null;
  courseName: string | null;
  offerName: string | null;
}

export interface Evaluation {
  id: number;
  name: string;
  weight: number;
  maxScore: number;
  typeName: string | null;
  score: number | null;
  feedback: string | null;
  evaluatedAt: string | null;
  contribution: number | null;
  /** Contra la nota mínima del curso, no contra un 13 fijo. */
  passed: boolean | null;
}

export interface FinalGrade {
  score: number | null;
  approved: boolean;
  calculatedAt: string | null;
}

export interface CertificateRef {
  id: number;
  code: string;
  issuedDate: string | null;
  templateName: string | null;
}

export interface Material {
  id: number;
  classSessionId: number;
  name: string;
  url: string;
  type: string;
  typeLabel: string;
  size: number | null;
  sizeLabel: string;
  visibleFrom: string | null;
  isVisible: boolean;
  uploaderName: string | null;
  sessionName: string | null;
  sessionDate: string | null;
}

export interface StudentCourse {
  /** `enrollment_course_id` */
  id: number;
  offerCourseId: number;
  enrollmentId: number;
  progressStatus: string;
  state: string;
  stateLabel: string;
  stateTone: string;

  courseId: number;
  courseName: string;
  courseDescription: string | null;
  courseImage: string | null;

  offerId: number;
  offerName: string;
  offerPrefix: string | null;
  offerType: string;
  learningPathId: number | null;

  teacherName: string | null;
  teacherSpecialty: string | null;

  startDate: string | null;
  endDate: string | null;
  meetLink: string | null;
  schedules: Schedule[];
  scheduleText: string;

  sessionsTotal: number;
  sessionsDone: number;
  sessionsPercent: number;

  weightTotal: number;
  evaluatedWeight: number;
  weightPercent: number;
  accumulated: number;
  equivalentScore: number | null;
  weightsOk: boolean;
  /** Nota mínima efectiva: la de la cohorte si la define, si no la del curso. */
  passingScore: number;

  attendancePercent: number | null;
  attendancePresent: number;
  attendanceLate: number;
  attendanceAbsent: number;

  finalGrade: FinalGrade | null;
  certificate: CertificateRef | null;
  nextSession: Session | null;

  sessions: Session[];
  evaluations: Evaluation[];
  materials: Material[];
}

export interface StudentCertificate {
  id: number;
  enrollmentCourseId: number;
  code: string;
  issuedDate: string | null;
  templateName: string | null;
  courseName: string;
  offerName: string;
  offerPrefix: string | null;
}
