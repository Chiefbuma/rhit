"use client";

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

export function LecturerFormModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Add Lecturer</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Lecturer</DialogTitle>
                    <DialogDescription>
                        Fill in the details of the new lecturer.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lecturerName" className="text-right">
                            Lecturer Name
                        </Label>
                        <Input id="lecturerName" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="employeeId" className="text-right">
                            Employee ID
                        </Label>
                        <Input id="employeeId" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="specialization" className="text-right">
                            Specialization
                        </Label>
                        <Input id="specialization" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input id="email" type="email" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Save lecturer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
