CREATE INDEX IF NOT EXISTS applications_status_program_idx
  ON applications (status, program);

CREATE INDEX IF NOT EXISTS applications_email_idx
  ON applications (lower(email));

CREATE INDEX IF NOT EXISTS portal_sessions_user_expires_idx
  ON portal_sessions (user_id, expires_at);

CREATE INDEX IF NOT EXISTS portal_students_user_idx
  ON portal_students (user_id);

CREATE INDEX IF NOT EXISTS portal_students_application_idx
  ON portal_students (application_id);

CREATE INDEX IF NOT EXISTS portal_student_enrollments_student_idx
  ON portal_student_enrollments (student_id, status);

CREATE INDEX IF NOT EXISTS portal_student_enrollments_program_cohort_idx
  ON portal_student_enrollments (program_id, cohort_id);

CREATE INDEX IF NOT EXISTS portal_timetable_events_module_starts_idx
  ON portal_timetable_events (module_id, starts_at);

CREATE INDEX IF NOT EXISTS portal_assessments_module_cohort_idx
  ON portal_assessments (module_id, cohort_id);

CREATE INDEX IF NOT EXISTS portal_student_documents_student_type_idx
  ON portal_student_documents (student_id, document_type);

CREATE INDEX IF NOT EXISTS portal_student_documents_created_idx
  ON portal_student_documents (created_at DESC);
