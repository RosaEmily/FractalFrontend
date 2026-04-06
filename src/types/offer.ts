export interface OfferSchedule {
  day: string
  start_time: string
  end_time: string
}

export interface OfferCourse {
  name: string
  teacher: string
  start_date: string
  end_date: string
  schedules: OfferSchedule[]
}

export interface OfferData {
  id: number
  name: string
  prefix: string
  description: string
  type: string
  image_url: string
  tags: string[]
  enrollment_start_date: string
  enrollment_end_date: string
  min_students: number
  max_students: number
  enrolled_students_count: number
  duration_days: number
  duration_months: number
  price: string
  courses: OfferCourse[]
}


export interface Offer extends OfferData {
  image_alt: string
  href: string
}
