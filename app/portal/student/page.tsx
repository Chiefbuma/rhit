import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ReactNode } from "react";

// Retaining the server action to create a student request.
async function createStudentRequest(formData: FormData) {
  "use server";
  const user = await requireUser("portal.student");
  const subject = String(formData.get("subject") || "").trim();
  const details = String(formData.get("details") || "").trim();
  const categoryId = String(formData.get("category_id") || "");

  if (!subject || !details) return;

  const student = await query<{ id: string }>(
    "SELECT id::text FROM portal_students WHERE user_id = $1 LIMIT 1",
    [user.id]
  );
  const studentId = student.rows[0]?.id;
  if (!studentId) return;

  await query(
    `INSERT INTO portal_student_requests (student_id, category_id, subject, details)
     VALUES ($1, NULLIF($2, '')::bigint, $3, $4)`,
    [studentId, categoryId, subject, details]
  );

  revalidatePath("/portal/student");
}

// Retaining the data fetching logic for the student dashboard.
async function getStudentData(userId: string) {
  const student = await query<{
    id: string;
    student_number: string;
    full_name: string;
    status: string;
    program: string;
    cohort: string;
    class_name: string | null;
  }>(
    `SELECT s.id::text, s.student_number, s.full_name, s.status, p.title AS program,
      c.name AS cohort, cl.name AS class_name
    FROM portal_students s
    JOIN portal_student_enrollments e ON e.student_id = s.id
    JOIN portal_programs p ON p.id = e.program_id
    JOIN portal_cohorts c ON c.id = e.cohort_id
    LEFT JOIN portal_classes cl ON cl.id = e.class_id
    WHERE s.user_id = $1
    LIMIT 1`,
    [userId]
  );

  if (!student.rows[0]) return null;

  const [invoices, categories, requests] = await Promise.all([
    query<{ invoice_number: string; description: string; amount_kes: number; paid_kes: number; balance_kes: number; status: string }>(
      `SELECT i.invoice_number, i.description, i.amount_kes, COALESCE(sum(p.amount_kes), 0)::int AS paid_kes,
        (i.amount_kes - COALESCE(sum(p.amount_kes), 0))::int AS balance_kes, i.status
      FROM portal_invoices i
      LEFT JOIN portal_payments p ON p.invoice_id = i.id
      WHERE i.student_id = $1
      GROUP BY i.id
      ORDER BY i.created_at DESC`,
      [student.rows[0].id]
    ),
    query<{ id: string; name: string }>("SELECT id::text, name FROM portal_request_categories ORDER BY name"),
    query<{ subject: string; details: string; status: string; category: string | null; created_at: string }>(
      `SELECT r.subject, r.details, r.status, c.name AS category, r.created_at::text
      FROM portal_student_requests r
      LEFT JOIN portal_request_categories c ON c.id = r.category_id
      WHERE r.student_id = $1
      ORDER BY r.created_at DESC
      LIMIT 5`,
      [student.rows[0].id]
    ),
  ]);

  return {
    student: student.rows[0],
    invoices: invoices.rows,
    categories: categories.rows,
    requests: requests.rows,
  };
}

// A new, cleaner component for dashboard sections
function DashboardSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="mb-2 border-b-2 border-gray-300 pb-1 text-lg font-semibold text-gray-700">{title}</h2>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex border-b py-1.5">
      <strong className="w-48 text-gray-600">{label}</strong>
      <span className="text-gray-800">{value || "N/A"}</span>
    </div>
  );
}

export default async function StudentPortalPage() {
  const user = await requireUser("portal.student");
  const data = await getStudentData(user.id);

  if (!data) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Student Profile Not Linked</h1>
        <p className="text-gray-600">Your account is active, but no student record is linked yet. Please contact the registrar.</p>
      </div>
    );
  }

  const totalBalance = data.invoices.reduce((sum, invoice) => sum + invoice.balance_kes, 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-bold">Student Dashboard</h1>
        <p className="text-md text-gray-600">Welcome, {data.student.full_name}</p>
      </div>

      <DashboardSection title="My Profile">
        <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
          <InfoRow label="Registration No." value={data.student.student_number} />
          <InfoRow label="Full Name" value={data.student.full_name} />
          <InfoRow label="Programme" value={data.student.program} />
          <InfoRow label="Cohort" value={data.student.cohort} />
          <InfoRow label="Current Class" value={data.student.class_name} />
          <InfoRow label="Academic Status" value={data.student.status} />
        </div>
      </DashboardSection>

      <DashboardSection title="Fee Statement">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-200 text-left">
              <tr>
                <th className="border-b px-3 py-2">Invoice</th>
                <th className="border-b px-3 py-2">Description</th>
                <th className="border-b px-3 py-2">Amount (KES)</th>
                <th className="border-b px-3 py-2">Paid (KES)</th>
                <th className="border-b px-3 py-2">Balance (KES)</th>
                <th className="border-b px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.invoices.map((invoice, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  <td className="border-b px-3 py-2 font-semibold">{invoice.invoice_number}</td>
                  <td className="border-b px-3 py-2">{invoice.description}</td>
                  <td className="border-b px-3 py-2 text-right">{invoice.amount_kes.toLocaleString()}</td>
                  <td className="border-b px-3 py-2 text-right">{invoice.paid_kes.toLocaleString()}</td>
                  <td className="border-b px-3 py-2 text-right font-bold">{invoice.balance_kes.toLocaleString()}</td>
                  <td className="border-b px-3 py-2">{invoice.status}</td>
                </tr>
              ))}
              {data.invoices.length === 0 && (
                <tr><td colSpan={6} className="py-4 text-center text-gray-500">No invoices found.</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-200 font-bold">
                <td colSpan={4} className="px-3 py-2 text-right">Total Balance</td>
                <td className="px-3 py-2 text-right">{totalBalance.toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </DashboardSection>

      <DashboardSection title="Submit an Enquiry">
        <form action={createStudentRequest} className="space-y-4 rounded-lg bg-gray-50 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="subject" className="mb-1 block font-semibold">Subject</label>
              <input type="text" name="subject" id="subject" className="w-full rounded border-gray-300 p-2" required />
            </div>
            <div>
              <label htmlFor="category_id" className="mb-1 block font-semibold">Category</label>
              <select name="category_id" id="category_id" className="w-full rounded border-gray-300 p-2">
                <option value="">General Enquiry</option>
                {data.categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="details" className="mb-1 block font-semibold">Details</label>
            <textarea name="details" id="details" rows={4} className="w-full rounded border-gray-300 p-2" required></textarea>
          </div>
          <button type="submit" className="rounded bg-sky-700 px-4 py-2 font-bold text-white hover:bg-sky-800">
            Submit Enquiry
          </button>
        </form>
      </DashboardSection>

      <DashboardSection title="Recent Enquiries">
         <div className="space-y-3">
          {data.requests.map((req, i) => (
            <div key={i} className="rounded border border-gray-200 bg-white p-3">
              <div className="flex justify-between">
                <p className="font-bold">{req.subject}</p>
                <span className="text-xs font-semibold uppercase">{req.status}</span>
              </div>
              <p className="text-xs text-gray-500">Category: {req.category || "General"} | Date: {new Date(req.created_at).toLocaleDateString()}</p>
              <p className="mt-2 text-gray-700">{req.details}</p>
            </div>
          ))}
          {data.requests.length === 0 && (
            <p className="text-center text-gray-500">You have not made any enquiries.</p>
          )}
        </div>
      </DashboardSection>

    </div>
  );
}
