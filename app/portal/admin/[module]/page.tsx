import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hashPassword, requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { Eye, Plus, Save, Trash2 } from "lucide-react";
import { ModalForm } from "@/components/ui/modal-form";

type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "datetime-local" | "textarea" | "select";
  required?: boolean;
  optionsQuery?: string;
  placeholder?: string;
};

type CrudConfig = {
  title: string;
  description: string;
  table: string;
  idColumn: string;
  listSql: string;
  insertSql?: string;
  updateSql?: string;
  deleteSql?: string;
  fields: Field[];
  columns: { key: string; label: string }[];
  badgeKey?: string;
};

const configs: Record<string, CrudConfig> = {
  applications: {
    title: "Applications",
    description: "Review applications and link each applicant to the accepted program and intake.",
    table: "applications",
    idColumn: "id",
    listSql: "SELECT a.id, a.full_name, a.email, a.phone, COALESCE(p.title, a.program) AS program, i.name AS intake, a.status, a.offer_status, a.created_at::date AS created_at FROM applications a LEFT JOIN portal_programs p ON p.id = a.program_id LEFT JOIN portal_intakes i ON i.id = a.intake_id ORDER BY a.created_at DESC",
    insertSql:
      "INSERT INTO applications (full_name, email, phone, program, program_id, intake_id, kcse_mean_grade, kcse_year, status, source) VALUES ($1,$2,$3,(SELECT slug FROM portal_programs WHERE id = NULLIF($4,'')::bigint),NULLIF($4,'')::bigint,NULLIF($5,'')::bigint,$6,NULLIF($7,'')::int,$8,'admin_portal')",
    updateSql: "UPDATE applications SET status = $2, updated_at = NOW() WHERE id = $1",
    deleteSql: "DELETE FROM applications WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "full_name", label: "Full Name", required: true },
      { name: "email", label: "Email", required: true },
      { name: "phone", label: "Phone", required: true },
      { name: "program_id", label: "Program", type: "select", required: true, optionsQuery: "SELECT id::text AS value, title AS label FROM portal_programs ORDER BY title" },
      { name: "intake_id", label: "Intake", type: "select", optionsQuery: "SELECT id::text AS value, name AS label FROM portal_intakes ORDER BY id" },
      { name: "kcse_mean_grade", label: "KCSE Grade" },
      { name: "kcse_year", label: "KCSE Year", type: "number" },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('new','New'),('under_review','Under Review'),('accepted','Accepted'),('rejected','Rejected'),('waitlisted','Waitlisted')) AS x(value,label)" },
    ],
    columns: [
      { key: "full_name", label: "Applicant" },
      { key: "program", label: "Program" },
      { key: "intake", label: "Intake" },
      { key: "phone", label: "Phone" },
      { key: "status", label: "Status" },
      { key: "offer_status", label: "Offer" },
      { key: "created_at", label: "Created" },
    ],
  },
  acceptance: {
    title: "Acceptance",
    description: "Manage accepted applicants, offer letters, and acceptance status before student registration.",
    table: "portal_admission_offers",
    idColumn: "id",
    listSql: "SELECT o.id, a.full_name AS applicant, a.email, p.title AS program, o.offer_number, o.offer_url, o.status, o.issued_at::date AS acceptance_date FROM portal_admission_offers o JOIN applications a ON a.id=o.application_id LEFT JOIN portal_programs p ON p.id=o.program_id ORDER BY o.issued_at DESC",
    insertSql:
      "INSERT INTO portal_admission_offers (application_id,program_id,offer_number,offer_url,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,$3,$4,$5)",
    updateSql: "UPDATE portal_admission_offers SET status = $2, accepted_at = CASE WHEN $2 = 'accepted' THEN NOW() ELSE accepted_at END WHERE id = $1",
    deleteSql: "DELETE FROM portal_admission_offers WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "application_id", label: "Applicant", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || email AS label FROM applications ORDER BY created_at DESC" },
      { name: "program_id", label: "Program", type: "select", required: true, optionsQuery: "SELECT id::text AS value, title AS label FROM portal_programs ORDER BY title" },
      { name: "offer_number", label: "Offer Number", required: true },
      { name: "offer_url", label: "Acceptance Letter URL" },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('issued','Issued'),('accepted','Accepted'),('declined','Declined'),('expired','Expired')) AS x(value,label)" },
    ],
    columns: [
      { key: "applicant", label: "Applicant" },
      { key: "email", label: "Email" },
      { key: "program", label: "Program" },
      { key: "acceptance_date", label: "Acceptance Date" },
      { key: "offer_url", label: "Letter URL" },
      { key: "status", label: "Status" },
    ],
  },
  students: {
    title: "Students",
    description: "Register accepted applicants as students. Registration creates both the student record and student login credentials.",
    table: "portal_students",
    idColumn: "id",
    listSql: "SELECT id, student_number, full_name, email, phone, next_of_kin_name, status, created_at::date AS created_at FROM portal_students ORDER BY created_at DESC",
    insertSql: "custom_student_registration",
    updateSql: "UPDATE portal_students SET status = $2 WHERE id = $1",
    deleteSql: "UPDATE portal_students SET status = 'archived' WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "student_number", label: "Student Number", required: true },
      { name: "full_name", label: "Full Name", required: true },
      { name: "email", label: "Email", required: true },
      { name: "phone", label: "Phone", required: true },
      { name: "initial_password", label: "Initial Password", required: true, placeholder: "Give this to the student after registration" },
      { name: "date_of_birth", label: "Date of Birth", type: "date" },
      { name: "gender", label: "Gender", type: "select", optionsQuery: "SELECT value, label FROM (VALUES ('Female','Female'),('Male','Male'),('Not Provided','Not Provided')) AS x(value,label)" },
      { name: "national_id", label: "National ID" },
      { name: "residence", label: "Residence" },
      { name: "next_of_kin_name", label: "Next of Kin Name" },
      { name: "next_of_kin_phone", label: "Next of Kin Phone" },
      { name: "next_of_kin_relationship", label: "Next of Kin Relationship" },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('active','Active'),('deferred','Deferred'),('suspended','Suspended'),('completed','Completed'),('graduated','Graduated'),('archived','Archived')) AS x(value,label)" },
    ],
    columns: [
      { key: "student_number", label: "Student No." },
      { key: "full_name", label: "Name" },
      { key: "phone", label: "Phone" },
      { key: "next_of_kin_name", label: "Next of Kin" },
      { key: "status", label: "Status" },
    ],
  },
  "student-ids": {
    title: "Student ID Management",
    description: "Assign or track student ID numbers for onboarded and registered students.",
    table: "portal_students",
    idColumn: "id",
    listSql: "SELECT s.id, s.full_name, s.student_number, p.title AS program, s.student_id_status AS status, s.student_id_number FROM portal_students s LEFT JOIN portal_student_enrollments e ON e.student_id=s.id AND e.status='active' LEFT JOIN portal_programs p ON p.id=e.program_id WHERE s.status <> 'archived' ORDER BY s.full_name",
    insertSql: undefined,
    updateSql: "UPDATE portal_students SET student_id_status = $2, updated_at = NOW() WHERE id = $1",
    badgeKey: "status",
    fields: [],
    columns: [
      { key: "full_name", label: "Student Name" },
      { key: "student_number", label: "Registration Number" },
      { key: "program", label: "Program" },
      { key: "status", label: "ID Status" },
      { key: "student_id_number", label: "ID Number" },
    ],
  },
  "student-course-assignment": {
    title: "Student Course Assignment",
    description: "Assign students to program, cohort, class and linked modules using the configured academic relationships.",
    table: "portal_student_enrollments",
    idColumn: "id",
    listSql: "SELECT e.id, s.full_name AS student, s.student_number, p.title AS program, c.name AS cohort, cl.name AS class, STRING_AGG(DISTINCT m.title, ', ' ORDER BY m.title) AS assigned_modules, e.status FROM portal_student_enrollments e JOIN portal_students s ON s.id=e.student_id JOIN portal_programs p ON p.id=e.program_id JOIN portal_cohorts c ON c.id=e.cohort_id LEFT JOIN portal_classes cl ON cl.id=e.class_id LEFT JOIN portal_program_modules pm ON pm.program_id=p.id LEFT JOIN portal_modules m ON m.id=pm.module_id GROUP BY e.id, s.full_name, s.student_number, p.title, c.name, cl.name, e.status ORDER BY s.full_name",
    insertSql:
      "INSERT INTO portal_student_enrollments (student_id,program_id,cohort_id,class_id,enrolled_on,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,NULLIF($3,'')::bigint,NULLIF($4,'')::bigint,NULLIF($5,'')::date,$6)",
    updateSql: "UPDATE portal_student_enrollments SET status = $2 WHERE id = $1",
    deleteSql: "UPDATE portal_student_enrollments SET status = 'archived' WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "student_id", label: "Student", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || student_number AS label FROM portal_students WHERE status <> 'archived' ORDER BY full_name" },
      { name: "program_id", label: "Program", type: "select", required: true, optionsQuery: "SELECT id::text AS value, title AS label FROM portal_programs WHERE status='active' ORDER BY title" },
      { name: "cohort_id", label: "Cohort", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_cohorts WHERE status <> 'archived' ORDER BY starts_on DESC" },
      { name: "class_id", label: "Class", type: "select", optionsQuery: "SELECT id::text AS value, name AS label FROM portal_classes WHERE status <> 'archived' ORDER BY name" },
      { name: "enrolled_on", label: "Assigned On", type: "date", required: true },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('active','Active'),('deferred','Deferred'),('completed','Completed'),('withdrawn','Withdrawn'),('archived','Archived')) AS x(value,label)" },
    ],
    columns: [
      { key: "student", label: "Student Name" },
      { key: "student_number", label: "Registration Number" },
      { key: "program", label: "Program" },
      { key: "cohort", label: "Cohort" },
      { key: "class", label: "Class" },
      { key: "assigned_modules", label: "Assigned Modules" },
      { key: "status", label: "Status" },
    ],
  },
  onboarding: {
    title: "Onboarding",
    description: "Track onboarding tasks created when an accepted offer becomes a student record.",
    table: "portal_student_onboarding",
    idColumn: "id",
    listSql: "SELECT o.id, s.full_name AS student, p.title AS program, c.name AS cohort, cl.name AS class, o.status, o.documents_status, o.orientation_status, o.policies_status FROM portal_student_onboarding o JOIN portal_students s ON s.id=o.student_id LEFT JOIN portal_student_enrollments e ON e.id=o.enrollment_id LEFT JOIN portal_programs p ON p.id=e.program_id LEFT JOIN portal_cohorts c ON c.id=e.cohort_id LEFT JOIN portal_classes cl ON cl.id=e.class_id ORDER BY o.started_at DESC",
    insertSql:
      "INSERT INTO portal_student_onboarding (student_id,application_id,offer_id,enrollment_id,status,documents_status,orientation_status,policies_status,notes) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,NULLIF($3,'')::bigint,NULLIF($4,'')::bigint,$5,$6,$7,$8,$9)",
    updateSql: "UPDATE portal_student_onboarding SET status = $2, completed_at = CASE WHEN $2='completed' THEN NOW() ELSE completed_at END WHERE id = $1",
    deleteSql: "UPDATE portal_student_onboarding SET status = 'cancelled' WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "student_id", label: "Student", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || student_number AS label FROM portal_students ORDER BY full_name" },
      { name: "application_id", label: "Application", type: "select", optionsQuery: "SELECT id::text AS value, full_name || ' - ' || program AS label FROM applications ORDER BY created_at DESC" },
      { name: "offer_id", label: "Offer", type: "select", optionsQuery: "SELECT id::text AS value, offer_number AS label FROM portal_admission_offers ORDER BY issued_at DESC" },
      { name: "enrollment_id", label: "Enrollment", type: "select", optionsQuery: "SELECT e.id::text AS value, s.student_number || ' - ' || p.title AS label FROM portal_student_enrollments e JOIN portal_students s ON s.id=e.student_id JOIN portal_programs p ON p.id=e.program_id ORDER BY e.id DESC" },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('pending','Pending'),('in_progress','In Progress'),('completed','Completed'),('blocked','Blocked'),('cancelled','Cancelled')) AS x(value,label)" },
      { name: "documents_status", label: "Documents", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('pending','Pending'),('submitted','Submitted'),('verified','Verified'),('rejected','Rejected')) AS x(value,label)" },
      { name: "orientation_status", label: "Orientation", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('pending','Pending'),('scheduled','Scheduled'),('completed','Completed')) AS x(value,label)" },
      { name: "policies_status", label: "Policies", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('pending','Pending'),('accepted','Accepted')) AS x(value,label)" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "student", label: "Student" },
      { key: "program", label: "Program" },
      { key: "cohort", label: "Cohort" },
      { key: "class", label: "Class" },
      { key: "status", label: "Status" },
      { key: "documents_status", label: "Documents" },
    ],
  },
  enrollments: {
    title: "Student Enrollments",
    description: "Assign each student to the accepted program, cohort and class. This is the hub used by the student dashboard.",
    table: "portal_student_enrollments",
    idColumn: "id",
    listSql: "SELECT e.id, s.full_name AS student, p.title AS program, c.name AS cohort, cl.name AS class, e.status, e.enrolled_on FROM portal_student_enrollments e JOIN portal_students s ON s.id=e.student_id JOIN portal_programs p ON p.id=e.program_id JOIN portal_cohorts c ON c.id=e.cohort_id LEFT JOIN portal_classes cl ON cl.id=e.class_id ORDER BY e.enrolled_on DESC",
    insertSql:
      "INSERT INTO portal_student_enrollments (student_id,program_id,cohort_id,class_id,application_id,offer_id,enrolled_on,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,NULLIF($3,'')::bigint,NULLIF($4,'')::bigint,NULLIF($5,'')::bigint,NULLIF($6,'')::bigint,NULLIF($7,'')::date,$8)",
    updateSql: "UPDATE portal_student_enrollments SET status = $2 WHERE id = $1",
    deleteSql: "UPDATE portal_student_enrollments SET status = 'archived' WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "student_id", label: "Student", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || student_number AS label FROM portal_students ORDER BY full_name" },
      { name: "program_id", label: "Program", type: "select", required: true, optionsQuery: "SELECT id::text AS value, title AS label FROM portal_programs ORDER BY title" },
      { name: "cohort_id", label: "Cohort", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_cohorts ORDER BY starts_on DESC" },
      { name: "class_id", label: "Class", type: "select", optionsQuery: "SELECT id::text AS value, name AS label FROM portal_classes ORDER BY name" },
      { name: "application_id", label: "Application", type: "select", optionsQuery: "SELECT id::text AS value, full_name || ' - ' || program AS label FROM applications ORDER BY created_at DESC" },
      { name: "offer_id", label: "Offer", type: "select", optionsQuery: "SELECT id::text AS value, offer_number AS label FROM portal_admission_offers ORDER BY issued_at DESC" },
      { name: "enrolled_on", label: "Enrolled On", type: "date", required: true },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('active','Active'),('deferred','Deferred'),('completed','Completed'),('withdrawn','Withdrawn'),('archived','Archived')) AS x(value,label)" },
    ],
    columns: [
      { key: "student", label: "Student" },
      { key: "program", label: "Program" },
      { key: "cohort", label: "Cohort" },
      { key: "class", label: "Class" },
      { key: "status", label: "Status" },
    ],
  },
  programs: {
    title: "Programs",
    description: "Define courses, requirements, fees, and linked PDF documents.",
    table: "portal_programs",
    idColumn: "id",
    listSql: "SELECT id, slug, title, duration_months, entry_requirements, tuition_fee_kes, status FROM portal_programs ORDER BY id",
    insertSql:
      "INSERT INTO portal_programs (slug,title,duration_months,entry_requirements,tuition_fee_kes,overview,pdf_url,status) VALUES ($1,$2,NULLIF($3,'')::int,$4,NULLIF($5,'')::int,$6,$7,$8)",
    updateSql: "UPDATE portal_programs SET status = $2 WHERE id = $1",
    deleteSql: "UPDATE portal_programs SET status = 'archived' WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "slug", label: "Slug", required: true },
      { name: "title", label: "Title", required: true },
      { name: "duration_months", label: "Duration Months", type: "number", required: true },
      { name: "entry_requirements", label: "Entry Requirements", required: true },
      { name: "tuition_fee_kes", label: "Tuition Fee KES", type: "number", required: true },
      { name: "overview", label: "Overview", type: "textarea", required: true },
      { name: "pdf_url", label: "PDF URL" },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('active','Active'),('paused','Paused'),('archived','Archived')) AS x(value,label)" },
    ],
    columns: [
      { key: "slug", label: "Code" },
      { key: "title", label: "Program" },
      { key: "duration_months", label: "Months" },
      { key: "tuition_fee_kes", label: "Tuition" },
      { key: "status", label: "Status" },
    ],
  },
  courses: {
    title: "Courses",
    description: "Create courses under programs before assigning modules, classes, exams, and results.",
    table: "portal_courses",
    idColumn: "id",
    listSql: "SELECT c.id, c.code, c.title, p.title AS program, c.credits, c.status FROM portal_courses c JOIN portal_programs p ON p.id=c.program_id ORDER BY p.title, c.code",
    insertSql:
      "INSERT INTO portal_courses (program_id,code,title,credits,status) VALUES (NULLIF($1,'')::bigint,$2,$3,NULLIF($4,'')::int,$5)",
    updateSql: "UPDATE portal_courses SET status = $2 WHERE id = $1",
    deleteSql: "UPDATE portal_courses SET status = 'archived' WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "program_id", label: "Program", type: "select", required: true, optionsQuery: "SELECT id::text AS value, title AS label FROM portal_programs ORDER BY title" },
      { name: "code", label: "Course Code", required: true },
      { name: "title", label: "Course Name", required: true },
      { name: "credits", label: "Credits", type: "number", required: true },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('active','Active'),('paused','Paused'),('archived','Archived')) AS x(value,label)" },
    ],
    columns: [
      { key: "code", label: "Course Code" },
      { key: "title", label: "Course Name" },
      { key: "program", label: "Program" },
      { key: "credits", label: "Credits" },
      { key: "status", label: "Status" },
    ],
  },
  modules: {
    title: "Modules",
    description: "Manage academic modules and assign them to courses and programs.",
    table: "portal_modules",
    idColumn: "id",
    listSql: "SELECT m.id, m.code, m.title, c.title AS course, p.title AS program, m.semester, m.credits FROM portal_modules m LEFT JOIN portal_courses c ON c.id=m.course_id LEFT JOIN portal_programs p ON p.id=m.program_id ORDER BY m.code",
    insertSql: "INSERT INTO portal_modules (code,title,description,credits,course_id,program_id,semester) VALUES ($1,$2,$3,NULLIF($4,'')::int,NULLIF($5,'')::bigint,NULLIF($6,'')::bigint,$7)",
    deleteSql: "DELETE FROM portal_modules WHERE id = $1",
    fields: [
      { name: "code", label: "Code", required: true },
      { name: "title", label: "Title", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "credits", label: "Credits", type: "number", required: true },
      { name: "course_id", label: "Course", type: "select", optionsQuery: "SELECT id::text AS value, code || ' - ' || title AS label FROM portal_courses ORDER BY code" },
      { name: "program_id", label: "Program", type: "select", optionsQuery: "SELECT id::text AS value, title AS label FROM portal_programs ORDER BY title" },
      { name: "semester", label: "Semester" },
    ],
    columns: [
      { key: "code", label: "Code" },
      { key: "title", label: "Title" },
      { key: "course", label: "Course" },
      { key: "program", label: "Program" },
      { key: "semester", label: "Semester" },
      { key: "credits", label: "Credits" },
    ],
  },
  cohorts: {
    title: "Cohorts",
    description: "Create intakes/cohorts and connect them to programs.",
    table: "portal_cohorts",
    idColumn: "id",
    listSql: "SELECT c.id, c.name, p.title AS program, i.name AS intake, c.starts_on, c.expected_graduation_on, c.status FROM portal_cohorts c JOIN portal_programs p ON p.id=c.program_id JOIN portal_intakes i ON i.id=c.intake_id ORDER BY c.starts_on DESC",
    insertSql:
      "INSERT INTO portal_cohorts (program_id,intake_id,name,starts_on,expected_graduation_on,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,$3,NULLIF($4,'')::date,NULLIF($5,'')::date,$6)",
    updateSql: "UPDATE portal_cohorts SET status = $2 WHERE id = $1",
    deleteSql: "UPDATE portal_cohorts SET status = 'archived' WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "program_id", label: "Program", type: "select", required: true, optionsQuery: "SELECT id::text AS value, title AS label FROM portal_programs ORDER BY title" },
      { name: "intake_id", label: "Intake", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_intakes ORDER BY id" },
      { name: "name", label: "Cohort Name", required: true },
      { name: "starts_on", label: "Starts On", type: "date", required: true },
      { name: "expected_graduation_on", label: "Expected Graduation", type: "date" },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('planned','Planned'),('active','Active'),('completed','Completed'),('archived','Archived')) AS x(value,label)" },
    ],
    columns: [
      { key: "name", label: "Cohort" },
      { key: "program", label: "Program" },
      { key: "intake", label: "Intake" },
      { key: "starts_on", label: "Starts" },
      { key: "status", label: "Status" },
    ],
  },
  classes: {
    title: "Classes",
    description: "Assign cohorts to classes, lecturers, rooms, schedules, and capacity.",
    table: "portal_classes",
    idColumn: "id",
    listSql: "SELECT cl.id, cl.name, c.name AS cohort, p.title AS program, COALESCE(l.full_name, u.full_name) AS trainer, cl.room, cl.schedule, cl.capacity, cl.status FROM portal_classes cl JOIN portal_cohorts c ON c.id=cl.cohort_id JOIN portal_programs p ON p.id=c.program_id LEFT JOIN portal_users u ON u.id=cl.trainer_user_id LEFT JOIN portal_lecturers l ON l.email=u.email ORDER BY cl.id DESC",
    insertSql:
      "INSERT INTO portal_classes (cohort_id,name,trainer_user_id,room,schedule,capacity,status) VALUES (NULLIF($1,'')::bigint,$2,NULLIF($3,'')::uuid,$4,$5,NULLIF($6,'')::int,$7)",
    updateSql: "UPDATE portal_classes SET status = $2 WHERE id = $1",
    deleteSql: "UPDATE portal_classes SET status = 'archived' WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "cohort_id", label: "Cohort", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_cohorts ORDER BY starts_on DESC" },
      { name: "name", label: "Class Name", required: true },
      { name: "trainer_user_id", label: "Trainer", type: "select", optionsQuery: "SELECT id::text AS value, full_name AS label FROM portal_users ORDER BY full_name" },
      { name: "room", label: "Room" },
      { name: "schedule", label: "Schedule" },
      { name: "capacity", label: "Capacity", type: "number" },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('active','Active'),('completed','Completed'),('archived','Archived')) AS x(value,label)" },
    ],
    columns: [
      { key: "name", label: "Class" },
      { key: "cohort", label: "Cohort" },
      { key: "program", label: "Program" },
      { key: "trainer", label: "Trainer" },
      { key: "room", label: "Room" },
      { key: "schedule", label: "Schedule" },
      { key: "capacity", label: "Capacity" },
      { key: "status", label: "Status" },
    ],
  },
  lecturers: {
    title: "Lecturers",
    description: "Manage lecturer profiles and specialization before assigning lecturers to modules and classes.",
    table: "portal_lecturers",
    idColumn: "id",
    listSql: "SELECT id, employee_id, full_name, specialization, email, phone, status FROM portal_lecturers ORDER BY full_name",
    insertSql:
      "INSERT INTO portal_lecturers (employee_id,full_name,specialization,email,phone,status) VALUES ($1,$2,$3,$4,$5,$6)",
    updateSql: "UPDATE portal_lecturers SET status = $2 WHERE id = $1",
    deleteSql: "UPDATE portal_lecturers SET status = 'archived' WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "employee_id", label: "Employee ID", required: true },
      { name: "full_name", label: "Lecturer Name", required: true },
      { name: "specialization", label: "Specialization" },
      { name: "email", label: "Email", required: true },
      { name: "phone", label: "Phone" },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('active','Active'),('inactive','Inactive'),('archived','Archived')) AS x(value,label)" },
    ],
    columns: [
      { key: "employee_id", label: "Employee ID" },
      { key: "full_name", label: "Lecturer Name" },
      { key: "specialization", label: "Specialization" },
      { key: "email", label: "Email" },
      { key: "status", label: "Status" },
    ],
  },
  "module-lecturers": {
    title: "Module Lecturers",
    description: "Assign a lecturer to a module for a specific class and academic year.",
    table: "portal_module_lecturers",
    idColumn: "id",
    listSql: "SELECT ml.id, m.title AS module, l.full_name AS lecturer, cl.name AS class, ml.academic_year, ml.status FROM portal_module_lecturers ml JOIN portal_modules m ON m.id=ml.module_id JOIN portal_lecturers l ON l.id=ml.lecturer_id LEFT JOIN portal_classes cl ON cl.id=ml.class_id ORDER BY ml.academic_year DESC, m.title",
    insertSql:
      "INSERT INTO portal_module_lecturers (module_id,lecturer_id,class_id,academic_year,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,NULLIF($3,'')::bigint,$4,$5)",
    updateSql: "UPDATE portal_module_lecturers SET status = $2 WHERE id = $1",
    deleteSql: "DELETE FROM portal_module_lecturers WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "module_id", label: "Module", type: "select", required: true, optionsQuery: "SELECT id::text AS value, code || ' - ' || title AS label FROM portal_modules ORDER BY code" },
      { name: "lecturer_id", label: "Lecturer", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name AS label FROM portal_lecturers ORDER BY full_name" },
      { name: "class_id", label: "Class", type: "select", optionsQuery: "SELECT id::text AS value, name AS label FROM portal_classes ORDER BY name" },
      { name: "academic_year", label: "Academic Year", required: true },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('active','Active'),('completed','Completed'),('archived','Archived')) AS x(value,label)" },
    ],
    columns: [
      { key: "module", label: "Module" },
      { key: "lecturer", label: "Lecturer" },
      { key: "class", label: "Class" },
      { key: "academic_year", label: "Academic Year" },
      { key: "status", label: "Status" },
    ],
  },
  resources: {
    title: "Learning Materials",
    description: "Create learning materials for assignment to modules, programs, cohorts, classes or students.",
    table: "portal_learning_resources",
    idColumn: "id",
    listSql: "SELECT id, title, resource_type, url, description FROM portal_learning_resources ORDER BY created_at DESC",
    insertSql: "INSERT INTO portal_learning_resources (title,resource_type,url,description) VALUES ($1,$2,$3,$4)",
    deleteSql: "DELETE FROM portal_learning_resources WHERE id = $1",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "resource_type", label: "Type", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('pdf','PDF'),('link','Link'),('video','Video'),('policy','Policy'),('announcement','Announcement')) AS x(value,label)" },
      { name: "url", label: "URL" },
      { name: "description", label: "Description", type: "textarea" },
    ],
    columns: [
      { key: "title", label: "Title" },
      { key: "resource_type", label: "Type" },
      { key: "url", label: "URL" },
      { key: "description", label: "Description" },
    ],
  },
  "learning-materials": {
    title: "Learning Materials",
    description: "Upload and manage learning materials for students and classes.",
    table: "portal_learning_resources",
    idColumn: "id",
    listSql: "SELECT r.id, r.title, r.resource_type, u.full_name AS uploaded_by, r.created_at::date AS upload_date, r.url, r.description FROM portal_learning_resources r LEFT JOIN portal_users u ON u.id=r.created_by ORDER BY r.created_at DESC",
    insertSql: "INSERT INTO portal_learning_resources (title,resource_type,url,description) VALUES ($1,$2,$3,$4)",
    deleteSql: "DELETE FROM portal_learning_resources WHERE id = $1",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "resource_type", label: "Material Type", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('pdf','PDF'),('link','Link'),('video','Video'),('policy','Policy'),('announcement','Announcement')) AS x(value,label)" },
      { name: "url", label: "File URL" },
      { name: "description", label: "Description", type: "textarea" },
    ],
    columns: [
      { key: "title", label: "Title" },
      { key: "resource_type", label: "Material Type" },
      { key: "uploaded_by", label: "Uploaded By" },
      { key: "upload_date", label: "Upload Date" },
      { key: "url", label: "File URL" },
    ],
  },
  rooms: {
    title: "Rooms",
    description: "Manage classrooms, labs, hostels, facilities, and availability.",
    table: "portal_rooms",
    idColumn: "id",
    listSql: "SELECT id, room_number, room_type, capacity, status, facilities, hostel_fee_kes FROM portal_rooms ORDER BY room_number",
    insertSql:
      "INSERT INTO portal_rooms (room_number,room_type,capacity,status,facilities,hostel_fee_kes) VALUES ($1,$2,NULLIF($3,'')::int,$4,$5,NULLIF($6,'')::int)",
    updateSql: "UPDATE portal_rooms SET status = $2 WHERE id = $1",
    deleteSql: "UPDATE portal_rooms SET status = 'archived' WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "room_number", label: "Room Number", required: true },
      { name: "room_type", label: "Type", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('classroom','Classroom'),('lab','Lab'),('hostel','Hostel'),('clinical','Clinical')) AS x(value,label)" },
      { name: "capacity", label: "Capacity", type: "number", required: true },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('available','Available'),('occupied','Occupied'),('maintenance','Maintenance'),('archived','Archived')) AS x(value,label)" },
      { name: "facilities", label: "Facilities", type: "textarea" },
      { name: "hostel_fee_kes", label: "Hostel Fee KES", type: "number" },
    ],
    columns: [
      { key: "room_number", label: "Room Number" },
      { key: "room_type", label: "Type" },
      { key: "capacity", label: "Capacity" },
      { key: "status", label: "Status" },
      { key: "facilities", label: "Facilities" },
      { key: "hostel_fee_kes", label: "Hostel Fee" },
    ],
  },
  "medical-attachments": {
    title: "Medical Facility Attachments",
    description: "Assign students to medical facilities for practical rotations and ward rounds.",
    table: "portal_attachment_placements",
    idColumn: "id",
    listSql: "SELECT ap.id, s.full_name AS student, s.student_number, site.name AS facility_name, ap.starts_on, ap.ends_on, ap.supervisor_name AS supervisor, ap.status FROM portal_attachment_placements ap JOIN portal_students s ON s.id=ap.student_id JOIN portal_attachment_sites site ON site.id=ap.site_id ORDER BY ap.starts_on DESC",
    insertSql:
      "INSERT INTO portal_attachment_placements (student_id,site_id,supervisor_name,starts_on,ends_on,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,$3,NULLIF($4,'')::date,NULLIF($5,'')::date,$6)",
    updateSql: "UPDATE portal_attachment_placements SET status = $2 WHERE id = $1",
    deleteSql: "DELETE FROM portal_attachment_placements WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "student_id", label: "Student", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || student_number AS label FROM portal_students ORDER BY full_name" },
      { name: "site_id", label: "Facility", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_attachment_sites ORDER BY name" },
      { name: "supervisor_name", label: "Supervisor" },
      { name: "starts_on", label: "Start Date", type: "date", required: true },
      { name: "ends_on", label: "End Date", type: "date" },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('assigned','Assigned'),('active','Active'),('completed','Completed'),('cancelled','Cancelled')) AS x(value,label)" },
    ],
    columns: [
      { key: "student", label: "Student Name" },
      { key: "student_number", label: "Registration Number" },
      { key: "facility_name", label: "Facility Name" },
      { key: "starts_on", label: "Start" },
      { key: "ends_on", label: "End" },
      { key: "supervisor", label: "Supervisor" },
      { key: "status", label: "Status" },
    ],
  },
  timetable: {
    title: "Timetable",
    description: "Schedule classes, modules, trainers, rooms and sessions.",
    table: "portal_timetable_events",
    idColumn: "id",
    listSql: "SELECT t.id, t.title, cl.name AS class, m.title AS module, t.room, t.starts_at, t.ends_at FROM portal_timetable_events t JOIN portal_classes cl ON cl.id=t.class_id LEFT JOIN portal_modules m ON m.id=t.module_id ORDER BY t.starts_at DESC",
    insertSql:
      "INSERT INTO portal_timetable_events (class_id,module_id,trainer_user_id,title,room,starts_at,ends_at) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,NULLIF($3,'')::uuid,$4,$5,NULLIF($6,'')::timestamptz,NULLIF($7,'')::timestamptz)",
    deleteSql: "DELETE FROM portal_timetable_events WHERE id = $1",
    fields: [
      { name: "class_id", label: "Class", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_classes ORDER BY name" },
      { name: "module_id", label: "Module", type: "select", optionsQuery: "SELECT id::text AS value, title AS label FROM portal_modules ORDER BY code" },
      { name: "trainer_user_id", label: "Trainer", type: "select", optionsQuery: "SELECT id::text AS value, full_name AS label FROM portal_users ORDER BY full_name" },
      { name: "title", label: "Title", required: true },
      { name: "room", label: "Room" },
      { name: "starts_at", label: "Starts At", type: "datetime-local", required: true },
      { name: "ends_at", label: "Ends At", type: "datetime-local", required: true },
    ],
    columns: [
      { key: "title", label: "Title" },
      { key: "class", label: "Class" },
      { key: "module", label: "Module" },
      { key: "room", label: "Room" },
      { key: "starts_at", label: "Starts" },
    ],
  },
  exams: {
    title: "Exams and Assessments",
    description: "Create assessments against modules, cohorts, and classes so student results can be tied back to the class they took.",
    table: "portal_assessments",
    idColumn: "id",
    listSql: "SELECT a.id, a.title, m.title AS module, c.name AS cohort, cl.name AS class, a.assessment_type, a.max_score, a.weight_percent, a.exam_date, a.status FROM portal_assessments a JOIN portal_modules m ON m.id=a.module_id JOIN portal_cohorts c ON c.id=a.cohort_id LEFT JOIN portal_classes cl ON cl.id=a.class_id ORDER BY a.exam_date DESC NULLS LAST",
    insertSql:
      "INSERT INTO portal_assessments (module_id,cohort_id,class_id,title,assessment_type,max_score,weight_percent,exam_date,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,NULLIF($3,'')::bigint,$4,$5,NULLIF($6,'')::numeric,NULLIF($7,'')::numeric,NULLIF($8,'')::date,$9)",
    updateSql: "UPDATE portal_assessments SET status = $2 WHERE id = $1",
    deleteSql: "DELETE FROM portal_assessments WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "module_id", label: "Module", type: "select", required: true, optionsQuery: "SELECT id::text AS value, code || ' - ' || title AS label FROM portal_modules ORDER BY code" },
      { name: "cohort_id", label: "Cohort", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_cohorts ORDER BY starts_on DESC" },
      { name: "class_id", label: "Class", type: "select", optionsQuery: "SELECT id::text AS value, name AS label FROM portal_classes ORDER BY name" },
      { name: "title", label: "Assessment Title", required: true },
      { name: "assessment_type", label: "Type", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('CAT','CAT'),('Exam','Exam'),('Practical','Practical'),('Assignment','Assignment')) AS x(value,label)" },
      { name: "max_score", label: "Max Score", type: "number", required: true },
      { name: "weight_percent", label: "Weight %", type: "number", required: true },
      { name: "exam_date", label: "Exam Date", type: "date" },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('planned','Planned'),('published','Published'),('completed','Completed'),('approved','Approved'),('archived','Archived')) AS x(value,label)" },
    ],
    columns: [
      { key: "title", label: "Assessment" },
      { key: "module", label: "Module" },
      { key: "cohort", label: "Cohort" },
      { key: "class", label: "Class" },
      { key: "assessment_type", label: "Type" },
      { key: "status", label: "Status" },
    ],
  },
  results: {
    title: "Student Results",
    description: "Enter and approve marks for students who sat an assessment.",
    table: "portal_marks",
    idColumn: "id",
    listSql: "SELECT mark.assessment_id::text || '-' || mark.student_id::text AS id, s.full_name AS student, a.title AS assessment, m.title AS module, mark.score, mark.status, mark.updated_at::date AS updated_at FROM portal_marks mark JOIN portal_students s ON s.id=mark.student_id JOIN portal_assessments a ON a.id=mark.assessment_id JOIN portal_modules m ON m.id=a.module_id ORDER BY mark.updated_at DESC",
    insertSql:
      "INSERT INTO portal_marks (assessment_id,student_id,score,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,NULLIF($3,'')::numeric,$4) ON CONFLICT (assessment_id, student_id) DO UPDATE SET score = EXCLUDED.score, status = EXCLUDED.status, updated_at = NOW()",
    updateSql: "UPDATE portal_marks SET status = $2, updated_at = NOW() WHERE (assessment_id::text || '-' || student_id::text) = $1",
    deleteSql: "DELETE FROM portal_marks WHERE (assessment_id::text || '-' || student_id::text) = $1",
    badgeKey: "status",
    fields: [
      { name: "assessment_id", label: "Assessment", type: "select", required: true, optionsQuery: "SELECT id::text AS value, title AS label FROM portal_assessments ORDER BY exam_date DESC NULLS LAST" },
      { name: "student_id", label: "Student", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || student_number AS label FROM portal_students ORDER BY full_name" },
      { name: "score", label: "Score", type: "number", required: true },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('draft','Draft'),('submitted','Submitted'),('approved','Approved'),('published','Published')) AS x(value,label)" },
    ],
    columns: [
      { key: "student", label: "Student" },
      { key: "assessment", label: "Assessment" },
      { key: "module", label: "Module" },
      { key: "score", label: "Score" },
      { key: "status", label: "Status" },
      { key: "updated_at", label: "Updated" },
    ],
  },
  "course-fees": {
    title: "Course Fees",
    description: "Set fee structures by program and cohort so invoices can be generated from institutional fee rules.",
    table: "portal_fee_structures",
    idColumn: "id",
    listSql: "SELECT fs.id, p.title AS program, c.name AS cohort, fs.name, fs.total_amount_kes, fs.status FROM portal_fee_structures fs JOIN portal_programs p ON p.id=fs.program_id LEFT JOIN portal_cohorts c ON c.id=fs.cohort_id ORDER BY p.title, fs.name",
    insertSql:
      "INSERT INTO portal_fee_structures (program_id,cohort_id,name,total_amount_kes,status) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,$3,NULLIF($4,'')::int,$5)",
    updateSql: "UPDATE portal_fee_structures SET status = $2 WHERE id = $1",
    deleteSql: "UPDATE portal_fee_structures SET status = 'archived' WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "program_id", label: "Program", type: "select", required: true, optionsQuery: "SELECT id::text AS value, title AS label FROM portal_programs ORDER BY title" },
      { name: "cohort_id", label: "Cohort", type: "select", optionsQuery: "SELECT id::text AS value, name AS label FROM portal_cohorts ORDER BY starts_on DESC" },
      { name: "name", label: "Fee Name", required: true },
      { name: "total_amount_kes", label: "Fee Amount", type: "number", required: true },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('active','Active'),('paused','Paused'),('archived','Archived')) AS x(value,label)" },
    ],
    columns: [
      { key: "program", label: "Program" },
      { key: "cohort", label: "Cohort" },
      { key: "name", label: "Fee Name" },
      { key: "total_amount_kes", label: "Fee Amount" },
      { key: "status", label: "Status" },
    ],
  },
  fees: {
    title: "Fees and Invoices",
    description: "Create invoices and track balances.",
    table: "portal_invoices",
    idColumn: "id",
    listSql: "SELECT i.id, s.full_name AS student, i.invoice_number, i.description, i.amount_kes, i.status, i.due_on FROM portal_invoices i JOIN portal_students s ON s.id=i.student_id ORDER BY i.created_at DESC",
    insertSql:
      "INSERT INTO portal_invoices (student_id,invoice_number,description,amount_kes,status,due_on) VALUES (NULLIF($1,'')::bigint,$2,$3,NULLIF($4,'')::int,$5,NULLIF($6,'')::date)",
    updateSql: "UPDATE portal_invoices SET status = $2 WHERE id = $1",
    deleteSql: "DELETE FROM portal_invoices WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "student_id", label: "Student", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || student_number AS label FROM portal_students ORDER BY full_name" },
      { name: "invoice_number", label: "Invoice Number", required: true },
      { name: "description", label: "Description", required: true },
      { name: "amount_kes", label: "Amount KES", type: "number", required: true },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('unpaid','Unpaid'),('partially_paid','Partially Paid'),('paid','Paid'),('void','Void')) AS x(value,label)" },
      { name: "due_on", label: "Due On", type: "date" },
    ],
    columns: [
      { key: "student", label: "Student" },
      { key: "invoice_number", label: "Invoice" },
      { key: "amount_kes", label: "Amount" },
      { key: "status", label: "Status" },
      { key: "due_on", label: "Due" },
    ],
  },
  payments: {
    title: "Payments",
    description: "Record payments, receipts, and manual references against student invoices.",
    table: "portal_payments",
    idColumn: "id",
    listSql: "SELECT pay.id, s.full_name AS student, i.invoice_number, pay.receipt_number, pay.amount_kes, pay.method, pay.reference, pay.paid_at::date AS paid_at FROM portal_payments pay JOIN portal_students s ON s.id=pay.student_id LEFT JOIN portal_invoices i ON i.id=pay.invoice_id ORDER BY pay.paid_at DESC",
    insertSql:
      "INSERT INTO portal_payments (student_id,invoice_id,receipt_number,amount_kes,method,reference) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,$3,NULLIF($4,'')::int,$5,$6)",
    deleteSql: "DELETE FROM portal_payments WHERE id = $1",
    fields: [
      { name: "student_id", label: "Student", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || student_number AS label FROM portal_students ORDER BY full_name" },
      { name: "invoice_id", label: "Invoice", type: "select", optionsQuery: "SELECT id::text AS value, invoice_number AS label FROM portal_invoices ORDER BY created_at DESC" },
      { name: "receipt_number", label: "Receipt Number", required: true },
      { name: "amount_kes", label: "Amount Paid", type: "number", required: true },
      { name: "method", label: "Method", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('manual','Manual'),('mpesa','M-Pesa'),('bank','Bank'),('cash','Cash')) AS x(value,label)" },
      { name: "reference", label: "Reference" },
    ],
    columns: [
      { key: "student", label: "Student" },
      { key: "invoice_number", label: "Invoice" },
      { key: "receipt_number", label: "Receipt" },
      { key: "amount_kes", label: "Amount Paid" },
      { key: "method", label: "Method" },
      { key: "paid_at", label: "Payment Date" },
    ],
  },
  requests: {
    title: "Student Requests",
    description: "Track and update student service requests.",
    table: "portal_student_requests",
    idColumn: "id",
    listSql: "SELECT r.id, s.full_name AS student, c.name AS category, r.subject, r.status, r.created_at::date AS created_at FROM portal_student_requests r JOIN portal_students s ON s.id=r.student_id LEFT JOIN portal_request_categories c ON c.id=r.category_id ORDER BY r.created_at DESC",
    updateSql: "UPDATE portal_student_requests SET status = $2, updated_at = NOW() WHERE id = $1",
    deleteSql: "DELETE FROM portal_student_requests WHERE id = $1",
    badgeKey: "status",
    fields: [],
    columns: [
      { key: "student", label: "Student" },
      { key: "category", label: "Category" },
      { key: "subject", label: "Subject" },
      { key: "status", label: "Status" },
      { key: "created_at", label: "Created" },
    ],
  },
  clearance: {
    title: "Clearance Checkpoints",
    description: "Define clearance checkpoints for departments.",
    table: "portal_clearance_checkpoints",
    idColumn: "id",
    listSql: "SELECT cc.id, ct.name AS template, d.name AS department, cc.title, cc.checkpoint_order FROM portal_clearance_checkpoints cc JOIN portal_clearance_templates ct ON ct.id=cc.template_id LEFT JOIN portal_departments d ON d.id=cc.department_id ORDER BY cc.checkpoint_order",
    insertSql:
      "INSERT INTO portal_clearance_checkpoints (template_id,department_id,title,checkpoint_order) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,$3,NULLIF($4,'')::int)",
    deleteSql: "DELETE FROM portal_clearance_checkpoints WHERE id = $1",
    fields: [
      { name: "template_id", label: "Template", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_clearance_templates ORDER BY name" },
      { name: "department_id", label: "Department", type: "select", optionsQuery: "SELECT id::text AS value, name AS label FROM portal_departments ORDER BY name" },
      { name: "title", label: "Checkpoint", required: true },
      { name: "checkpoint_order", label: "Order", type: "number", required: true },
    ],
    columns: [
      { key: "template", label: "Template" },
      { key: "department", label: "Department" },
      { key: "title", label: "Checkpoint" },
      { key: "checkpoint_order", label: "Order" },
    ],
  },
  graduation: {
    title: "Graduation Batches",
    description: "Plan graduation batches and ceremony details.",
    table: "portal_graduation_batches",
    idColumn: "id",
    listSql: "SELECT id, name, ceremony_date, status FROM portal_graduation_batches ORDER BY ceremony_date DESC",
    insertSql: "INSERT INTO portal_graduation_batches (name,ceremony_date,status) VALUES ($1,NULLIF($2,'')::date,$3)",
    updateSql: "UPDATE portal_graduation_batches SET status = $2 WHERE id = $1",
    deleteSql: "DELETE FROM portal_graduation_batches WHERE id = $1",
    badgeKey: "status",
    fields: [
      { name: "name", label: "Batch Name", required: true },
      { name: "ceremony_date", label: "Ceremony Date", type: "date" },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('planned','Planned'),('published','Published'),('completed','Completed')) AS x(value,label)" },
    ],
    columns: [
      { key: "name", label: "Batch" },
      { key: "ceremony_date", label: "Ceremony" },
      { key: "status", label: "Status" },
    ],
  },
  "graduation-list": {
    title: "Graduation List",
    description: "Track graduation candidates, clearance completion, and graduation approval status.",
    table: "portal_graduation_candidates",
    idColumn: "id",
    listSql: "SELECT gc.batch_id::text || '-' || gc.student_id::text AS id, s.full_name AS student, s.student_number, p.title AS program, gc.clearance_completed, gc.status, gb.ceremony_date AS graduation_date FROM portal_graduation_candidates gc JOIN portal_students s ON s.id=gc.student_id JOIN portal_graduation_batches gb ON gb.id=gc.batch_id LEFT JOIN portal_student_enrollments e ON e.student_id=s.id AND e.status='active' LEFT JOIN portal_programs p ON p.id=e.program_id ORDER BY gb.ceremony_date DESC NULLS LAST, s.full_name",
    insertSql:
      "INSERT INTO portal_graduation_candidates (batch_id,student_id,status,clearance_completed) VALUES (NULLIF($1,'')::bigint,NULLIF($2,'')::bigint,$3,CASE WHEN $4='true' THEN true ELSE false END)",
    updateSql: "UPDATE portal_graduation_candidates SET status = $2 WHERE (batch_id::text || '-' || student_id::text) = $1",
    deleteSql: "DELETE FROM portal_graduation_candidates WHERE (batch_id::text || '-' || student_id::text) = $1",
    badgeKey: "status",
    fields: [
      { name: "batch_id", label: "Graduation Batch", type: "select", required: true, optionsQuery: "SELECT id::text AS value, name AS label FROM portal_graduation_batches ORDER BY ceremony_date DESC NULLS LAST" },
      { name: "student_id", label: "Student", type: "select", required: true, optionsQuery: "SELECT id::text AS value, full_name || ' - ' || student_number AS label FROM portal_students ORDER BY full_name" },
      { name: "status", label: "Status", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('pending','Pending'),('approved','Approved'),('passed','Passed'),('failed','Failed'),('published','Published')) AS x(value,label)" },
      { name: "clearance_completed", label: "Clearance Completed", type: "select", required: true, optionsQuery: "SELECT value, label FROM (VALUES ('false','No'),('true','Yes')) AS x(value,label)" },
    ],
    columns: [
      { key: "student", label: "Student Name" },
      { key: "student_number", label: "Registration Number" },
      { key: "program", label: "Program" },
      { key: "clearance_completed", label: "Clearance" },
      { key: "status", label: "Overall Status" },
      { key: "graduation_date", label: "Graduation Date" },
    ],
  },
  users: {
    title: "Portal Users",
    description: "View portal users and account status.",
    table: "portal_users",
    idColumn: "id",
    listSql: "SELECT id, full_name, email, phone, status, created_at::date AS created_at FROM portal_users ORDER BY created_at DESC",
    updateSql: "UPDATE portal_users SET status = $2 WHERE id = $1",
    deleteSql: "UPDATE portal_users SET status = 'archived' WHERE id = $1",
    badgeKey: "status",
    fields: [],
    columns: [
      { key: "full_name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "status", label: "Status" },
    ],
  },
};

async function getOptions(config: CrudConfig) {
  const optionEntries = await Promise.all(
    config.fields
      .filter((field) => field.optionsQuery)
      .map(async (field) => {
        const result = await query<{ value: string; label: string }>(field.optionsQuery!);
        return [field.name, result.rows] as const;
      })
  );

  return Object.fromEntries(optionEntries) as Record<string, { value: string; label: string }[]>;
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
      `INSERT INTO portal_users (full_name, email, phone, password_hash, status)
       VALUES ($1, $2, $3, $4, 'active')
       ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        password_hash = EXCLUDED.password_hash,
        status = 'active',
        updated_at = NOW()
       RETURNING id::text`,
      [fullName, email, phone, hashPassword(initialPassword)]
    );

    const studentUserId = userResult.rows[0]?.id;
    if (!studentUserId) return;

    await query(
      `INSERT INTO portal_user_roles (user_id, role_id)
       SELECT $1::uuid, id FROM portal_roles WHERE name = 'student'
       ON CONFLICT DO NOTHING`,
      [studentUserId]
    );

    await query(
      `INSERT INTO portal_students (
        user_id,
        student_number,
        full_name,
        email,
        phone,
        date_of_birth,
        gender,
        national_id,
        residence,
        next_of_kin_name,
        next_of_kin_phone,
        next_of_kin_relationship,
        status,
        registered_by
      ) VALUES (
        $1::uuid,$2,$3,$4,$5,NULLIF($6,'')::date,$7,NULLIF($8,''),NULLIF($9,''),NULLIF($10,''),NULLIF($11,''),NULLIF($12,''),$13,$14::uuid
      )`,
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

    await query("INSERT INTO portal_audit_logs (user_id, action, entity_type, details) VALUES ($1, 'student.registered', 'portal_students', $2::jsonb)", [
      user.id,
      JSON.stringify({ student_number: studentNumber, email }),
    ]);
    revalidatePath("/portal/admin/students");
    return;
  }

  const values = config.fields.map((field) => String(formData.get(field.name) ?? ""));
  await query(config.insertSql, values);
  await query("INSERT INTO portal_audit_logs (action, entity_type, details) VALUES ($1,$2,$3::jsonb)", [
    `${module}.create`,
    config.table,
    JSON.stringify(Object.fromEntries(config.fields.map((field) => [field.name, String(formData.get(field.name) ?? "")]))),
  ]);
  revalidatePath(`/portal/admin/${module}`);
}

async function updateStatus(module: string, formData: FormData) {
  "use server";
  await requireUser("portal.admin");
  const config = configs[module];
  if (!config?.updateSql) return;

  await query(config.updateSql, [String(formData.get("id")), String(formData.get("status"))]);
  await query("INSERT INTO portal_audit_logs (action, entity_type, entity_id, details) VALUES ($1,$2,$3,$4::jsonb)", [
    `${module}.update_status`,
    config.table,
    String(formData.get("id")),
    JSON.stringify({ status: String(formData.get("status")) }),
  ]);
  revalidatePath(`/portal/admin/${module}`);
}

async function deleteRecord(module: string, formData: FormData) {
  "use server";
  await requireUser("portal.admin");
  const config = configs[module];
  if (!config?.deleteSql) return;

  await query(config.deleteSql, [String(formData.get("id"))]);
  await query("INSERT INTO portal_audit_logs (action, entity_type, entity_id) VALUES ($1,$2,$3)", [
    `${module}.delete`,
    config.table,
    String(formData.get("id")),
  ]);
  revalidatePath(`/portal/admin/${module}`);
}

function valueText(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (value instanceof Date) return value.toLocaleDateString("en-KE");
  if (typeof value === "number") return value.toLocaleString("en-KE");
  return String(value);
}

function renderField(field: Field, options: Record<string, { value: string; label: string }[]>) {
  return (
    <label key={field.name} className="grid gap-2 sm:grid-cols-[180px_1fr] sm:items-start">
      <span className="pt-2 text-[10px] font-black uppercase tracking-widest text-dark/50">{field.label}</span>
      {field.type === "textarea" ? (
        <textarea name={field.name} required={field.required} placeholder={field.placeholder} rows={3} className="portal-field" />
      ) : field.type === "select" ? (
        <select name={field.name} required={field.required} className="portal-field">
          <option value="">Select {field.label}</option>
          {(options[field.name] ?? []).map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : (
        <input name={field.name} required={field.required} type={field.type ?? "text"} placeholder={field.placeholder} className="portal-field" />
      )}
    </label>
  );
}

export default async function AdminCrudPage({ params }: { params: Promise<{ module: string }> }) {
  await requireUser("portal.admin");
  const { module } = await params;
  const config = configs[module];
  if (!config) notFound();

  const [rowsResult, options] = await Promise.all([query<Record<string, unknown>>(config.listSql), getOptions(config)]);
  const createAction = createRecord.bind(null, module);
  const updateAction = updateStatus.bind(null, module);
  const deleteAction = deleteRecord.bind(null, module);

  return (
    <div className="portal-page space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">Administration</p>
          <h1 className="text-2xl font-bold text-dark md:text-3xl">{config.title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-dark/60">{config.description}</p>
        </div>
        <a href="/portal/admin" className="text-sm font-black uppercase tracking-widest text-primary">Back to Dashboard</a>
      </div>

      {config.insertSql && config.fields.length > 0 ? (
        <div className="flex justify-end">
          <ModalForm
            title={`Create ${config.title.slice(0, -1) || config.title}`}
            description={config.description}
            widthClassName="max-w-3xl"
            trigger={
              <span className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-xs font-black uppercase tracking-widest text-white hover:bg-dark">
                <Plus size={16} /> Create
              </span>
            }
          >
            <form action={createAction} className="space-y-4">
              {config.fields.map((field) => renderField(field, options))}
              <div className="flex justify-end border-t border-[hsl(var(--border))] pt-4">
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-black uppercase tracking-widest text-white hover:bg-dark">
                  <Save size={16} /> Save
                </button>
              </div>
            </form>
          </ModalForm>
        </div>
      ) : null}

      <section className="portal-table-wrap">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
              <tr>
                {config.columns.map((column) => (
                  <th key={column.key} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">{column.label}</th>
                ))}
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rowsResult.rows.map((row) => (
                <tr key={String(row[config.idColumn])} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/60">
                  {config.columns.map((column) => (
                    <td key={column.key} className="max-w-[280px] px-4 py-3 align-top">
                      {column.key === config.badgeKey ? (
                        <span className="inline-flex bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                          {valueText(row[column.key])}
                        </span>
                      ) : (
                        <span className="line-clamp-2">{valueText(row[column.key])}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-2">
                      {module === "students" ? (
                        <a
                          href={`/portal/admin/students/${String(row[config.idColumn])}`}
                          className="flex items-center gap-1 bg-primary px-3 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-dark"
                        >
                          <Eye size={14} /> Dashboard
                        </a>
                      ) : null}
                      {config.updateSql ? (
                        <ModalForm
                          title={`Edit ${config.title}`}
                          description={`Update status for ${valueText(row[config.columns[0]?.key])}.`}
                          trigger={
                            <span className="inline-flex h-8 items-center rounded-md bg-dark px-3 text-xs font-black uppercase tracking-widest text-white hover:bg-primary">
                              Edit
                            </span>
                          }
                        >
                          <form action={updateAction} className="space-y-4">
                            <input type="hidden" name="id" value={String(row[config.idColumn])} />
                            <label className="grid gap-2 sm:grid-cols-[160px_1fr] sm:items-center">
                              <span className="text-[10px] font-black uppercase tracking-widest text-dark/50">Status</span>
                              <select name="status" defaultValue={String(row.status ?? "")} className="portal-field">
                                <option value="active">Active</option>
                                <option value="new">New</option>
                                <option value="under_review">Under Review</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                                <option value="submitted">Submitted</option>
                                <option value="in_progress">In Progress</option>
                                <option value="approved">Approved</option>
                                <option value="paid">Paid</option>
                                <option value="partially_paid">Partially Paid</option>
                                <option value="completed">Completed</option>
                                <option value="archived">Archived</option>
                              </select>
                            </label>
                            <div className="flex justify-end border-t border-[hsl(var(--border))] pt-4">
                              <button className="rounded-md bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-dark">
                                Update
                              </button>
                            </div>
                          </form>
                        </ModalForm>
                      ) : null}
                      {config.deleteSql ? (
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={String(row[config.idColumn])} />
                          <button className="flex items-center gap-1 border border-primary/30 px-3 py-2 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white">
                            <Trash2 size={14} /> Remove
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {rowsResult.rows.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + 1} className="px-4 py-10 text-center text-dark/50">No records found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
