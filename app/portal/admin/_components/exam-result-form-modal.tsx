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

export function ExamResultFormModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Add Exam Result</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Exam Result</DialogTitle>
                    <DialogDescription>
                        Fill in the details of the new exam result.
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
                        <Label htmlFor="exam" className="text-right">
                            Exam
                        </Label>
                        <Input id="exam" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="marks" className="text-right">
                            Marks
                        </Label>
                        <Input id="marks" type="number" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lecturerComments" className="text-right">
                            Lecturer Comments
                        </Label>
                        <Input id="lecturerComments" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Save exam result</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
