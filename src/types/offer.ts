export interface OfferSchedule {
  day: string
  start_time: string
  end_time: string
}

export interface OfferCourseData {
  name: string
  description: string
  image_url: string
  tags: string[]
  teacher: string
  start_date: string
  end_date: string
  schedules: OfferSchedule[]
}

export interface OfferCourse extends OfferCourseData {
  image_alt: string
}

export interface OfferData {
  id: number
  name: string
  prefix: string
  type: string
  image_url: string
  enrollment_start_date: string
  enrollment_end_date: string
  min_students: number
  max_students: number
  enrolled_students_count: number
  duration_days: number
  duration_months: number
  price: string
  courses: OfferCourseData[]
}

export type OfferStatus = 'open' | 'upcoming' | 'ongoing' | 'ended'

export interface Offer extends OfferData {
  image_alt: string
  href: string
  courses: OfferCourse[]
  status: OfferStatus
  status_label: string
  status_class: string
}

export interface OfferFilterState {
  types: string[]
  tags: string[]
  teachers: string[]
  priceRange: [number, number]
  durationRange: [number, number]
}
