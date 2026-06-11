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
import { useState } from "react";

export function StudentDocumentFormModal() {
    const [documentType, setDocumentType] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [studentId, setStudentId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isOpen, setIsOpen] = useState(false);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file || !documentType || !studentId) {
            setError("Please fill out all fields and select a file.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);
        formData.append('studentId', studentId);

        try {
            const response = await fetch('/api/student-documents', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(true);
                setDocumentType('');
                setFile(null);
                setStudentId('');
                setTimeout(() => {
                    setIsOpen(false);
                }, 1000);
            } else {
                setError(result.error || "An unknown error occurred.");
            }
        } catch (err) {
            setError("An error occurred while uploading the file.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Add Document</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Student Document</DialogTitle>
                        <DialogDescription>
                            Upload a new document for a student.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="studentId" className="text-right">
                                Student ID
                            </Label>
                            <Input
                                id="studentId"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="documentType" className="text-right">
                                Document Type
                            </Label>
                            <Input
                                id="documentType"
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g., ID, Certificate, Passport Photo"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="file" className="text-right">
                                File
                            </Label>
                            <Input
                                id="file"
                                type="file"
                                onChange={handleFileChange}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-500 text-sm">Document uploaded successfully!</p>}
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Uploading..." : "Upload Document"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
