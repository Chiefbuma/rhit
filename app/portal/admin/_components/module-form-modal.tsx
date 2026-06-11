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

export function ModuleFormModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Add Module</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Module</DialogTitle>
                    <DialogDescription>
                        Fill in the details of the new module.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="moduleCode" className="text-right">
                            Module Code
                        </Label>
                        <Input id="moduleCode" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="moduleName" className="text-right">
                            Module Name
                        </Label>
                        <Input id="moduleName" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="course" className="text-right">
                            Course
                        </Label>
                        <Input id="course" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="program" className="text-right">
                            Program
                        </Label>
                        <Input id="program" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="semester" className="text-right">
                            Semester
                        </Label>
                        <Input id="semester" type="number" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="credits" className="text-right">
                            Credits
                        </Label>
                        <Input id="credits" type="number" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Save module</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
