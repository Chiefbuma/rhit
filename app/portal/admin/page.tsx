"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgramsTable } from "./_components/programs-table";
import { ModulesTable } from "./_components/modules-table";
import { CohortsTable } from "./_components/cohorts-table";
import { LecturersTable } from "./_components/module-lecturers-table";
import { ExamsTable } from "./_components/exams-table";
import { ExamResultsTable } from "./_components/exam-results-table";
import { CourseFeesTable } from "./_components/course-fees-table";
import { InvoicesTable } from "./_components/invoices-table";
import { PaymentsTable } from "./_components/payments-table";
import { StudentsTable } from "./_components/students-table";
import { StudentAttendanceTable } from "./_components/student-attendance-table";
import { StudentDocumentsTable } from "./_components/student-documents-table";


export default function AdminDashboard() {

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <p>Dashboard content goes here.</p>
        </TabsContent>
        <TabsContent value="academics">
          <Tabs defaultValue="programs">
            <TabsList>
              <TabsTrigger value="programs">Programs</TabsTrigger>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
              <TabsTrigger value="lecturers">Lecturers</TabsTrigger>
              <TabsTrigger value="exams">Exams</TabsTrigger>
              <TabsTrigger value="exam-results">Exam Results</TabsTrigger>
            </TabsList>
            <TabsContent value="programs">
              <ProgramsTable />
            </TabsContent>
            <TabsContent value="modules">
              <ModulesTable />
            </TabsContent>
            <TabsContent value="cohorts">
              <CohortsTable />
            </TabsContent>
            <TabsContent value="lecturers">
              <LecturersTable />
            </TabsContent>
            <TabsContent value="exams">
              <ExamsTable />
            </TabsContent>
            <TabsContent value="exam-results">
              <ExamResultsTable />
            </TabsContent>
          </Tabs>
        </TabsContent>
        <TabsContent value="finance">
          <Tabs defaultValue="course-fees">
            <TabsList>
              <TabsTrigger value="course-fees">Course Fees</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
            <TabsContent value="course-fees">
              <CourseFeesTable />
            </TabsContent>
            <TabsContent value="invoices">
              <InvoicesTable />
            </TabsContent>
            <TabsContent value="payments">
              <PaymentsTable />
            </TabsContent>
          </Tabs>
        </TabsContent>
        <TabsContent value="students">
          <Tabs defaultValue="students">
            <TabsList>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="student-attendance">Student Attendance</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            <TabsContent value="students">
              <StudentsTable />
            </TabsContent>
            <TabsContent value="student-attendance">
                <StudentAttendanceTable />
            </TabsContent>
            <TabsContent value="documents">
                <StudentDocumentsTable />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
