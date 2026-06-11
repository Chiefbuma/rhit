"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  course_code: z.string().min(1, { message: "Course code is required" }),
  name: z.string().min(1, { message: "Course name is required" }),
  program: z.string().min(1, { message: "Program is required" }),
  credits: z.coerce.number().min(1, { message: "Credits must be at least 1" }),
})

export function CourseFormModal({ course, children }: { course?: any, children: React.ReactNode }) {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: course || {
        course_code: "",
        name: "",
        program: "",
        credits: 0,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Dialog>
        <DialogTrigger asChild>
            {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>{course ? "Edit Course" : "Create Course"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="course_code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Course Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. CNA-101" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Course Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Introduction to Nursing" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="program"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Program</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Certified Nursing Assistant" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="credits"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Credits</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  )
}
