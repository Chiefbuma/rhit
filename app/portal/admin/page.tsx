import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

async function getAdminDashboardData() {
  const [userCount, studentCount, programCount, cohortCount] = await Promise.all([
    query("SELECT COUNT(*) FROM portal_users"),
    query("SELECT COUNT(*) FROM portal_students"),
    query("SELECT COUNT(*) FROM portal_programs"),
    query("SELECT COUNT(*) FROM portal_cohorts"),
  ]);

  return {
    userCount: userCount.rows[0].count,
    studentCount: studentCount.rows[0].count,
    programCount: programCount.rows[0].count,
    cohortCount: cohortCount.rows[0].count,
  };
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default async function AdminDashboard() {
  await requireUser("portal.admin");
  const data = await getAdminDashboardData();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={data.studentCount} />
        <StatCard title="Total Programs" value={data.programCount} />
        <StatCard title="Active Cohorts" value={data.cohortCount} />
        <StatCard title="System Users" value={data.userCount} />
      </div>
    </div>
  );
}
