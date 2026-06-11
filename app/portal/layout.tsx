import { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import PortalShell from "@/components/portal-shell";

const adminLinks = [
  { href: "/portal/admin", label: "Home", icon: "dashboard" },
  {
    label: "Registration",
    icon: "registration",
    subLinks: [
      { href: "/portal/admin/applications", label: "Applications", icon: "applications" },
      { href: "/portal/admin/acceptance", label: "Acceptance", icon: "acceptance" },
      { href: "/portal/admin/onboarding", label: "Onboarding", icon: "onboarding" },
    ],
  },
  {
    label: "Academics",
    icon: "academics",
    subLinks: [
      { href: "/portal/admin/programs", label: "Programs", icon: "programs" },
      { href: "/portal/admin/courses", label: "Courses", icon: "courses" },
      { href: "/portal/admin/modules", label: "Modules", icon: "modules" },
      { href: "/portal/admin/classes", label: "Classes", icon: "classes" },
      { href: "/portal/admin/cohorts", label: "Cohorts", icon: "cohorts" },
      { href: "/portal/admin/lecturers", label: "Lecturers", icon: "lecturers" },
      { href: "/portal/admin/module-lecturers", label: "Module Lecturers", icon: "module-lecturers" },
      { href: "/portal/admin/exams", label: "Exams", icon: "exams" },
      { href: "/portal/admin/exam-results", label: "Exam Results", icon: "exam-results" },
    ],
  },
  {
    label: "Finance",
    icon: "finance",
    subLinks: [
      { href: "/portal/admin/course-fees", label: "Course Fees", icon: "course-fees" },
      { href: "/portal/admin/invoices", label: "Invoices", icon: "invoices" },
      { href: "/portal/admin/payments", label: "Payments", icon: "payments" },
    ],
  },
  {
    label: "Students",
    icon: "students",
    subLinks: [
      { href: "/portal/admin/student-id-management", label: "Student ID Management", icon: "student-id-management" },
      { href: "/portal/admin/student-course-assignment", label: "Student Course Assignment", icon: "student-course-assignment" },
    ],
  },
  {
    label: "Graduation",
    icon: "graduation",
    subLinks: [
      { href: "/portal/admin/clearance", label: "Clearance", icon: "clearance" },
      { href: "/portal/admin/graduation-list", label: "Graduation List", icon: "graduation-list" },
    ],
  },
  {
    label: "Resources",
    icon: "resources",
    subLinks: [
      { href: "/portal/admin/rooms", label: "Rooms", icon: "rooms" },
      { href: "/portal/admin/learning-materials", label: "Learning Materials", icon: "learning-materials" },
      { href: "/portal/admin/medical-facility-attachments", label: "Medical Facility Attachments", icon: "medical-facility-attachments" },
    ],
  },
];

const studentLinks = [
  { href: "/portal/student", label: "Dashboard", icon: "dashboard" },
  { href: "/#programs", label: "Website", icon: "website" },
];

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const isStudent = user.roles.includes("student") && !user.permissions.includes("portal.admin");
  const homePath = isStudent ? "/portal/student" : "/portal/admin";

  return (
    <PortalShell
      user={{ full_name: user.full_name, roles: user.roles }}
      homePath={homePath}
      isStudent={isStudent}
      links={isStudent ? studentLinks : adminLinks}
    >
      {children}
    </PortalShell>
  );
}
