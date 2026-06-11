import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hashPassword, requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { AdminCrudTable, type CrudColumn, type CrudField } from "@/components/admin/admin-crud-table";

type CrudConfig = {
  title: string;
  description: string;
  table: string;
  idColumn: string;
  listSql: string;
  insertSql?: string;
  updateSql?: string;
  deleteSql?: string;
  fields: CrudField[];
  updateFields?: CrudField[];
  columns: CrudColumn[];
  badgeKey?: string;
};

const statusField = (values: string[]): CrudField => ({
  name: "status",
  label: "Status",
  type: "select",
  required: true,
  optionsQuery: `SELECT value, label FROM (VALUES ${values.map((value) => `('${value}','${value.replace(/_/g, " ")}')`).join(",")}) AS x(value,label)`,
} as CrudField);

const configs: Record<string, CrudConfig> = {
  applications: {
    title: "Applications",
    description: "Review applications and move accepted applicants toward offer and onboarding.",
    table: "applications",
    idColumn: "id",
    listSql: "SELECT a.id, a.full_name AS applicant_name, a.email, COALESCE(p.title, a.program) AS program_applied, a.kcse_mean_grade AS kcse_grade, a.created_at::date AS application_date, a.status FROM applications a LEFT JOIN portal_programs p ON p.id=a.program_id ORDER BY a.created_at DESC",
    insertSql: "INSERT INTO applications (full_name,email,phone,program,program_id,intake_id,kcse_mean_grade,kcse_year,status,source) VALUES ($1,$2,$3,(SELECT slug FROM portal_programs WHERE id=NULLIF($4,'')::bigint),NULLIF($4,'')::bigint,NULLIF($5,'')::bigint,$6,NULLIF($7,'')::int,$8,'admin_portal')",
    updateSql: "UPDATE applications SET status=$2, reviewed_at=NOW() WHERE id=$1",
    deleteSql: "DELETE FROM applications WHERE id=$1",
    badgeKey: "status",
    fields: [
      { name: "full_name", label: "Applicant Name", required: true },
      { name: "email", label: "Email", required: true },
      { name: "phone", label: "Phone", required: true },
      { name: "program_id", label: "Program Applied", type: "select", required: true, optionsQuery: "SELECT id::text AS value, title AS label FROM portal_programs ORDER BY title" } as CrudField,
      { name: "intake_id", label: "Intake", type: "select", optionsQuery: "SELECT id::text AS value, name AS label FROM portal_intakes ORDER BY id" } as CrudField,
      { name: "kcse_mean_grade", label: "KCSE Grade" },
      { name: "kcse_year", label: "KCSE Year", type: "number" },
      statusField(["new", "under_review", "reviewed", "accepted", "rejected"]),
    ],
    updateFields: [statusField(["new", "under_review", "reviewed", "accepted", "rejected"])],
    columns: [
      { key: "applicant_name", label: "Applicant Name" },
      { key: "email", label: "Email" },
      { key: "program_applied", label: "Program Applied" },
      { key: "kcse_grade", label: "KCSE Grade" },
      { key: "application_date", label: "Application Date" },
      { key: "status", label: "Status" },
    ],
  },
  acceptance: {
    title: "Acceptance",
    description: "Manage acceptance letters and offer status after manual applicant approval.",
    table: "portal_admission_offers",
    idColumn: "id",
    listSql: "SELECT o.id, a.full_name AS applicant_name, a.email, p.title AS program, o.issued_at::date AS acceptance_date, o.offer_url AS acceptance_letter_url, o.status FROM portal_admission_offers o JOIN applications a ON a.id=o.application_id JOIN portal_programs p ON p.id=o.program_id ORDER BY o.issued_at DESC",
    insertSql: "INSERT INTO portal_admission_offers (application_id,program_id,offer_number,offer_url,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,$3,$4,$5)",
    updateSql: "UPDATE portal_admission_offers SET status=$2, offer_url=$3, accepted_at=CASE WHEN $2='accepted' THEN NOW() ELSE accepted_at END WHERE id=$1",
    deleteSql: "DELETE FROM portal_admission_offers WHERE id=$1",
    badgeKey: "status",
    fields: [
      { name: "application_id", label: "Applicant", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || email AS label FROM applications ORDER BY created_at DESC" } as CrudField,
      { name: "program_id", label: "Program", type: "select", required: true, optionsQuery: "SELECT id::text AS value, title AS label FROM portal_programs ORDER BY title" } as CrudField,
      { name: "offer_number", label: "Offer Number", required: true },
      { name: "offer_url", label: "Acceptance Letter URL" },
      statusField(["issued", "accepted", "declined", "expired", "withdrawn"]),
    ],
    updateFields: [statusField(["issued", "accepted", "declined", "expired", "withdrawn"]), { name: "offer_url", label: "Acceptance Letter URL" }],
    columns: [
      { key: "applicant_name", label: "Applicant Name" },
      { key: "email", label: "Email" },
      { key: "program", label: "Program" },
      { key: "acceptance_date", label: "Acceptance Date" },
      { key: "acceptance_letter_url", label: "Letter URL" },
      { key: "status", label: "Status" },
    ],
  },
  onboarding: {
    title: "Onboarding",
    description: "Track onboarding, document verification, orientation and policy acceptance.",
    table: "portal_student_onboarding",
    idColumn: "id",
    listSql: "SELECT o.id, s.full_name AS student_name, s.student_number AS registration_number, p.title AS program, o.started_at::date AS onboarding_date, o.documents_status AS document_status, o.status AS completion_status FROM portal_student_onboarding o JOIN portal_students s ON s.id=o.student_id LEFT JOIN portal_student_enrollments e ON e.id=o.enrollment_id LEFT JOIN portal_programs p ON p.id=e.program_id ORDER BY o.started_at DESC",
    insertSql: "INSERT INTO portal_student_onboarding (student_id,application_id,offer_id,enrollment_id,status,documents_status,orientation_status,policies_status,notes) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,NULLIF($3,'')::bigint,NULLIF($4,'')::bigint,$5,$6,$7,$8,$9)",
    updateSql: "UPDATE portal_student_onboarding SET status=$2, documents_status=$3, orientation_status=$4, policies_status=$5, completed_at=CASE WHEN $2='completed' THEN NOW() ELSE completed_at END WHERE id=$1",
    deleteSql: "UPDATE portal_student_onboarding SET status='cancelled' WHERE id=$1",
    badgeKey: "completion_status",
    fields: [
      { name: "student_id", label: "Student", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || student_number AS label FROM portal_students ORDER BY full_name" } as CrudField,
      { name: "application_id", label: "Application", type: "select", optionsQuery: "SELECT id::text AS value, full_name || ' - ' || email AS label FROM applications ORDER BY created_at DESC" } as CrudField,
      { name: "offer_id", label: "Offer", type: "select", optionsQuery: "SELECT id::text AS value, offer_number AS label FROM portal_admission_offers ORDER BY issued_at DESC" } as CrudField,
      { name: "enrollment_id", label: "Enrollment", type: "select", optionsQuery: "SELECT e.id::text AS value, s.student_number || ' - ' || p.title AS label FROM portal_student_enrollments e JOIN portal_students s ON s.id=e.student_id JOIN portal_programs p ON p.id=e.program_id ORDER BY e.id DESC" } as CrudField,
      statusField(["pending", "in_progress", "completed", "blocked", "cancelled"]),
      { name: "documents_status", label: "Document Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('pending','pending'),('submitted','submitted'),('verified','verified'),('rejected','rejected')) AS x(value,label)" } as CrudField,
      { name: "orientation_status", label: "Orientation", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('pending','pending'),('scheduled','scheduled'),('completed','completed')) AS x(value,label)" } as CrudField,
      { name: "policies_status", label: "Policies", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('pending','pending'),('accepted','accepted')) AS x(value,label)" } as CrudField,
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    updateFields: [
      statusField(["pending", "in_progress", "completed", "blocked", "cancelled"]),
      { name: "documents_status", label: "Document Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('pending','pending'),('submitted','submitted'),('verified','verified'),('rejected','rejected')) AS x(value,label)" } as CrudField,
      { name: "orientation_status", label: "Orientation", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('pending','pending'),('scheduled','scheduled'),('completed','completed')) AS x(value,label)" } as CrudField,
      { name: "policies_status", label: "Policies", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('pending','pending'),('accepted','accepted')) AS x(value,label)" } as CrudField,
    ],
    columns: [
      { key: "student_name", label: "Student Name" },
      { key: "registration_number", label: "Registration Number" },
      { key: "program", label: "Program" },
      { key: "onboarding_date", label: "Onboarding Date" },
      { key: "document_status", label: "Document Status" },
      { key: "completion_status", label: "Completion Status" },
    ],
  },
  programs: {
    title: "Programs",
    description: "Define institutional programs used across applications, courses, cohorts and fees.",
    table: "portal_programs",
    idColumn: "id",
    listSql: "SELECT id, slug AS program_code, title AS program_name, duration_months, status FROM portal_programs ORDER BY title",
    insertSql: "INSERT INTO portal_programs (slug,title,duration_months,entry_requirements,tuition_fee_kes,overview,pdf_url,status) VALUES ($1,$2,NULLIF($3,'')::int,$4,NULLIF($5,'')::int,$6,$7,$8)",
    updateSql: "UPDATE portal_programs SET status=$2 WHERE id=$1",
    deleteSql: "UPDATE portal_programs SET status='archived' WHERE id=$1",
    badgeKey: "status",
    fields: [
      { name: "slug", label: "Program Code", required: true },
      { name: "title", label: "Program Name", required: true },
      { name: "duration_months", label: "Duration Months", type: "number", required: true },
      { name: "entry_requirements", label: "Entry Requirements", required: true },
      { name: "tuition_fee_kes", label: "Tuition Fee KES", type: "number", required: true },
      { name: "overview", label: "Description", type: "textarea", required: true },
      { name: "pdf_url", label: "PDF URL" },
      statusField(["active", "paused", "archived"]),
    ],
    updateFields: [statusField(["active", "paused", "archived"])],
    columns: [
      { key: "program_code", label: "Program Code" },
      { key: "program_name", label: "Program Name" },
      { key: "duration_months", label: "Duration" },
      { key: "status", label: "Status" },
    ],
  },
  courses: {
    title: "Courses",
    description: "Create courses under programs before assigning modules.",
    table: "portal_courses",
    idColumn: "id",
    listSql: "SELECT c.id, c.code AS course_code, c.title AS course_name, p.title AS program, c.credits, c.status FROM portal_courses c JOIN portal_programs p ON p.id=c.program_id ORDER BY p.title, c.code",
    insertSql: "INSERT INTO portal_courses (program_id,code,title,credits,status) VALUES (NULLIF($1,'')::bigint,$2,$3,NULLIF($4,'')::int,$5)",
    updateSql: "UPDATE portal_courses SET status=$2 WHERE id=$1",
    deleteSql: "UPDATE portal_courses SET status='archived' WHERE id=$1",
    badgeKey: "status",
    fields: [
      { name: "program_id", label: "Program", type: "select", required: true, optionsQuery: "SELECT id::text AS value, title AS label FROM portal_programs ORDER BY title" } as CrudField,
      { name: "code", label: "Course Code", required: true },
      { name: "title", label: "Course Name", required: true },
      { name: "credits", label: "Credits", type: "number", required: true },
      statusField(["active", "paused", "archived"]),
    ],
    updateFields: [statusField(["active", "paused", "archived"])],
    columns: [
      { key: "course_code", label: "Course Code" },
      { key: "course_name", label: "Course Name" },
      { key: "program", label: "Program" },
      { key: "credits", label: "Credits" },
      { key: "status", label: "Status" },
    ],
  },
  modules: {
    title: "Modules",
    description: "Assign modules to courses and programs.",
    table: "portal_modules",
    idColumn: "id",
    listSql: "SELECT m.id, m.code AS module_code, m.title AS module_name, c.title AS course, p.title AS program, m.semester, m.credits FROM portal_modules m LEFT JOIN portal_courses c ON c.id=m.course_id LEFT JOIN portal_programs p ON p.id=m.program_id ORDER BY m.code",
    insertSql: "INSERT INTO portal_modules (code,title,description,credits,course_id,program_id,semester) VALUES ($1,$2,$3,NULLIF($4,'')::int,NULLIF($5,'')::bigint,NULLIF($6,'')::bigint,$7)",
    deleteSql: "DELETE FROM portal_modules WHERE id=$1",
    fields: [
      { name: "code", label: "Module Code", required: true },
      { name: "title", label: "Module Name", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "credits", label: "Credits", type: "number", required: true },
      { name: "course_id", label: "Course", type: "select", optionsQuery: "SELECT id::text AS value, code || ' - ' || title AS label FROM portal_courses ORDER BY code" } as CrudField,
      { name: "program_id", label: "Program", type: "select", optionsQuery: "SELECT id::text AS value, title AS label FROM portal_programs ORDER BY title" } as CrudField,
      { name: "semester", label: "Semester" },
    ],
    columns: [
      { key: "module_code", label: "Module Code" },
      { key: "module_name", label: "Module Name" },
      { key: "course", label: "Course" },
      { key: "program", label: "Program" },
      { key: "semester", label: "Semester" },
      { key: "credits", label: "Credits" },
    ],
  },
};

Object.assign(configs, {
  cohorts: {
    title: "Cohorts",
    description: "Create cohorts per program and intake.",
    table: "portal_cohorts",
    idColumn: "id",
    listSql: "SELECT c.id, c.name AS cohort_name, p.title AS program, i.name AS intake, c.starts_on, c.expected_graduation_on, c.status FROM portal_cohorts c JOIN portal_programs p ON p.id=c.program_id JOIN portal_intakes i ON i.id=c.intake_id ORDER BY c.starts_on DESC",
    insertSql: "INSERT INTO portal_cohorts (program_id,intake_id,name,starts_on,expected_graduation_on,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,$3,NULLIF($4,'')::date,NULLIF($5,'')::date,$6)",
    updateSql: "UPDATE portal_cohorts SET status=$2 WHERE id=$1",
    deleteSql: "UPDATE portal_cohorts SET status='archived' WHERE id=$1",
    badgeKey: "status",
    fields: [
      { name: "program_id", label: "Program", type: "select", required: true, optionsQuery: "SELECT id::text AS value, title AS label FROM portal_programs ORDER BY title" },
      { name: "intake_id", label: "Intake", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_intakes ORDER BY id" },
      { name: "name", label: "Cohort Name", required: true },
      { name: "starts_on", label: "Start Date", type: "date", required: true },
      { name: "expected_graduation_on", label: "End Date", type: "date" },
      statusField(["planned", "active", "completed", "archived"]),
    ],
    updateFields: [statusField(["planned", "active", "completed", "archived"])],
    columns: [
      { key: "cohort_name", label: "Cohort Name" },
      { key: "program", label: "Program" },
      { key: "starts_on", label: "Start Date" },
      { key: "expected_graduation_on", label: "End Date" },
      { key: "status", label: "Status" },
    ],
  },
  classes: {
    title: "Classes",
    description: "Assign cohorts to classes, lecturers, rooms and schedules.",
    table: "portal_classes",
    idColumn: "id",
    listSql: "SELECT cl.id, cl.name AS class_name, c.name AS cohort, p.title AS program, COALESCE(l.full_name, u.full_name) AS lecturer, cl.room, cl.schedule, cl.capacity, cl.status FROM portal_classes cl JOIN portal_cohorts c ON c.id=cl.cohort_id JOIN portal_programs p ON p.id=c.program_id LEFT JOIN portal_users u ON u.id=cl.trainer_user_id LEFT JOIN portal_lecturers l ON l.email=u.email ORDER BY cl.id DESC",
    insertSql: "INSERT INTO portal_classes (cohort_id,name,trainer_user_id,room,schedule,capacity,status) VALUES (NULLIF($1,'')::bigint,$2,NULLIF($3,'')::uuid,$4,$5,NULLIF($6,'')::int,$7)",
    updateSql: "UPDATE portal_classes SET status=$2 WHERE id=$1",
    deleteSql: "UPDATE portal_classes SET status='archived' WHERE id=$1",
    badgeKey: "status",
    fields: [
      { name: "cohort_id", label: "Cohort", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_cohorts ORDER BY starts_on DESC" },
      { name: "name", label: "Class Name", required: true },
      { name: "trainer_user_id", label: "Lecturer", type: "select", optionsQuery: "SELECT id::text AS value, full_name AS label FROM portal_users ORDER BY full_name" },
      { name: "room", label: "Room" },
      { name: "schedule", label: "Schedule" },
      { name: "capacity", label: "Capacity", type: "number" },
      statusField(["active", "completed", "archived"]),
    ],
    updateFields: [statusField(["active", "completed", "archived"])],
    columns: [
      { key: "class_name", label: "Class Name" },
      { key: "cohort", label: "Cohort" },
      { key: "program", label: "Program" },
      { key: "lecturer", label: "Lecturer" },
      { key: "schedule", label: "Schedule" },
      { key: "capacity", label: "Capacity" },
      { key: "status", label: "Status" },
    ],
  },
  lecturers: {
    title: "Lecturers",
    description: "Manage lecturer details and specialization.",
    table: "portal_lecturers",
    idColumn: "id",
    listSql: "SELECT id, full_name AS lecturer_name, employee_id, specialization, email, status FROM portal_lecturers ORDER BY full_name",
    insertSql: "INSERT INTO portal_lecturers (employee_id,full_name,specialization,email,phone,status) VALUES ($1,$2,$3,$4,$5,$6)",
    updateSql: "UPDATE portal_lecturers SET status=$2 WHERE id=$1",
    deleteSql: "UPDATE portal_lecturers SET status='archived' WHERE id=$1",
    badgeKey: "status",
    fields: [
      { name: "employee_id", label: "Employee ID", required: true },
      { name: "full_name", label: "Lecturer Name", required: true },
      { name: "specialization", label: "Specialization" },
      { name: "email", label: "Email", required: true },
      { name: "phone", label: "Phone" },
      statusField(["active", "inactive", "archived"]),
    ],
    updateFields: [statusField(["active", "inactive", "archived"])],
    columns: [
      { key: "lecturer_name", label: "Lecturer Name" },
      { key: "employee_id", label: "Employee ID" },
      { key: "specialization", label: "Specialization" },
      { key: "email", label: "Email" },
      { key: "status", label: "Status" },
    ],
  },
  "module-lecturers": {
    title: "Module Lecturers",
    description: "Assign lecturers to modules for classes and academic years.",
    table: "portal_module_lecturers",
    idColumn: "id",
    listSql: "SELECT ml.id, m.title AS module, l.full_name AS lecturer, cl.name AS class, ml.academic_year, ml.status FROM portal_module_lecturers ml JOIN portal_modules m ON m.id=ml.module_id JOIN portal_lecturers l ON l.id=ml.lecturer_id LEFT JOIN portal_classes cl ON cl.id=ml.class_id ORDER BY ml.academic_year DESC",
    insertSql: "INSERT INTO portal_module_lecturers (module_id,lecturer_id,class_id,academic_year,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,NULLIF($3,'')::bigint,$4,$5)",
    updateSql: "UPDATE portal_module_lecturers SET status=$2 WHERE id=$1",
    deleteSql: "DELETE FROM portal_module_lecturers WHERE id=$1",
    badgeKey: "status",
    fields: [
      { name: "module_id", label: "Module", type: "select", required: true, optionsQuery: "SELECT id::text AS value, code || ' - ' || title AS label FROM portal_modules ORDER BY code" },
      { name: "lecturer_id", label: "Lecturer", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name AS label FROM portal_lecturers ORDER BY full_name" },
      { name: "class_id", label: "Class", type: "select", optionsQuery: "SELECT id::text AS value, name AS label FROM portal_classes ORDER BY name" },
      { name: "academic_year", label: "Academic Year", required: true },
      statusField(["active", "completed", "archived"]),
    ],
    updateFields: [statusField(["active", "completed", "archived"])],
    columns: [
      { key: "module", label: "Module" },
      { key: "lecturer", label: "Lecturer" },
      { key: "class", label: "Class" },
      { key: "academic_year", label: "Academic Year" },
      { key: "status", label: "Status" },
    ],
  },
  exams: {
    title: "Exams",
    description: "Create exams and assessments for modules and classes.",
    table: "portal_assessments",
    idColumn: "id",
    listSql: "SELECT a.id, a.title AS exam_name, m.title AS module, cl.name AS class, a.exam_date, a.max_score AS total_marks, a.status FROM portal_assessments a JOIN portal_modules m ON m.id=a.module_id LEFT JOIN portal_classes cl ON cl.id=a.class_id ORDER BY a.exam_date DESC NULLS LAST",
    insertSql: "INSERT INTO portal_assessments (module_id,cohort_id,class_id,title,assessment_type,max_score,weight_percent,exam_date,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,NULLIF($3,'')::bigint,$4,$5,NULLIF($6,'')::numeric,NULLIF($7,'')::numeric,NULLIF($8,'')::date,$9)",
    updateSql: "UPDATE portal_assessments SET status=$2 WHERE id=$1",
    deleteSql: "DELETE FROM portal_assessments WHERE id=$1",
    badgeKey: "status",
    fields: [
      { name: "module_id", label: "Module", type: "select", required: true, optionsQuery: "SELECT id::text AS value, code || ' - ' || title AS label FROM portal_modules ORDER BY code" },
      { name: "cohort_id", label: "Cohort", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_cohorts ORDER BY starts_on DESC" },
      { name: "class_id", label: "Class", type: "select", optionsQuery: "SELECT id::text AS value, name AS label FROM portal_classes ORDER BY name" },
      { name: "title", label: "Exam Name", required: true },
      { name: "assessment_type", label: "Type", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('CAT','CAT'),('Exam','Exam'),('Practical','Practical'),('Assignment','Assignment')) AS x(value,label)" },
      { name: "max_score", label: "Total Marks", type: "number", required: true },
      { name: "weight_percent", label: "Weight %", type: "number", required: true },
      { name: "exam_date", label: "Date", type: "date" },
      statusField(["planned", "published", "completed", "approved", "archived"]),
    ],
    updateFields: [statusField(["planned", "published", "completed", "approved", "archived"])],
    columns: [
      { key: "exam_name", label: "Exam Name" },
      { key: "module", label: "Module" },
      { key: "class", label: "Class" },
      { key: "exam_date", label: "Date" },
      { key: "total_marks", label: "Total Marks" },
      { key: "status", label: "Status" },
    ],
  },
  results: {
    title: "Exam Results",
    description: "Upload and approve student exam results.",
    table: "portal_marks",
    idColumn: "id",
    listSql: "SELECT mark.assessment_id::text || '-' || mark.student_id::text AS id, s.full_name AS student, m.title AS module, a.title AS exam, mark.score AS marks, CASE WHEN mark.score >= 80 THEN 'A' WHEN mark.score >= 65 THEN 'B' WHEN mark.score >= 50 THEN 'C' WHEN mark.score >= 40 THEN 'D' ELSE 'F' END AS grade, mark.status FROM portal_marks mark JOIN portal_students s ON s.id=mark.student_id JOIN portal_assessments a ON a.id=mark.assessment_id JOIN portal_modules m ON m.id=a.module_id ORDER BY mark.updated_at DESC",
    insertSql: "INSERT INTO portal_marks (assessment_id,student_id,score,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,NULLIF($3,'')::numeric,$4) ON CONFLICT (assessment_id, student_id) DO UPDATE SET score=EXCLUDED.score,status=EXCLUDED.status,updated_at=NOW()",
    updateSql: "UPDATE portal_marks SET status=$2, updated_at=NOW() WHERE (assessment_id::text || '-' || student_id::text)=$1",
    deleteSql: "DELETE FROM portal_marks WHERE (assessment_id::text || '-' || student_id::text)=$1",
    badgeKey: "status",
    fields: [
      { name: "assessment_id", label: "Exam", type: "select", required: true, optionsQuery: "SELECT id::text AS value, title AS label FROM portal_assessments ORDER BY exam_date DESC NULLS LAST" },
      { name: "student_id", label: "Student", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || student_number AS label FROM portal_students ORDER BY full_name" },
      { name: "score", label: "Marks", type: "number", required: true },
      statusField(["draft", "submitted", "approved", "published"]),
    ],
    updateFields: [statusField(["draft", "submitted", "approved", "published"])],
    columns: [
      { key: "student", label: "Student" },
      { key: "module", label: "Module" },
      { key: "exam", label: "Exam" },
      { key: "marks", label: "Marks" },
      { key: "grade", label: "Grade" },
      { key: "status", label: "Status" },
    ],
  },
});

Object.assign(configs, {
  "course-fees": {
    title: "Course Fees",
    description: "Set fee structures per program and cohort.",
    table: "portal_fee_structures",
    idColumn: "id",
    listSql: "SELECT fs.id, p.title AS program, fs.name AS course, fs.total_amount_kes AS fee_amount, COALESCE(c.name, 'All cohorts') AS academic_year, fs.status FROM portal_fee_structures fs JOIN portal_programs p ON p.id=fs.program_id LEFT JOIN portal_cohorts c ON c.id=fs.cohort_id ORDER BY p.title",
    insertSql: "INSERT INTO portal_fee_structures (program_id,cohort_id,name,total_amount_kes,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,$3,NULLIF($4,'')::int,$5)",
    updateSql: "UPDATE portal_fee_structures SET status=$2 WHERE id=$1",
    deleteSql: "UPDATE portal_fee_structures SET status='archived' WHERE id=$1",
    badgeKey: "status",
    fields: [
      { name: "program_id", label: "Program", type: "select", required: true, optionsQuery: "SELECT id::text AS value, title AS label FROM portal_programs ORDER BY title" },
      { name: "cohort_id", label: "Cohort", type: "select", optionsQuery: "SELECT id::text AS value, name AS label FROM portal_cohorts ORDER BY starts_on DESC" },
      { name: "name", label: "Course/Fee Name", required: true },
      { name: "total_amount_kes", label: "Fee Amount", type: "number", required: true },
      statusField(["active", "paused", "archived"]),
    ],
    updateFields: [statusField(["active", "paused", "archived"])],
    columns: [
      { key: "program", label: "Program" },
      { key: "course", label: "Course" },
      { key: "fee_amount", label: "Fee Amount" },
      { key: "academic_year", label: "Academic Year" },
      { key: "status", label: "Status" },
    ],
  },
  fees: {
    title: "Invoices",
    description: "Generate and track student invoices.",
    table: "portal_invoices",
    idColumn: "id",
    listSql: "SELECT i.id, i.invoice_number, s.full_name AS student, p.title AS program, i.amount_kes AS amount, i.due_on AS due_date, i.status FROM portal_invoices i JOIN portal_students s ON s.id=i.student_id LEFT JOIN portal_student_enrollments e ON e.student_id=s.id AND e.status='active' LEFT JOIN portal_programs p ON p.id=e.program_id ORDER BY i.created_at DESC",
    insertSql: "INSERT INTO portal_invoices (student_id,invoice_number,description,amount_kes,status,due_on) VALUES (NULLIF($1,'')::bigint,$2,$3,NULLIF($4,'')::int,$5,NULLIF($6,'')::date)",
    updateSql: "UPDATE portal_invoices SET status=$2 WHERE id=$1",
    deleteSql: "DELETE FROM portal_invoices WHERE id=$1",
    badgeKey: "status",
    fields: [
      { name: "student_id", label: "Student", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || student_number AS label FROM portal_students ORDER BY full_name" },
      { name: "invoice_number", label: "Invoice Number", required: true },
      { name: "description", label: "Description", required: true },
      { name: "amount_kes", label: "Amount", type: "number", required: true },
      statusField(["unpaid", "partially_paid", "paid", "void"]),
      { name: "due_on", label: "Due Date", type: "date" },
    ],
    updateFields: [statusField(["unpaid", "partially_paid", "paid", "void"])],
    columns: [
      { key: "invoice_number", label: "Invoice Number" },
      { key: "student", label: "Student" },
      { key: "program", label: "Program" },
      { key: "amount", label: "Amount" },
      { key: "due_date", label: "Due Date" },
      { key: "status", label: "Status" },
    ],
  },
  payments: {
    title: "Payments",
    description: "Record payments and receipts against student invoices.",
    table: "portal_payments",
    idColumn: "id",
    listSql: "SELECT pay.id, pay.receipt_number, s.full_name AS student, i.invoice_number AS invoice, pay.amount_kes AS amount_paid, pay.paid_at::date AS payment_date, pay.method, pay.reference FROM portal_payments pay JOIN portal_students s ON s.id=pay.student_id LEFT JOIN portal_invoices i ON i.id=pay.invoice_id ORDER BY pay.paid_at DESC",
    insertSql: "INSERT INTO portal_payments (student_id,invoice_id,receipt_number,amount_kes,method,reference) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,$3,NULLIF($4,'')::int,$5,$6)",
    deleteSql: "DELETE FROM portal_payments WHERE id=$1",
    fields: [
      { name: "student_id", label: "Student", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || student_number AS label FROM portal_students ORDER BY full_name" },
      { name: "invoice_id", label: "Invoice", type: "select", optionsQuery: "SELECT id::text AS value, invoice_number AS label FROM portal_invoices ORDER BY created_at DESC" },
      { name: "receipt_number", label: "Receipt Number", required: true },
      { name: "amount_kes", label: "Amount Paid", type: "number", required: true },
      { name: "method", label: "Method", required: true },
      { name: "reference", label: "Reference" },
    ],
    columns: [
      { key: "receipt_number", label: "Receipt Number" },
      { key: "student", label: "Student" },
      { key: "invoice", label: "Invoice" },
      { key: "amount_paid", label: "Amount Paid" },
      { key: "payment_date", label: "Payment Date" },
      { key: "method", label: "Method" },
    ],
  },
});

Object.assign(configs, {
  students: {
    title: "Student Registry",
    description: "Register accepted applicants as students and create login credentials.",
    table: "portal_students",
    idColumn: "id",
    listSql: "SELECT s.id, s.full_name AS student_name, s.student_number, s.email, s.phone, s.status FROM portal_students s ORDER BY s.created_at DESC",
    insertSql: "custom_student_registration",
    updateSql: "UPDATE portal_students SET status=$2 WHERE id=$1",
    deleteSql: "UPDATE portal_students SET status='archived' WHERE id=$1",
    badgeKey: "status",
    fields: [
      { name: "student_number", label: "Registration Number", required: true },
      { name: "full_name", label: "Student Name", required: true },
      { name: "email", label: "Email", required: true },
      { name: "phone", label: "Phone", required: true },
      { name: "initial_password", label: "Initial Password", required: true },
      { name: "date_of_birth", label: "Date of Birth", type: "date" },
      { name: "gender", label: "Gender" },
      { name: "national_id", label: "National ID" },
      { name: "residence", label: "Residence" },
      { name: "next_of_kin_name", label: "Next of Kin Name" },
      { name: "next_of_kin_phone", label: "Next of Kin Phone" },
      { name: "next_of_kin_relationship", label: "Next of Kin Relationship" },
      statusField(["active", "deferred", "suspended", "completed", "graduated", "archived"]),
    ],
    updateFields: [statusField(["active", "deferred", "suspended", "completed", "graduated", "archived"])],
    columns: [
      { key: "student_name", label: "Student Name" },
      { key: "student_number", label: "Registration Number" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "status", label: "Status" },
    ],
  },
  "student-ids": {
    title: "Student ID Management",
    description: "Assign student ID numbers to onboarded students.",
    table: "portal_students",
    idColumn: "id",
    listSql: "SELECT s.id, s.full_name AS student_name, s.student_number AS registration_number, p.title AS program, s.student_id_status AS id_status, s.student_id_number FROM portal_students s LEFT JOIN portal_student_enrollments e ON e.student_id=s.id AND e.status='active' LEFT JOIN portal_programs p ON p.id=e.program_id WHERE s.status <> 'archived' ORDER BY s.full_name",
    updateSql: "UPDATE portal_students SET student_id_status=$2, student_id_number=NULLIF($3,''), updated_at=NOW() WHERE id=$1",
    badgeKey: "id_status",
    fields: [],
    updateFields: [
      { name: "student_id_status", label: "ID Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('pending','pending'),('assigned','assigned')) AS x(value,label)" },
      { name: "student_id_number", label: "ID Number" },
    ],
    columns: [
      { key: "student_name", label: "Student Name" },
      { key: "registration_number", label: "Registration Number" },
      { key: "program", label: "Program" },
      { key: "id_status", label: "ID Status" },
      { key: "student_id_number", label: "ID Number" },
    ],
  },
  "student-course-assignment": {
    title: "Student Course Assignment",
    description: "Assign students to program, cohort, class and linked modules.",
    table: "portal_student_enrollments",
    idColumn: "id",
    listSql: "SELECT e.id, s.full_name AS student_name, s.student_number AS registration_number, p.title AS program, c.name AS cohort, cl.name AS class, STRING_AGG(DISTINCT m.title, ', ' ORDER BY m.title) AS assigned_modules, e.status FROM portal_student_enrollments e JOIN portal_students s ON s.id=e.student_id JOIN portal_programs p ON p.id=e.program_id JOIN portal_cohorts c ON c.id=e.cohort_id LEFT JOIN portal_classes cl ON cl.id=e.class_id LEFT JOIN portal_program_modules pm ON pm.program_id=p.id LEFT JOIN portal_modules m ON m.id=pm.module_id GROUP BY e.id, s.full_name, s.student_number, p.title, c.name, cl.name, e.status ORDER BY s.full_name",
    insertSql: "INSERT INTO portal_student_enrollments (student_id,program_id,cohort_id,class_id,enrolled_on,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,NULLIF($3,'')::bigint,NULLIF($4,'')::bigint,NULLIF($5,'')::date,$6)",
    updateSql: "UPDATE portal_student_enrollments SET status=$2 WHERE id=$1",
    deleteSql: "UPDATE portal_student_enrollments SET status='archived' WHERE id=$1",
    badgeKey: "status",
    fields: [
      { name: "student_id", label: "Student", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || student_number AS label FROM portal_students WHERE status <> 'archived' ORDER BY full_name" },
      { name: "program_id", label: "Program", type: "select", required: true, optionsQuery: "SELECT id::text AS value, title AS label FROM portal_programs WHERE status='active' ORDER BY title" },
      { name: "cohort_id", label: "Cohort", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_cohorts WHERE status <> 'archived' ORDER BY starts_on DESC" },
      { name: "class_id", label: "Class", type: "select", optionsQuery: "SELECT id::text AS value, name AS label FROM portal_classes WHERE status <> 'archived' ORDER BY name" },
      { name: "enrolled_on", label: "Assigned On", type: "date", required: true },
      statusField(["active", "deferred", "completed", "withdrawn", "archived"]),
    ],
    updateFields: [statusField(["active", "deferred", "completed", "withdrawn", "archived"])],
    columns: [
      { key: "student_name", label: "Student Name" },
      { key: "registration_number", label: "Registration Number" },
      { key: "program", label: "Program" },
      { key: "cohort", label: "Cohort" },
      { key: "class", label: "Class" },
      { key: "assigned_modules", label: "Assigned Modules" },
      { key: "status", label: "Status" },
    ],
  },
});

Object.assign(configs, {
  clearance: {
    title: "Clearance",
    description: "Track clearance checkpoints by department.",
    table: "portal_student_clearance",
    idColumn: "id",
    listSql: "SELECT sc.id, s.full_name AS student_name, s.student_number, d.name AS department, cc.title AS checkpoint, sc.status, sc.notes FROM portal_student_clearance sc JOIN portal_students s ON s.id=sc.student_id JOIN portal_clearance_checkpoints cc ON cc.id=sc.checkpoint_id LEFT JOIN portal_departments d ON d.id=cc.department_id ORDER BY s.full_name",
    insertSql: "INSERT INTO portal_student_clearance (student_id,checkpoint_id,status,notes) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,$3,$4)",
    updateSql: "UPDATE portal_student_clearance SET status=$2, notes=$3, approved_at=CASE WHEN $2='cleared' THEN NOW() ELSE approved_at END WHERE id=$1",
    deleteSql: "DELETE FROM portal_student_clearance WHERE id=$1",
    badgeKey: "status",
    fields: [
      { name: "student_id", label: "Student", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || student_number AS label FROM portal_students ORDER BY full_name" },
      { name: "checkpoint_id", label: "Checkpoint", type: "select", required: true, optionsQuery: "SELECT id::text AS value, title AS label FROM portal_clearance_checkpoints ORDER BY checkpoint_order" },
      statusField(["pending", "cleared", "blocked"]),
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    updateFields: [statusField(["pending", "cleared", "blocked"]), { name: "notes", label: "Notes", type: "textarea" }],
    columns: [
      { key: "student_name", label: "Student Name" },
      { key: "student_number", label: "Registration Number" },
      { key: "department", label: "Department" },
      { key: "checkpoint", label: "Checkpoint" },
      { key: "status", label: "Status" },
      { key: "notes", label: "Notes" },
    ],
  },
  "graduation-list": {
    title: "Graduation List",
    description: "Manage graduation candidates and final status.",
    table: "portal_graduation_candidates",
    idColumn: "id",
    listSql: "SELECT gc.batch_id::text || '-' || gc.student_id::text AS id, s.full_name AS student_name, s.student_number AS registration_number, p.title AS program, gc.clearance_completed, gc.status AS overall_status, gb.ceremony_date AS graduation_date FROM portal_graduation_candidates gc JOIN portal_students s ON s.id=gc.student_id JOIN portal_graduation_batches gb ON gb.id=gc.batch_id LEFT JOIN portal_student_enrollments e ON e.student_id=s.id AND e.status='active' LEFT JOIN portal_programs p ON p.id=e.program_id ORDER BY gb.ceremony_date DESC NULLS LAST",
    insertSql: "INSERT INTO portal_graduation_candidates (batch_id,student_id,status,clearance_completed) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,$3,CASE WHEN $4='true' THEN true ELSE false END)",
    updateSql: "UPDATE portal_graduation_candidates SET status=$2 WHERE (batch_id::text || '-' || student_id::text)=$1",
    deleteSql: "DELETE FROM portal_graduation_candidates WHERE (batch_id::text || '-' || student_id::text)=$1",
    badgeKey: "overall_status",
    fields: [
      { name: "batch_id", label: "Graduation Batch", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_graduation_batches ORDER BY ceremony_date DESC NULLS LAST" },
      { name: "student_id", label: "Student", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || student_number AS label FROM portal_students ORDER BY full_name" },
      statusField(["pending", "approved", "passed", "failed", "published"]),
      { name: "clearance_completed", label: "Clearance Completed", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('false','No'),('true','Yes')) AS x(value,label)" },
    ],
    updateFields: [statusField(["pending", "approved", "passed", "failed", "published"])],
    columns: [
      { key: "student_name", label: "Student Name" },
      { key: "registration_number", label: "Registration Number" },
      { key: "program", label: "Program" },
      { key: "clearance_completed", label: "Clearance" },
      { key: "overall_status", label: "Overall Status" },
      { key: "graduation_date", label: "Graduation Date" },
    ],
  },
  graduation: {
    title: "Graduation Batches",
    description: "Create graduation batches and ceremony dates.",
    table: "portal_graduation_batches",
    idColumn: "id",
    listSql: "SELECT id, name, ceremony_date, status FROM portal_graduation_batches ORDER BY ceremony_date DESC",
    insertSql: "INSERT INTO portal_graduation_batches (name,ceremony_date,status) VALUES ($1,NULLIF($2,'')::date,$3)",
    updateSql: "UPDATE portal_graduation_batches SET status=$2 WHERE id=$1",
    deleteSql: "DELETE FROM portal_graduation_batches WHERE id=$1",
    badgeKey: "status",
    fields: [{ name: "name", label: "Batch Name", required: true }, { name: "ceremony_date", label: "Ceremony Date", type: "date" }, statusField(["planned", "published", "completed"])],
    updateFields: [statusField(["planned", "published", "completed"])],
    columns: [{ key: "name", label: "Batch" }, { key: "ceremony_date", label: "Ceremony Date" }, { key: "status", label: "Status" }],
  },
});

Object.assign(configs, {
  rooms: {
    title: "Rooms",
    description: "Manage classrooms, labs, hostels and facilities.",
    table: "portal_rooms",
    idColumn: "id",
    listSql: "SELECT id, room_number, room_type AS type, capacity, status, facilities, hostel_fee_kes FROM portal_rooms ORDER BY room_number",
    insertSql: "INSERT INTO portal_rooms (room_number,room_type,capacity,status,facilities,hostel_fee_kes) VALUES ($1,$2,NULLIF($3,'')::int,$4,$5,NULLIF($6,'')::int)",
    updateSql: "UPDATE portal_rooms SET status=$2 WHERE id=$1",
    deleteSql: "UPDATE portal_rooms SET status='archived' WHERE id=$1",
    badgeKey: "status",
    fields: [
      { name: "room_number", label: "Room Number", required: true },
      { name: "room_type", label: "Type", required: true },
      { name: "capacity", label: "Capacity", type: "number", required: true },
      statusField(["available", "occupied", "maintenance", "archived"]),
      { name: "facilities", label: "Facilities", type: "textarea" },
      { name: "hostel_fee_kes", label: "Hostel Fee", type: "number" },
    ],
    updateFields: [statusField(["available", "occupied", "maintenance", "archived"])],
    columns: [
      { key: "room_number", label: "Room Number" },
      { key: "type", label: "Type" },
      { key: "capacity", label: "Capacity" },
      { key: "status", label: "Status" },
      { key: "facilities", label: "Facilities" },
      { key: "hostel_fee_kes", label: "Hostel Fee" },
    ],
  },
  "learning-materials": {
    title: "Learning Materials",
    description: "Upload and manage learning materials.",
    table: "portal_learning_resources",
    idColumn: "id",
    listSql: "SELECT r.id, r.title, r.resource_type AS material_type, u.full_name AS uploaded_by, r.created_at::date AS upload_date, r.url AS file_url FROM portal_learning_resources r LEFT JOIN portal_users u ON u.id=r.created_by ORDER BY r.created_at DESC",
    insertSql: "INSERT INTO portal_learning_resources (title,resource_type,url,description) VALUES ($1,$2,$3,$4)",
    deleteSql: "DELETE FROM portal_learning_resources WHERE id=$1",
    fields: [{ name: "title", label: "Title", required: true }, { name: "resource_type", label: "Material Type", required: true }, { name: "url", label: "File URL" }, { name: "description", label: "Description", type: "textarea" }],
    columns: [{ key: "title", label: "Title" }, { key: "material_type", label: "Material Type" }, { key: "uploaded_by", label: "Uploaded By" }, { key: "upload_date", label: "Upload Date" }, { key: "file_url", label: "File URL" }],
  },
  resources: {
    title: "Learning Materials",
    description: "Upload and manage learning materials.",
    table: "portal_learning_resources",
    idColumn: "id",
    listSql: "SELECT id, title, resource_type AS material_type, url AS file_url, description FROM portal_learning_resources ORDER BY created_at DESC",
    insertSql: "INSERT INTO portal_learning_resources (title,resource_type,url,description) VALUES ($1,$2,$3,$4)",
    deleteSql: "DELETE FROM portal_learning_resources WHERE id=$1",
    fields: [{ name: "title", label: "Title", required: true }, { name: "resource_type", label: "Material Type", required: true }, { name: "url", label: "File URL" }, { name: "description", label: "Description", type: "textarea" }],
    columns: [{ key: "title", label: "Title" }, { key: "material_type", label: "Material Type" }, { key: "file_url", label: "File URL" }, { key: "description", label: "Description" }],
  },
  "medical-attachments": {
    title: "Medical Facility Attachments",
    description: "Assign students to medical facilities for practical rotations.",
    table: "portal_attachment_placements",
    idColumn: "id",
    listSql: "SELECT ap.id, s.full_name AS student_name, s.student_number AS registration_number, site.name AS facility_name, ap.starts_on, ap.ends_on, ap.supervisor_name AS supervisor, ap.status FROM portal_attachment_placements ap JOIN portal_students s ON s.id=ap.student_id JOIN portal_attachment_sites site ON site.id=ap.site_id ORDER BY ap.starts_on DESC",
    insertSql: "INSERT INTO portal_attachment_placements (student_id,site_id,supervisor_name,starts_on,ends_on,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,$3,NULLIF($4,'')::date,NULLIF($5,'')::date,$6)",
    updateSql: "UPDATE portal_attachment_placements SET status=$2 WHERE id=$1",
    deleteSql: "DELETE FROM portal_attachment_placements WHERE id=$1",
    badgeKey: "status",
    fields: [
      { name: "student_id", label: "Student", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || student_number AS label FROM portal_students ORDER BY full_name" },
      { name: "site_id", label: "Facility", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_attachment_sites ORDER BY name" },
      { name: "supervisor_name", label: "Supervisor" },
      { name: "starts_on", label: "Start Date", type: "date", required: true },
      { name: "ends_on", label: "End Date", type: "date" },
      statusField(["assigned", "active", "completed", "cancelled"]),
    ],
    updateFields: [statusField(["assigned", "active", "completed", "cancelled"])],
    columns: [
      { key: "student_name", label: "Student Name" },
      { key: "registration_number", label: "Registration Number" },
      { key: "facility_name", label: "Facility Name" },
      { key: "starts_on", label: "Start" },
      { key: "ends_on", label: "End" },
      { key: "supervisor", label: "Supervisor" },
      { key: "status", label: "Status" },
    ],
  },
  requests: {
    title: "Student Requests",
    description: "Track student service requests.",
    table: "portal_student_requests",
    idColumn: "id",
    listSql: "SELECT r.id, s.full_name AS student, c.name AS category, r.subject, r.status, r.created_at::date AS created_at FROM portal_student_requests r JOIN portal_students s ON s.id=r.student_id LEFT JOIN portal_request_categories c ON c.id=r.category_id ORDER BY r.created_at DESC",
    updateSql: "UPDATE portal_student_requests SET status=$2, updated_at=NOW() WHERE id=$1",
    deleteSql: "DELETE FROM portal_student_requests WHERE id=$1",
    badgeKey: "status",
    fields: [],
    updateFields: [statusField(["submitted", "in_progress", "resolved", "closed"])],
    columns: [{ key: "student", label: "Student" }, { key: "category", label: "Category" }, { key: "subject", label: "Subject" }, { key: "status", label: "Status" }, { key: "created_at", label: "Created" }],
  },
  users: {
    title: "Portal Users",
    description: "View portal users and update account status.",
    table: "portal_users",
    idColumn: "id",
    listSql: "SELECT id, full_name, email, phone, status, created_at::date AS created_at FROM portal_users ORDER BY created_at DESC",
    updateSql: "UPDATE portal_users SET status=$2 WHERE id=$1",
    deleteSql: "UPDATE portal_users SET status='archived' WHERE id=$1",
    badgeKey: "status",
    fields: [],
    updateFields: [statusField(["active", "disabled", "archived"])],
    columns: [{ key: "full_name", label: "Name" }, { key: "email", label: "Email" }, { key: "phone", label: "Phone" }, { key: "status", label: "Status" }, { key: "created_at", label: "Created" }],
  },
});

async function getOptions(config: CrudConfig) {
  const fields = [...config.fields, ...(config.updateFields ?? [])];
  const unique = new Map(fields.filter((field) => "optionsQuery" in field && field.optionsQuery).map((field) => [field.name, field as CrudField & { optionsQuery: string }]));
  const entries = await Promise.all(
    [...unique.values()].map(async (field) => {
      const result = await query<{ value: string; label: string }>(field.optionsQuery);
      return [field.name, result.rows] as const;
    })
  );
  return Object.fromEntries(entries);
}

async function createRecord(module: string, formData: FormData) {
  "use server";
  const user = await requireUser("portal.admin");
  const config = configs[module];
  if (!config?.insertSql) return;

  if (module === "students") {
    const studentNumber = String(formData.get("student_number") ?? "").trim();
    const fullName = String(formData.get("full_name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const phone = String(formData.get("phone") ?? "").trim();
    const initialPassword = String(formData.get("initial_password") ?? "");
    if (!studentNumber || !fullName || !email || !phone || !initialPassword) return;

    const userResult = await query<{ id: string }>(
      `INSERT INTO portal_users (full_name,email,phone,password_hash,status)
       VALUES ($1,$2,$3,$4,'active')
       ON CONFLICT (email) DO UPDATE SET full_name=EXCLUDED.full_name, phone=EXCLUDED.phone, password_hash=EXCLUDED.password_hash, status='active', updated_at=NOW()
       RETURNING id::text`,
      [fullName, email, phone, hashPassword(initialPassword)]
    );
    const studentUserId = userResult.rows[0]?.id;
    if (!studentUserId) return;

    await query(
      `INSERT INTO portal_user_roles (user_id, role_id)
       SELECT $1::uuid, id FROM portal_roles WHERE name='student'
       ON CONFLICT DO NOTHING`,
      [studentUserId]
    );
    await query(
      `INSERT INTO portal_students (user_id,student_number,full_name,email,phone,date_of_birth,gender,national_id,residence,next_of_kin_name,next_of_kin_phone,next_of_kin_relationship,status,registered_by)
       VALUES ($1::uuid,$2,$3,$4,$5,NULLIF($6,'')::date,$7,NULLIF($8,''),NULLIF($9,''),NULLIF($10,''),NULLIF($11,''),NULLIF($12,''),$13,$14::uuid)`,
      [
        studentUserId,
        studentNumber,
        fullName,
        email,
        phone,
        String(formData.get("date_of_birth") ?? ""),
        String(formData.get("gender") ?? "Not Provided"),
        String(formData.get("national_id") ?? ""),
        String(formData.get("residence") ?? ""),
        String(formData.get("next_of_kin_name") ?? ""),
        String(formData.get("next_of_kin_phone") ?? ""),
        String(formData.get("next_of_kin_relationship") ?? ""),
        String(formData.get("status") ?? "active"),
        user.id,
      ]
    );
    revalidatePath("/portal/admin/students");
    return;
  }

  await query(config.insertSql, config.fields.map((field) => String(formData.get(field.name) ?? "")));
  revalidatePath(`/portal/admin/${module}`);
}

async function updateRecord(module: string, formData: FormData) {
  "use server";
  await requireUser("portal.admin");
  const config = configs[module];
  if (!config?.updateSql) return;
  const updateFields = config.updateFields ?? [statusField(["active"])];
  await query(config.updateSql, [String(formData.get("id")), ...updateFields.map((field) => String(formData.get(field.name) ?? ""))]);
  revalidatePath(`/portal/admin/${module}`);
}

async function deleteRecord(module: string, formData: FormData) {
  "use server";
  await requireUser("portal.admin");
  const config = configs[module];
  if (!config?.deleteSql) return;
  await query(config.deleteSql, [String(formData.get("id"))]);
  revalidatePath(`/portal/admin/${module}`);
}

export default async function AdminModulePage({ params }: { params: Promise<{ module: string }> }) {
  await requireUser("portal.admin");
  const { module } = await params;
  const config = configs[module];
  if (!config) notFound();

  const [rowsResult, options] = await Promise.all([query<Record<string, unknown>>(config.listSql), getOptions(config)]);

  return (
    <AdminCrudTable
      title={config.title}
      description={config.description}
      module={module}
      rows={rowsResult.rows}
      columns={config.columns}
      idColumn={config.idColumn}
      badgeKey={config.badgeKey}
      fields={config.fields}
      updateFields={config.updateFields ?? []}
      options={options}
      canCreate={Boolean(config.insertSql)}
      canUpdate={Boolean(config.updateSql)}
      canDelete={Boolean(config.deleteSql)}
      createAction={createRecord.bind(null, module)}
      updateAction={updateRecord.bind(null, module)}
      deleteAction={deleteRecord.bind(null, module)}
    />
  );
}
