
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import Link from "next/link";

const modules = [
  { title: "Students", href: "/portal/admin/students" },
  { title: "Programs", href: "/portal/admin/programs" },
  { title: "Cohorts", href: "/portal/admin/cohorts" },
  { title: "Courses", href: "/portal/admin/courses" },
];

export default async function AdminPortalPage() {
  await requireUser("portal.admin");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {modules.map((module) => (
          <Link href={module.href} key={module.href}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{module.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Manage {module.title.toLowerCase()}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
