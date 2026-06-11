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

export function CourseFeeFormModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Add Course Fee</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Course Fee</DialogTitle>
                    <DialogDescription>
                        Fill in the details of the new course fee.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="program" className="text-right">
                            Program
                        </Label>
                        <Input id="program" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="course" className="text-right">
                            Course
                        </Label>
                        <Input id="course" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="feeAmount" className="text-right">
                            Fee Amount
                        </Label>
                        <Input id="feeAmount" type="number" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="academicYear" className="text-right">
                            Academic Year
                        </Label>
                        <Input id="academicYear" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Save course fee</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
