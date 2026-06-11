"use client";

import { type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
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

// Based on the image provided by the user.
const studentPrimaryLinks: NavItem[] = [
  { href: "/portal/student", label: "Home" },
  { href: "/portal/student/fees", label: "Fees" },
  { href: "/portal/student/timetable", label: "Timetables" },
  { href: "/portal/student/course-registration", label: "Course Registration" },
  { href: "/portal/student/course-evaluation", label: "Course Evaluation" },
  { href: "/portal/student/results", label: "Results" },
  { href: "/portal/student/enquiries", label: "Enquiries" },
  { href: "/portal/student/book-room", label: "Book Room" },
];

const studentSecondaryLinks: NavItem[] = [
  { href: "/portal/student/change-password", label: "Change Password" },
  { href: "/portal/student/profile", label: "My profile" },
  { href: "/portal/student/id", label: "Student ID" },
  { href: "/portal/student/inter-faculty", label: "Inter Faculty" },
  { href: "/portal/student/clearance", label: "Clearance Status" },
  { href: "/portal/student/caution-refund", label: "Caution Refund" },
  { href: "/portal/student/tracking", label: "Academic Tracking" },
];

function NavLinks({ links, baseClassName }: { links: NavItem[]; baseClassName: string }) {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1">
      {links.map((item) => {
        const active = pathname === item.href;
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

export default function PortalShell({
  children,
  user,
  homePath,
  isStudent,
  links,
}: PortalShellProps) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const adminPrimaryLinks = links.slice(0, 8);
  const adminSecondaryLinks = links.slice(8);
  const primaryLinks = isStudent ? studentPrimaryLinks : adminPrimaryLinks;
  const secondaryLinks = isStudent ? studentSecondaryLinks : adminSecondaryLinks;

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
            <NavLinks links={primaryLinks} baseClassName="text-gray-200" />
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
