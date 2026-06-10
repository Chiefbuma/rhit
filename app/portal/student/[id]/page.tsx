'''
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export default function StudentDashboard() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div className="col-span-1 md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Bio, Program, Fees, Classes, Exam, and required status</p>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Onboarding Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Education Certificate, Signed Acceptance Letter</p>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Course Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Table of enrolled courses</p>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Enroll in Program</DropdownMenuItem>
                <DropdownMenuItem>Register for Course</DropdownMenuItem>
                <DropdownMenuItem>Make a Payment</DropdownMenuItem>
                <DropdownMenuItem>Upload Document</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
'''