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

export function StudentAttendanceFormModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Add Attendance</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Student Attendance</DialogTitle>
                    <DialogDescription>
                        Fill in the details of the new student attendance record.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="student" className="text-right">
                            Student
                        </Label>
                        <Input id="student" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="module" className="text-right">
                            Module
                        </Label>
                        <Input id="module" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                            Date
                        </Label>
                        <Input id="date" type="date" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Status
                        </Label>
                        <Input id="status" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Save attendance</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
