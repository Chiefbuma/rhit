
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { Student, columns } from "../columns";
import { DataTable } from "./new-student-table";

async function getStudents(): Promise<Student[]> {
  // Fetch data from your API here.
  const { rows } = await query<Student>(`
  SELECT s.id::text, s.student_number, s.full_name, s.status, p.title AS program, c.name AS cohort
  FROM portal_students s
  LEFT JOIN portal_student_enrollments e ON e.student_id = s.id
  LEFT JOIN portal_programs p ON p.id = e.program_id
  LEFT JOIN portal_cohorts c ON c.id = e.cohort_id
  ORDER BY s.created_at DESC
`);
return rows.map((row:any) => ({
  ...row,
  status: "pending",
}));
}

export default async function DemoPage() {
  const data = await getStudents();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
