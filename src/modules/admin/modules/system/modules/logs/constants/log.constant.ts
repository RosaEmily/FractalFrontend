/**
 * Entidades que puede registrar la bitácora.
 *
 * Son las 29 que `LogEntityResolver` resuelve hoy, extraídas recorriendo las
 * rutas de escritura de la API. Es una lista FIJA a propósito: no hay endpoint
 * que las devuelva, y armarlas desde los logs cargados solo ofrecería las de la
 * página actual (la API pagina, el filtro viaja al servidor).
 *
 * ⚠️ Si se agrega un dominio nuevo a la API, hay que sumarlo acá. Para
 * regenerar la lista: recorrer las rutas POST/PUT/PATCH/DELETE y llamar a
 * `LogEntityResolver::entityType()` sobre cada una.
 */
export const LOG_ENTITY_OPTIONS: { label: string; value: string }[] = [
  { label: "Asistencia", value: "Attendance" },
  { label: "Banner", value: "Banner" },
  { label: "Certificado", value: "Certificate" },
  { label: "Plantilla de certificado", value: "CertificateTemplate" },
  { label: "Clase", value: "ClassSession" },
  { label: "Contacto", value: "Contact" },
  { label: "Curso", value: "Course" },
  { label: "Evaluación de curso", value: "CourseEvaluation" },
  { label: "Moneda", value: "Currency" },
  { label: "Matrícula", value: "Enrollment" },
  { label: "Tipo de evaluación", value: "EvaluationType" },
  { label: "FAQ", value: "Faq" },
  { label: "Nota final", value: "FinalGrade" },
  { label: "Oferta de empleo", value: "JobOffer" },
  { label: "KPI", value: "Kpi" },
  { label: "Configuración del sitio", value: "LandingConfig" },
  { label: "Línea de carrera", value: "LearningPath" },
  { label: "Programa", value: "Offer" },
  { label: "Patrocinador", value: "Partner" },
  { label: "Método de pago", value: "PaymentMethod" },
  { label: "Permiso", value: "Permission" },
  { label: "Rol", value: "Role" },
  { label: "Sesión", value: "Session" },
  { label: "Red social", value: "SocialNetwork" },
  { label: "Estudiante", value: "Student" },
  { label: "Nota", value: "StudentEvaluation" },
  { label: "Etiqueta", value: "Tag" },
  { label: "Instructor", value: "Teacher" },
  { label: "Usuario", value: "User" },
];

/**
 * Opción extra del filtro: los logs SIN entidad.
 *
 * Es la más útil hoy: los errores de framework (rutas inexistentes, método no
 * permitido) no tienen entidad, y este filtro los aísla de las acciones de
 * usuario. Se traduce a `entity_type IS NULL` con el matchMode `equals` y
 * valor null, que es lo que `QueryFilter` entiende.
 */
export const LOG_ENTITY_NONE = "__none__";
