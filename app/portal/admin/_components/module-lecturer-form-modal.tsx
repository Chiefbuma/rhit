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

export function ModuleLecturerFormModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Assign Lecturer</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Assign Lecturer to Module</DialogTitle>
                    <DialogDescription>
                        Fill in the details to assign a lecturer to a module.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="module" className="text-right">
                            Module
                        </Label>
                        <Input id="module" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lecturer" className="text-right">
                            Lecturer
                        </Label>
                        <Input id="lecturer" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="class" className="text-right">
                            Class
                        </Label>
                        <Input id="class" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="academicYear" className="text-right">
                            Academic Year
                        </Label>
                        <Input id="academicYear" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Save assignment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
