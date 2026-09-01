import type {
  AttentionItemDTO,
  ClassTodayDTO,
  QuotaDTO,
  StatsDTO,
} from "../dto/dashboard.dto";
import type {
  AttentionItem,
  ClassToday,
  Quota,
  Stats,
} from "../models/dashboard.model";

export const statsAdapter = {
  one: (dto: StatsDTO): Stats => {
    // El delta viene en una lista aparte, indexada por moneda.
    const percentByCurrency = new Map(
      dto.revenue.delta.map((item) => [item.currency, item.percent]),
    );

    return {
      revenue: dto.revenue.current.map((row) => ({
        currency: row.currency,
        total: row.total,
        count: row.count,
        percent: percentByCurrency.get(row.currency) ?? null,
      })),
      enrollments: {
        current: dto.enrollments.current,
        previous: dto.enrollments.previous,
        delta: dto.enrollments.current - dto.enrollments.previous,
      },
      offers: {
        active: dto.offers.active,
        closingSoon: dto.offers.closing_soon,
      },
      approval: dto.approval,
    };
  },
};

export const attentionAdapter = {
  one: (dto: AttentionItemDTO): AttentionItem => ({
    key: dto.key,
    severity: dto.severity,
    title: dto.title,
    detail: dto.detail,
    count: dto.count,
  }),

  many: (dtos: AttentionItemDTO[]): AttentionItem[] =>
    dtos.map((dto) => attentionAdapter.one(dto)),
};

export const classTodayAdapter = {
  one: (dto: ClassTodayDTO): ClassToday => ({
    id: dto.id,
    name: dto.name,
    topic: dto.topic,
    course: dto.course,
    offer: dto.offer,
    prefix: dto.prefix,
    teacher: dto.teacher,
    meetLink: dto.meet_link,
    startTime: dto.start_time,
    endTime: dto.end_time,
    state: dto.state,
  }),

  many: (dtos: ClassTodayDTO[]): ClassToday[] =>
    dtos.map((dto) => classTodayAdapter.one(dto)),
};

export const quotaAdapter = {
  one: (dto: QuotaDTO): Quota => ({
    id: dto.id,
    name: dto.name,
    prefix: dto.prefix,
    enrolled: dto.enrolled,
    min: dto.min,
    max: dto.max,
    closesAt: dto.closes_at,
    state: dto.state,
    // Los porcentajes se calculan acá y no en el template: el `max` puede
    // ser 0 y una división en la vista daría Infinity.
    percent: dto.max > 0 ? Math.min(100, (dto.enrolled * 100) / dto.max) : 0,
    minPercent: dto.max > 0 ? Math.min(100, (dto.min * 100) / dto.max) : 0,
  }),

  many: (dtos: QuotaDTO[]): Quota[] => dtos.map((dto) => quotaAdapter.one(dto)),
};
