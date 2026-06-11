import { requireUser } from "@/lib/auth";
import { CoursesTable } from "app/portal/admin/_components/courses-table";
import { ProgramsTable } from "./_components/programs-table";

const Page = async ({ params }: { params: { module: string } }) => {
  await requireUser("portal.admin");

  const { module } = params;

  const renderContent = () => {
    switch (module) {
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
