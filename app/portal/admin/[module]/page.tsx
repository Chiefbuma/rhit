import { requireUser } from "@/lib/auth";
import { AcceptanceTable } from "./_components/acceptance-table";
import { ApplicationsTable } from "./_components/applications-table";
import { OnboardingTable } from "./_components/onboarding-table";
import { StudentsTable } from "./_components/students-table";
import { CoursesTable } from "app/portal/admin/_components/courses-table";
import { ProgramsTable } from "./_components/programs-table";

const Page = async ({ params }: { params: { module: string } }) => {
  await requireUser("portal.admin");

  const { module } = params;

  const renderContent = () => {
    switch (module) {
      case 'acceptance':
        return <AcceptanceTable data={[]} />;
      case 'applications':
        return <ApplicationsTable data={[]} />;
      case 'onboarding':
        return <OnboardingTable data={[]} />;
      case 'students':
        return <StudentsTable data={[]} />;
      case 'courses':
        return <CoursesTable data={[]} />;
      case 'programs':
        return <ProgramsTable data={[]} />;
      default:
        return <div>{module}</div>;
    }
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default Page;
