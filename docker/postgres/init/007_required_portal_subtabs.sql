CREATE TABLE IF NOT EXISTS portal_courses (
  id BIGSERIAL PRIMARY KEY,
  program_id BIGINT NOT NULL REFERENCES portal_programs(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE portal_modules
  ADD COLUMN IF NOT EXISTS course_id BIGINT REFERENCES portal_courses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS program_id BIGINT REFERENCES portal_programs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS semester TEXT;

ALTER TABLE portal_classes
  ADD COLUMN IF NOT EXISTS schedule TEXT,
  ADD COLUMN IF NOT EXISTS capacity INTEGER;

ALTER TABLE portal_students
  ADD COLUMN IF NOT EXISTS student_id_number TEXT,
  ADD COLUMN IF NOT EXISTS student_id_status TEXT NOT NULL DEFAULT 'pending';

ALTER TABLE portal_admission_offers
  ADD COLUMN IF NOT EXISTS offer_url TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS portal_students_student_id_number_idx
  ON portal_students (student_id_number)
  WHERE student_id_number IS NOT NULL AND student_id_number <> '';

CREATE TABLE IF NOT EXISTS portal_lecturers (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  specialization TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portal_module_lecturers (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT NOT NULL REFERENCES portal_modules(id) ON DELETE CASCADE,
  lecturer_id BIGINT NOT NULL REFERENCES portal_lecturers(id) ON DELETE CASCADE,
  class_id BIGINT REFERENCES portal_classes(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE (module_id, lecturer_id, class_id, academic_year)
);

CREATE TABLE IF NOT EXISTS portal_rooms (
  id BIGSERIAL PRIMARY KEY,
  room_number TEXT NOT NULL UNIQUE,
  room_type TEXT NOT NULL DEFAULT 'classroom',
  capacity INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'available',
  facilities TEXT,
  hostel_fee_kes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO portal_courses (program_id, code, title, credits, status)
SELECT p.id, p.slug || '-CORE', p.title || ' Core Course', 12, 'active'
FROM portal_programs p
ON CONFLICT (code) DO NOTHING;

UPDATE portal_modules m
SET program_id = pm.program_id,
    course_id = c.id,
    semester = COALESCE(m.semester, 'Term 1')
FROM portal_program_modules pm
JOIN portal_courses c ON c.program_id = pm.program_id
WHERE pm.module_id = m.id
  AND (m.program_id IS NULL OR m.course_id IS NULL);

INSERT INTO portal_rooms (room_number, room_type, capacity, status, facilities)
VALUES
  ('RHTI-CLASS-01', 'classroom', 40, 'available', 'Whiteboard, projector'),
  ('RHTI-LAB-01', 'lab', 30, 'available', 'Clinical skills lab'),
  ('RHTI-WARD-ROUND', 'clinical', 20, 'available', 'Hospital attachment briefing space')
ON CONFLICT (room_number) DO NOTHING;

INSERT INTO portal_lecturers (employee_id, full_name, specialization, email, phone, status)
VALUES
  ('RHTI-LECT-001', 'RHTI Clinical Trainer', 'Certified Nursing Assistant', 'trainer@rhti.local', '0712 588 588', 'active'),
  ('RHTI-LECT-002', 'RHTI Records Trainer', 'Health Records and IT', 'records.trainer@rhti.local', '0712 588 588', 'active')
ON CONFLICT (employee_id) DO NOTHING;
