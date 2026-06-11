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

export function CohortFormModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Add Cohort</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Cohort</DialogTitle>
                    <DialogDescription>
                        Fill in the details of the new cohort.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cohortName" className="text-right">
                            Cohort Name
                        </Label>
                        <Input id="cohortName" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="program" className="text-right">
                            Program
                        </Label>
                        <Input id="program" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startDate" className="text-right">
                            Start Date
                        </Label>
                        <Input id="startDate" type="date" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endDate" className="text-right">
                            End Date
                        </Label>
                        <Input id="endDate" type="date" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="academicYear" className="text-right">
                            Academic Year
                        </Label>
                        <Input id="academicYear" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Save cohort</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
