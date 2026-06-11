"use client";

import { type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

type NavGroup = {
  key: string;
  href: string;
  label: string;
  items: NavItem[];
};

type PortalShellProps = {
  children: ReactNode;
  user: {
    full_name: string;
    roles: string[];
  };
  homePath: string;
  isStudent: boolean;
  links: NavItem[];
};

const studentGroups: NavGroup[] = [
  {
    key: "home",
    href: "/portal/student",
    label: "Home",
    items: [
      { href: "/portal/student/profile", label: "My Profile" },
      { href: "/portal/student/id", label: "Student ID" },
      { href: "/portal/student/tracking", label: "Academic Tracking" },
    ],
  },
  {
    key: "fees",
    href: "/portal/student/fees",
    label: "Fees",
    items: [
      { href: "/portal/student/fees", label: "Fee Statement" },
      { href: "/portal/student/caution-refund", label: "Caution Refund" },
    ],
  },
  {
    key: "timetables",
    href: "/portal/student/timetable",
    label: "Timetables",
    items: [
      { href: "/portal/student/timetable", label: "Class Timetable" },
      { href: "/portal/student/book-room", label: "Book Room" },
    ],
  },
  {
    key: "registration",
    href: "/portal/student/course-registration",
    label: "Course Registration",
    items: [
      { href: "/portal/student/course-registration", label: "Registered Modules" },
      { href: "/portal/student/course-evaluation", label: "Course Evaluation" },
    ],
  },
  {
    key: "results",
    href: "/portal/student/results",
    label: "Results",
    items: [
      { href: "/portal/student/results", label: "Exam Results" },
      { href: "/portal/student/clearance", label: "Clearance Status" },
    ],
  },
  {
    key: "enquiries",
    href: "/portal/student/enquiries",
    label: "Enquiries",
    items: [
      { href: "/portal/student/enquiries", label: "New Enquiry" },
      { href: "/portal/student/change-password", label: "Change Password" },
      { href: "/portal/student/inter-faculty", label: "Inter Faculty" },
    ],
  },
];

const adminGroups: NavGroup[] = [
  {
    key: "home",
    href: "/portal/admin",
    label: "Home",
    items: [
      { href: "/portal/admin", label: "Dashboard" },
      { href: "/portal/admin/requests", label: "Requests" },
      { href: "/portal/admin/users", label: "Users" },
    ],
  },
  {
    key: "registration",
    href: "/portal/admin/applications",
    label: "Registration",
    items: [
      { href: "/portal/admin/applications", label: "Applications" },
      { href: "/portal/admin/acceptance", label: "Acceptance" },
      { href: "/portal/admin/onboarding", label: "Onboarding" },
    ],
  },
  {
    key: "academics",
    href: "/portal/admin/programs",
    label: "Academics",
    items: [
      { href: "/portal/admin/programs", label: "Programs" },
      { href: "/portal/admin/courses", label: "Courses" },
      { href: "/portal/admin/modules", label: "Modules" },
      { href: "/portal/admin/classes", label: "Classes" },
      { href: "/portal/admin/cohorts", label: "Cohorts" },
      { href: "/portal/admin/lecturers", label: "Lecturers" },
      { href: "/portal/admin/module-lecturers", label: "Module Lecturers" },
      { href: "/portal/admin/exams", label: "Exams" },
      { href: "/portal/admin/results", label: "Exam Results" },
    ],
  },
  {
    key: "finance",
    href: "/portal/admin/fees",
    label: "Finance",
    items: [
      { href: "/portal/admin/course-fees", label: "Course Fees" },
      { href: "/portal/admin/fees", label: "Invoices" },
      { href: "/portal/admin/payments", label: "Payments" },
    ],
  },
  {
    key: "students",
    href: "/portal/admin/student-ids",
    label: "Students",
    items: [
      { href: "/portal/admin/student-ids", label: "Student ID Management" },
      { href: "/portal/admin/student-course-assignment", label: "Student Course Assignment" },
    ],
  },
  {
    key: "graduation",
    href: "/portal/admin/clearance",
    label: "Graduation",
    items: [
      { href: "/portal/admin/clearance", label: "Clearance" },
      { href: "/portal/admin/graduation-list", label: "Graduation List" },
    ],
  },
  {
    key: "resources",
    href: "/portal/admin/rooms",
    label: "Resources",
    items: [
      { href: "/portal/admin/rooms", label: "Rooms" },
      { href: "/portal/admin/learning-materials", label: "Learning Materials" },
      { href: "/portal/admin/medical-attachments", label: "Medical Facility Attachments" },
    ],
  },
];

function isHrefActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ links, baseClassName }: { links: NavItem[]; baseClassName: string }) {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {links.map((item) => {
        const active = isHrefActive(pathname, item.href);
        return (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              baseClassName,
              "rounded-sm px-3 py-1.5 text-sm font-medium",
              active ? "bg-black/20 text-white" : "hover:bg-black/10"
            )}
          >
            {item.label}
          </a>
        );
      })}
    </div>
  );
}

function PrimaryTabs({ groups, activeGroup }: { groups: NavGroup[]; activeGroup: NavGroup }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {groups.map((group) => {
        const active = group.key === activeGroup.key;
        return (
          <a
            key={group.key}
            href={group.href}
            className={cn(
              "rounded-sm px-3 py-1.5 text-sm font-medium text-gray-200",
              active ? "bg-black/20 text-white" : "hover:bg-black/10"
            )}
          >
            {group.label}
          </a>
        );
      })}
    </div>
  );
}

export default function PortalShell({
  children,
  user,
  homePath,
  isStudent,
  links,
}: PortalShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const activeAdminGroup =
    adminGroups.find((group) => group.items.some((item) => isHrefActive(pathname, item.href))) ??
    adminGroups[0];
  const activeStudentGroup =
    studentGroups.find((group) => group.items.some((item) => isHrefActive(pathname, item.href)) || isHrefActive(pathname, group.href)) ??
    studentGroups[0];
  const secondaryLinks = isStudent ? activeStudentGroup.items : activeAdminGroup.items;

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <a href={homePath}>
              <img src="/logo/rhti-logo.png" alt="RHTI" className="h-14 w-auto object-contain" />
            </a>
            <div>
              <h1 className="text-xl font-bold">RHTI Portal</h1>
              <p className="text-sm text-gray-600">A world-class institution committed to scholarly excellence</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-600 py-1">
          <div className="container mx-auto flex items-center justify-between px-4">
            {isStudent ? (
              <PrimaryTabs groups={studentGroups} activeGroup={activeStudentGroup} />
            ) : (
              <PrimaryTabs groups={adminGroups} activeGroup={activeAdminGroup} />
            )}
            <a href="#" onClick={logout} className="rounded-sm px-3 py-1.5 text-sm font-medium text-gray-200 hover:bg-black/10">
              Logout
            </a>
          </div>
        </div>
        <div className="bg-sky-200">
          <div className="container mx-auto px-4">
            <NavLinks links={secondaryLinks} baseClassName="text-sky-900" />
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="rounded-lg border border-gray-300 bg-white p-6 shadow">
            {children}
          </div>
        </div>
      </main>

      <footer className="py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <a href="#" className="mx-2 hover:underline">About Us</a>
          <a href="#" className="mx-2 hover:underline">Data Privacy</a>
          <span>© {new Date().getFullYear()} RHTI. Design by Students.</span>
        </div>
      </footer>
    </div>
  );
}
