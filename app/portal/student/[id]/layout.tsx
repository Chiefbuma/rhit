'''
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Dashboard",
};

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="container mx-auto py-12">
      {children}
    </main>
  );
}
'''