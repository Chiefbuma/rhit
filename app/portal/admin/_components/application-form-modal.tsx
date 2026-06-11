import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Application } from "./applications-table";

export function ApplicationFormModal({
  children,
  application,
}: {
  children: React.ReactNode;
  application?: Application;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {application ? "Edit Application" : "Create Application"}
          </DialogTitle>
          <DialogDescription>
            {application
              ? "Edit the application details below."
              : "Fill in the form below to create a new application."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Applicant Name
            </Label>
            <Input
              id="name"
              defaultValue={application?.applicant_name}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              defaultValue={application?.email}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="program" className="text-right">
              Program Applied
            </Label>
            <Input
              id="program"
              defaultValue={application?.program_applied}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kcse_grade" className="text-right">
              KCSE Grade
            </Label>
            <Input
              id="kcse_grade"
              defaultValue={application?.kcse_grade}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
