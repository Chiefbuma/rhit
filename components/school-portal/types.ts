/**
 * College Management System Types
 */

export interface User {
  id: string;
  username: string; // Registration number for student, email for admin
  passwordHash: string;
  name: string;
  role: 'admin' | 'student';
  forcePasswordReset?: boolean;
  studentId?: string; // Links to Onboarding/Student records
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  programApplied: string; // Program Code
  kcseGrade: string; // KCSE Grade or secondary school equivalent
  applicationDate: string;
  birthDate: string;
  address: string;
  status: 'new' | 'in-progress' | 'reviewed' | 'accepted' | 'rejected';
}

export interface Acceptance {
  id: string;
  applicantId: string;
  applicantName: string;
  email: string;
  programCode: string;
  acceptanceDate: string;
  acceptanceLetterUrl: string;
  signedAcceptanceLetterUrl?: string;
  status: 'pending' | 'sent' | 'rejected' | 'onboarded';
}

export interface Onboarding {
  id: string; // Student ID
  applicantId: string;
  studentName: string;
  email: string;
  programCode: string;
  registrationNumber: string; // Format: RHIT/{program_initials}/{random_4_digits}/{year}
  onboardingDate: string;
  documentStatus: {
    idUploaded: boolean;
    certificatesUploaded: boolean;
    kcpeUploaded?: boolean;
    photoUploaded: boolean;
  };
  documentUrls?: {
    nationalId?: string;
    kcseCertificate?: string;
    kcpeCertificate?: string;
    passportPhoto?: string;
  };
  isCompleted: boolean;
  assignedCohort: string; // Cohort Name
  assignedClass: string; // Class Name
}

export interface Program {
  code: string; // e.g. CNA, HRIT, CDA
  name: string;
  initials: string; // e.g. CNA, HRIT, CDA
  duration: number; // in years
  status: 'Active' | 'Inactive';
  description: string;
}

export interface Course {
  code: string; // e.g., CNS101
  name: string;
  programCode: string;
  credits: number;
}

export interface Module {
  code: string; // e.g., MOD111
  name: string;
  courseCode?: string;
  programCode: string;
  semester?: number;
  credits?: number;
}

export interface Class {
  name: string; // e.g., CNA-01-A
  cohortName: string; // e.g., CNA-01
  programCode: string;
  moduleCode?: string;
  roomNumber: string;
  scheduleTime: string; // e.g. "08:00 AM - 11:00 AM"
  scheduleDays: string[]; // e.g. ["Monday", "Wednesday"]
  capacity: number;
}

export interface Cohort {
  name: string; // e.g. CNA-01, generated automatically
  programCode: string;
  startDate: string;
  endDate: string;
  academicYear: string; // e.g. "2026"
}

export interface Lecturer {
  id: string;
  name: string;
  employeeId?: string;
  specialization?: string;
  email: string;
  assignedModuleCodes: string[];
}

export interface ModuleLecturer {
  id: string;
  moduleCode: string;
  lecturerId: string;
  className: string;
  academicYear: string;
}

export interface Exam {
  id: string;
  name: string; // e.g. "Mid Sem Exam", "End Sem Exam"
  examType?: 'Final Exam' | 'CAT' | 'Assignment';
  moduleCode: string;
  className: string;
  cohortName?: string;
  date: string;
  time: string;
  venue: string;
  totalMarks: number;
}

export interface ExamResult {
  id: string;
  studentId: string;
  studentRegNumber: string;
  studentName: string;
  moduleCode: string;
  examId: string;
  marks: number;
  grade: string; // Auto-calculated A, B, C, D, F
  comments: string;
  status: 'Pass' | 'Fail' | 'Recorded';
}

export interface CourseFee {
  id: string;
  programCode: string;
  courseCode?: string;
  feeAmount: number;
  academicYear: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentRegNumber: string;
  studentName: string;
  programCode: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface Payment {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentRegNumber: string;
  invoiceId: string;
  amountPaid: number;
  paymentDate: string;
  method: string; // e.g., "M-Pesa", "Bank Transfer", "Credit Card"
  status: 'cleared' | 'failed';
}

export interface StudentCourseAssignment {
  id: string;
  studentId: string;
  studentName: string;
  registrationNumber: string;
  programCode: string;
  cohort: string;
  className: string;
  assignedModulesCode: string[]; // List of specific module codes
  status: 'active' | 'suspended' | 'deferred';
}

export interface Room {
  roomNumber: string;
  type: 'classroom' | 'lab' | 'hostel';
  capacity: number;
  status: 'available' | 'full' | 'maintenance';
  facilities: string[];
  hostelFee?: number; // per semester, only if hostel
  imageUrl?: string;
}

export interface LearningMaterial {
  id: string;
  title: string;
  moduleCode: string;
  materialType: 'PDF' | 'Video' | 'Document';
  uploadedBy: string; // Lecturer name or Admin
  uploadDate: string;
  fileUrl: string;
}

export interface MedicalAttachment {
  id: string;
  studentId: string;
  studentName: string;
  studentRegNumber: string;
  facilityName: string;
  startDate: string;
  endDate: string;
  supervisor: string;
  status: 'pending' | 'active' | 'completed';
  reportUrl?: string; // Optional student report link
}

export interface DepartmentClearance {
  studentId: string;
  studentRegNumber: string;
  studentName: string;
  
  libraryCleared: boolean;
  libraryComments: string;
  
  financeCleared: boolean;
  financeComments: string;
  
  academicCleared: boolean;
  academicComments: string;
  
  accommodationCleared: boolean;
  accommodationComments: string;
  
  overallStatus: 'pending' | 'cleared';
}

export interface Graduation {
  studentId: string;
  studentRegNumber: string;
  studentName: string;
  programCode: string;
  gpa: number; // e.g., 3.82
  graduationClass: 'First Class' | 'Second Class Upper' | 'Second Class Lower' | 'Pass' | 'Fail';
  overallStatus: 'pending' | 'passed' | 'failed' | 'processing' | 'graduated';
  graduationDate?: string;
  certificateNumber?: string;
}

export interface HostelBooking {
  id: string;
  studentId: string;
  studentRegNumber: string;
  roomNumber: string;
  bookingDate: string;
  checkoutDate?: string;
  status: 'pending' | 'approved' | 'active' | 'checked-out';
  paymentStatus: 'unpaid' | 'paid';
  amount: number;
  transactionCode?: string;
  bankTransactionCode?: string;
}
