import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { StudentTable, type StudentRow } from "./student-table";

export default async function StudentsPage() {
  await requireUser("portal.admin");

  const students = await query<StudentRow>(`
    SELECT
      s.id::text,
      s.student_number,
      s.full_name,
      s.email,
      s.phone,
      s.status,
      p.title AS program,
      c.name AS cohort
    FROM portal_students s
    LEFT JOIN portal_student_enrollments e ON e.student_id = s.id
    LEFT JOIN portal_programs p ON p.id = e.program_id
    LEFT JOIN portal_cohorts c ON c.id = e.cohort_id
    ORDER BY s.created_at DESC
  `);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">Registry</p>
        <h1 className="text-2xl font-bold md:text-3xl">Students</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          Open a student dashboard to manage registration, academics, fees, resources, and clearance.
        </p>
      </div>

      <StudentTable data={students.rows} />
    </div>
  );
}
