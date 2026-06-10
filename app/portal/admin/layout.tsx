
import { NavLink } from "@/components/nav-link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="col-span-1">
        <aside className="sticky top-24 flex flex-col gap-2">
          <NavLink href="/portal/admin">Dashboard</NavLink>
          <NavLink href="/portal/admin/students">Students</NavLink>
          <NavLink href="/portal/admin/programs">Programs</NavLink>
          <NavLink href="/portal/admin/cohorts">Cohorts</NavLink>
          <NavLink href="/portal/admin/courses">Courses</NavLink>
        </aside>
      </div>
      <div className="col-span-3">{children}</div>
    </div>
  );
}
