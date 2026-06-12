import SchoolPortalApp from "@/components/school-portal/App";
import { requireUser } from "@/lib/auth";

export default async function PortalPage() {
  const user = await requireUser();
  const isStudent = user.roles.includes("student") && !user.permissions.includes("portal.admin");

  return (
    <SchoolPortalApp
      initialSession={{
        userId: user.id,
        username: user.email,
        name: user.full_name,
        role: isStudent ? "student" : "admin",
        studentId: isStudent ? "STU001" : undefined,
      }}
    />
  );
}
