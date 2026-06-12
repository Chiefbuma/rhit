import {
  Program,
  Course,
  Module,
  Cohort,
  Class,
  Lecturer,
  ModuleLecturer,
  Room,
  Applicant,
  Acceptance,
  Onboarding,
  CourseFee,
  Invoice,
  Payment,
  StudentCourseAssignment,
  LearningMaterial,
  MedicalAttachment,
  Exam,
  ExamResult,
  DepartmentClearance,
  Graduation,
  User,
  HostelBooking
} from './types';

// Programs
export const initialPrograms: Program[] = [
  {
    code: 'CNA',
    name: 'Certificate in Nursing Assistant',
    initials: 'CNA',
    duration: 1,
    status: 'Active',
    description: 'A 1-year basic program for entry-level nursing aides and nursing assistants, focused on clinical skills and patient support.'
  },
  {
    code: 'HRIT',
    name: 'Diploma in Health Records and Information Technology',
    initials: 'HRIT',
    duration: 3,
    status: 'Active',
    description: 'A 3-year diplomas course focusing on health data management, informatics, medical coding and information privacy systems.'
  },
  {
    code: 'CDA',
    name: 'Diploma in Clinical Medicine and Community Health',
    initials: 'CDA',
    duration: 3,
    status: 'Active',
    description: 'A 3-year professional core program for clinical officers covering anatomy, pathology, pharmacology, and community practice.'
  }
];

// Courses
export const initialCourses: Course[] = [
  { code: 'CNA-101', name: 'Foundations of Patient Care', programCode: 'CNA', credits: 4 },
  { code: 'CNA-102', name: 'Anatomy and Physiology Essentials', programCode: 'CNA', credits: 3 },
  { code: 'CNA-103', name: 'Clinical Placement and Reporting', programCode: 'CNA', credits: 6 },
  
  { code: 'HRI-201', name: 'Medical Classification and Coding', programCode: 'HRIT', credits: 4 },
  { code: 'HRI-202', name: 'Database Management Systems for Health', programCode: 'HRIT', credits: 4 },
  { code: 'HRI-203', name: 'Health Record Statutes and Laws', programCode: 'HRIT', credits: 3 },
  
  { code: 'CDA-301', name: 'Principles of Clinical Practice', programCode: 'CDA', credits: 5 },
  { code: 'CDA-302', name: 'Introduction to Pharmacology', programCode: 'CDA', credits: 4 },
  { code: 'CDA-303', name: 'Community Health and Epidemiology', programCode: 'CDA', credits: 4 }
];

// Modules
export const initialModules: Module[] = [
  { code: 'MOD-CNA-01', name: 'Basics of Vital Signs', courseCode: 'CNA-101', programCode: 'CNA', semester: 1, credits: 2 },
  { code: 'MOD-CNA-02', name: 'Hygiene and Infection Control', courseCode: 'CNA-101', programCode: 'CNA', semester: 1, credits: 2 },
  { code: 'MOD-CNA-03', name: 'Cardiorespiratory System Basics', courseCode: 'CNA-102', programCode: 'CNA', semester: 2, credits: 3 },
  
  { code: 'MOD-HRI-01', name: 'ICD-11 Classification Systems', courseCode: 'HRI-201', programCode: 'HRIT', semester: 1, credits: 4 },
  { code: 'MOD-HRI-02', name: 'SQL Protocols in Hospital Systems', courseCode: 'HRI-202', programCode: 'HRIT', semester: 1, credits: 4 },
  { code: 'MOD-HRI-03', name: 'Ethical Standards for Patient Records', courseCode: 'HRI-203', programCode: 'HRIT', semester: 2, credits: 3 },
  
  { code: 'MOD-CDA-01', name: 'Basic Pathology & Diagnostics', courseCode: 'CDA-301', programCode: 'CDA', semester: 1, credits: 5 },
  { code: 'MOD-CDA-02', name: 'Dosage Forms & Pharmacokinetics', courseCode: 'CDA-302', programCode: 'CDA', semester: 1, credits: 4 },
  { code: 'MOD-CDA-03', name: 'Water-borne Disease Control', courseCode: 'CDA-303', programCode: 'CDA', semester: 2, credits: 4 }
];

// Cohorts
export const initialCohorts: Cohort[] = [
  { name: 'CNA-01', programCode: 'CNA', startDate: '2026-01-10', endDate: '2026-12-15', academicYear: '2026' },
  { name: 'HRIT-01', programCode: 'HRIT', startDate: '2025-09-01', endDate: '2028-06-30', academicYear: '2026' },
  { name: 'CDA-01', programCode: 'CDA', startDate: '2025-09-01', endDate: '2028-06-30', academicYear: '2026' }
];

// Classes
export const initialClasses: Class[] = [
  { name: 'CNA-1A', cohortName: 'CNA-01', programCode: 'CNA', roomNumber: 'Room-102', scheduleTime: '09:00 AM - 12:00 PM', scheduleDays: ['Monday', 'Wednesday'], capacity: 30 },
  { name: 'CNA-1B', cohortName: 'CNA-01', programCode: 'CNA', roomNumber: 'Lab-A', scheduleTime: '01:00 PM - 04:00 PM', scheduleDays: ['Tuesday', 'Thursday'], capacity: 25 },
  { name: 'HRIT-2A', cohortName: 'HRIT-01', programCode: 'HRIT', roomNumber: 'Room-204', scheduleTime: '10:00 AM - 01:00 PM', scheduleDays: ['Monday', 'Wednesday', 'Friday'], capacity: 40 },
  { name: 'CDA-3A', cohortName: 'CDA-01', programCode: 'CDA', roomNumber: 'Lab-B', scheduleTime: '08:00 AM - 11:00 AM', scheduleDays: ['Tuesday', 'Thursday', 'Friday'], capacity: 35 }
];

// Lecturers
export const initialLecturers: Lecturer[] = [
  { id: 'LEC001', name: 'Dr. Jane Mugure', employeeId: 'RHIT-L01', specialization: 'Clinical Pathologist', email: 'jane.mugure@rhit.edu', assignedModuleCodes: ['MOD-CDA-01'] },
  { id: 'LEC002', name: 'Prof. Silas Mwangi', employeeId: 'RHIT-L02', specialization: 'Health Informatics Specialist', email: 'silas.mwangi@rhit.edu', assignedModuleCodes: ['MOD-HRI-01', 'MOD-HRI-02'] },
  { id: 'LEC003', name: 'Mrs. Emily Chebet', employeeId: 'RHIT-L03', specialization: 'Nursing Practice Director', email: 'emily.chebet@rhit.edu', assignedModuleCodes: ['MOD-CNA-01', 'MOD-CNA-02', 'MOD-CNA-03'] },
  { id: 'LEC04', name: 'Dr. Albert Odhiambo', employeeId: 'RHIT-L04', specialization: 'Pharmacology and Therapeutics', email: 'albert.odhiambo@rhit.edu', assignedModuleCodes: ['MOD-CDA-02'] }
];

// Module Lecturers (Assignment)
export const initialModuleLecturers: ModuleLecturer[] = [
  { id: 'ML01', moduleCode: 'MOD-CDA-01', lecturerId: 'LEC001', className: 'CDA-3A', academicYear: '2026' },
  { id: 'ML02', moduleCode: 'MOD-HRI-01', lecturerId: 'LEC002', className: 'HRIT-2A', academicYear: '2026' },
  { id: 'ML03', moduleCode: 'MOD-CNA-01', lecturerId: 'LEC003', className: 'CNA-1A', academicYear: '2026' },
  { id: 'ML04', moduleCode: 'MOD-CDA-02', lecturerId: 'LEC04', className: 'CDA-3A', academicYear: '2026' }
];

// Rooms
export const initialRooms: Room[] = [
  { roomNumber: 'Room-102', type: 'classroom', capacity: 40, status: 'available', facilities: ['Smart Board', 'A/C', 'Charging Ports'] },
  { roomNumber: 'Room-204', type: 'classroom', capacity: 50, status: 'available', facilities: ['Projector', 'Whiteboard'] },
  { roomNumber: 'Lab-A', type: 'lab', capacity: 30, status: 'available', facilities: ['30 Desktop PCs', 'Network Racks', 'A/C'] },
  { roomNumber: 'Lab-B', type: 'lab', capacity: 30, status: 'available', facilities: ['Medical Equipment Simulation', 'Anatomical Models'] },
  { 
    roomNumber: 'Hostel-A101', 
    type: 'hostel', 
    capacity: 2, 
    status: 'available', 
    facilities: ['Single Beds', 'Wardrobes', 'Study Desks', 'En-suite Bathroom'],
    hostelFee: 15000,
    imageUrl: 'https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&q=80&w=600'
  },
  { 
    roomNumber: 'Hostel-A102', 
    type: 'hostel', 
    capacity: 2, 
    status: 'available', 
    facilities: ['Single Beds', 'Wardrobe', 'Shared Bathroom'],
    hostelFee: 10000,
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600'
  },
  { 
    roomNumber: 'Hostel-B201', 
    type: 'hostel', 
    capacity: 4, 
    status: 'full', 
    facilities: ['Bunk Beds', 'Shared Desk', 'Fridge'],
    hostelFee: 8000,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600'
  },
  { 
    roomNumber: 'Hostel-B202', 
    type: 'hostel', 
    capacity: 2, 
    status: 'available', 
    facilities: ['Single Beds', 'Shared Wardrobe', 'Balcony View'],
    hostelFee: 12000,
    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=600'
  }
];

// Applicants
export const initialApplicants: Applicant[] = [
  {
    id: 'APP001',
    name: 'Mercy Wanjiku',
    email: 'mercy.wanjiku@gmail.com',
    phone: '0712345678',
    programApplied: 'CNA',
    kcseGrade: 'C+',
    applicationDate: '2026-05-15',
    birthDate: '2004-08-12',
    address: 'Nairobi, Westlands',
    status: 'accepted'
  },
  {
    id: 'APP002',
    name: 'David Kiprop',
    email: 'david.kiprop@hotmail.com',
    phone: '0723456789',
    programApplied: 'HRIT',
    kcseGrade: 'B-',
    applicationDate: '2026-05-20',
    birthDate: '2003-11-24',
    address: 'Eldoret, Elgon View',
    status: 'accepted'
  },
  {
    id: 'APP003',
    name: 'Atieno Ochola',
    email: 'atieno.ochola@yahoo.com',
    phone: '0734567890',
    programApplied: 'CDA',
    kcseGrade: 'B+',
    applicationDate: '2026-06-01',
    birthDate: '2002-04-18',
    address: 'Kisumu, Milimani',
    status: 'new'
  },
  {
    id: 'APP004',
    name: 'Brian Mwiti',
    email: 'brian.mwiti@outlook.com',
    phone: '0745678901',
    programApplied: 'HRIT',
    kcseGrade: 'C-',
    applicationDate: '2026-06-02',
    birthDate: '2005-01-30',
    address: 'Meru Town',
    status: 'in-progress'
  },
  {
    id: 'APP005',
    name: 'Zainab Juma',
    email: 'zainab.juma@gmail.com',
    phone: '0756789012',
    programApplied: 'CDA',
    kcseGrade: 'A-',
    applicationDate: '2026-05-10',
    birthDate: '2003-09-05',
    address: 'Mombasa, Nyali',
    status: 'accepted'
  }
];

// Acceptances
export const initialAcceptances: Acceptance[] = [
  {
    id: 'ACC001',
    applicantId: 'APP001',
    applicantName: 'Mercy Wanjiku',
    email: 'mercy.wanjiku@gmail.com',
    programCode: 'CNA',
    acceptanceDate: '2026-05-18',
    acceptanceLetterUrl: 'https://rhit.edu/letters/acc-mercy-wanjiku.pdf',
    status: 'onboarded'
  },
  {
    id: 'ACC002',
    applicantId: 'APP002',
    applicantName: 'David Kiprop',
    email: 'david.kiprop@hotmail.com',
    programCode: 'HRIT',
    acceptanceDate: '2026-05-22',
    acceptanceLetterUrl: 'https://rhit.edu/letters/acc-david-kiprop.pdf',
    status: 'onboarded'
  },
  {
    id: 'ACC003',
    applicantId: 'APP005',
    applicantName: 'Zainab Juma',
    email: 'zainab.juma@gmail.com',
    programCode: 'CDA',
    acceptanceDate: '2026-05-12',
    acceptanceLetterUrl: 'https://rhit.edu/letters/acc-zainab-juma.pdf',
    status: 'sent'
  }
];

// Onboardings
export const initialOnboardings: Onboarding[] = [
  {
    id: 'STU001',
    applicantId: 'APP001',
    studentName: 'Mercy Wanjiku',
    email: 'mercy.wanjiku@gmail.com',
    programCode: 'CNA',
    registrationNumber: 'RHIT/CNA/1001/2026',
    onboardingDate: '2026-05-25',
    documentStatus: {
      idUploaded: true,
      certificatesUploaded: true,
      photoUploaded: true
    },
    isCompleted: true,
    assignedCohort: 'CNA-01',
    assignedClass: 'CNA-1A'
  },
  {
    id: 'STU002',
    applicantId: 'APP002',
    studentName: 'David Kiprop',
    email: 'david.kiprop@hotmail.com',
    programCode: 'HRIT',
    registrationNumber: 'RHIT/HRIT/1002/2026',
    onboardingDate: '2026-05-28',
    documentStatus: {
      idUploaded: true,
      certificatesUploaded: true,
      photoUploaded: true
    },
    isCompleted: true,
    assignedCohort: 'HRIT-01',
    assignedClass: 'HRIT-2A'
  }
];

// Course Fees
export const initialCourseFees: CourseFee[] = [
  { id: 'FEE01', programCode: 'CNA', courseCode: 'CNA-101', feeAmount: 20000, academicYear: '2026' },
  { id: 'FEE02', programCode: 'CNA', courseCode: 'CNA-102', feeAmount: 15000, academicYear: '2026' },
  { id: 'FEE03', programCode: 'CNA', courseCode: 'CNA-103', feeAmount: 10000, academicYear: '2026' },
  { id: 'FEE04', programCode: 'HRIT', courseCode: 'HRI-201', feeAmount: 25000, academicYear: '2026' },
  { id: 'FEE05', programCode: 'HRIT', courseCode: 'HRI-202', feeAmount: 25000, academicYear: '2026' },
  { id: 'FEE06', programCode: 'HRIT', courseCode: 'HRI-203', feeAmount: 15000, academicYear: '2026' },
  { id: 'FEE07', programCode: 'CDA', courseCode: 'CDA-301', feeAmount: 30000, academicYear: '2026' },
  { id: 'FEE08', programCode: 'CDA', courseCode: 'CDA-302', feeAmount: 25000, academicYear: '2026' },
  { id: 'FEE09', programCode: 'CDA', courseCode: 'CDA-303', feeAmount: 20000, academicYear: '2026' }
];

// Invoices
export const initialInvoices: Invoice[] = [
  {
    id: 'INV001',
    invoiceNumber: 'INV/2026/001',
    studentId: 'STU001',
    studentRegNumber: 'RHIT/CNA/1001/2026',
    studentName: 'Mercy Wanjiku',
    programCode: 'CNA',
    amount: 45000, // CNA courses total fee: 20k + 15k + 10k
    dueDate: '2026-06-30',
    status: 'paid'
  },
  {
    id: 'INV002',
    invoiceNumber: 'INV/2026/002',
    studentId: 'STU002',
    studentRegNumber: 'RHIT/HRIT/1002/2026',
    studentName: 'David Kiprop',
    programCode: 'HRIT',
    amount: 65000, // HRIT courses total fee: 25k + 25k + 15k
    dueDate: '2026-06-30',
    status: 'pending'
  }
];

// Payments
export const initialPayments: Payment[] = [
  {
    id: 'PAY001',
    receiptNumber: 'RCPT-827394',
    studentId: 'STU001',
    studentRegNumber: 'RHIT/CNA/1001/2026',
    invoiceId: 'INV001',
    amountPaid: 45000,
    paymentDate: '2026-06-02',
    method: 'M-Pesa',
    status: 'cleared'
  }
];

// Student course Assignments
export const initialStudentCourseAssignments: StudentCourseAssignment[] = [
  {
    id: 'SCA001',
    studentId: 'STU001',
    studentName: 'Mercy Wanjiku',
    registrationNumber: 'RHIT/CNA/1001/2026',
    programCode: 'CNA',
    cohort: 'CNA-01',
    className: 'CNA-1A',
    assignedModulesCode: ['MOD-CNA-01', 'MOD-CNA-02', 'MOD-CNA-03'],
    status: 'active'
  },
  {
    id: 'SCA002',
    studentId: 'STU002',
    studentName: 'David Kiprop',
    registrationNumber: 'RHIT/HRIT/1002/2026',
    programCode: 'HRIT',
    cohort: 'HRIT-01',
    className: 'HRIT-2A',
    assignedModulesCode: ['MOD-HRI-01', 'MOD-HRI-02', 'MOD-HRI-03'],
    status: 'active'
  }
];

// Learning Materials
export const initialLearningMaterials: LearningMaterial[] = [
  {
    id: 'MAT001',
    title: 'Anatomy System Review Slides',
    moduleCode: 'MOD-CNA-03',
    materialType: 'PDF',
    uploadedBy: 'Mrs. Emily Chebet',
    uploadDate: '2026-05-29',
    fileUrl: 'https://rhit.edu/materials/cna03-anatomy-slides.pdf'
  },
  {
    id: 'MAT002',
    title: 'Hospital SQL DB Setup Guide',
    moduleCode: 'MOD-HRI-02',
    materialType: 'Document',
    uploadedBy: 'Prof. Silas Mwangi',
    uploadDate: '2026-06-01',
    fileUrl: 'https://rhit.edu/materials/hri02-sql-guide.docx'
  },
  {
    id: 'MAT003',
    title: 'Vital Signs Clinical Practicum Video',
    moduleCode: 'MOD-CNA-01',
    materialType: 'Video',
    uploadedBy: 'Mrs. Emily Chebet',
    uploadDate: '2026-05-26',
    fileUrl: 'https://youtube.com/watch?v=rhit-nursing-vitals'
  }
];

// Medical Attachments (Practical Rotations)
export const initialMedicalAttachments: MedicalAttachment[] = [
  {
    id: 'MED001',
    studentId: 'STU001',
    studentName: 'Mercy Wanjiku',
    studentRegNumber: 'RHIT/CNA/1001/2026',
    facilityName: 'Kenyatta National Hospital (A&E)',
    startDate: '2026-07-01',
    endDate: '2026-08-15',
    supervisor: 'Dr. Arthur Kamau',
    status: 'pending'
  },
  {
    id: 'MED002',
    studentId: 'STU002',
    studentName: 'David Kiprop',
    studentRegNumber: 'RHIT/HRIT/1002/2026',
    facilityName: 'Eldoret Referral Hospital (Records)',
    startDate: '2026-06-15',
    endDate: '2026-07-30',
    supervisor: 'Madam Grace Kosgei',
    status: 'active'
  }
];

// Exams
export const initialExams: Exam[] = [
  {
    id: 'EXM001',
    name: 'First Sem Fundamental Assessment',
    moduleCode: 'MOD-CNA-01',
    className: 'CNA-1A',
    date: '2026-06-15',
    time: '14:00 - 16:30',
    venue: 'Exam Hall A',
    totalMarks: 100
  },
  {
    id: 'EXM002',
    name: 'System SQL Lab Test',
    moduleCode: 'MOD-HRI-02',
    className: 'HRIT-2A',
    date: '2026-06-18',
    time: '09:00 - 11:00',
    venue: 'Computer Lab 1',
    totalMarks: 100
  },
  {
    id: 'EXM003',
    name: 'Anatomy System Final Exam',
    moduleCode: 'MOD-CNA-03',
    className: 'CNA-1A',
    date: '2026-06-25',
    time: '09:00 - 12:00',
    venue: 'Exam Hall B',
    totalMarks: 100
  }
];

// Exam Results
export const initialExamResults: ExamResult[] = [
  {
    id: 'RES001',
    studentId: 'STU001',
    studentRegNumber: 'RHIT/CNA/1001/2026',
    studentName: 'Mercy Wanjiku',
    moduleCode: 'MOD-CNA-01',
    examId: 'EXM001',
    marks: 84,
    grade: 'A',
    comments: 'Superb clinical performance, demonstrates safe physical handling and vital records.',
    status: 'Pass'
  },
  {
    id: 'RES002',
    studentId: 'STU002',
    studentRegNumber: 'RHIT/HRIT/1002/2026',
    studentName: 'David Kiprop',
    moduleCode: 'MOD-HRI-02',
    examId: 'EXM002',
    marks: 72,
    grade: 'B',
    comments: 'Excellent logic in queries, query optimisations need focus.',
    status: 'Pass'
  },
  {
    id: 'RES003',
    studentId: 'STU001',
    studentRegNumber: 'RHIT/CNA/1001/2026',
    studentName: 'Mercy Wanjiku',
    moduleCode: 'MOD-CNA-03',
    examId: 'EXM003',
    marks: 58,
    grade: 'C',
    comments: 'Satisfactory but needs more review in cardiorespiratory models.',
    status: 'Pass'
  }
];

// Department Clearance (Library, Finance, Academic, Accommodation)
export const initialDepartmentClearance: DepartmentClearance[] = [
  {
    studentId: 'STU001',
    studentRegNumber: 'RHIT/CNA/1001/2026',
    studentName: 'Mercy Wanjiku',
    libraryCleared: true,
    libraryComments: 'All books returned.',
    financeCleared: true,
    financeComments: 'Fully paid first year.',
    academicCleared: true,
    academicComments: 'Assessed all clinics successfully.',
    accommodationCleared: true,
    accommodationComments: 'Left and cleaned room Hostel-A101.',
    overallStatus: 'cleared'
  },
  {
    studentId: 'STU002',
    studentRegNumber: 'RHIT/HRIT/1002/2026',
    studentName: 'David Kiprop',
    libraryCleared: false,
    libraryComments: 'Has 1 outstanding DBMS text overdue.',
    financeCleared: false,
    financeComments: 'Has incomplete balance 15,000 Kes on invoice.',
    academicCleared: true,
    academicComments: 'Required credits completed.',
    accommodationCleared: false,
    accommodationComments: 'Active booking in Hostel-A102.',
    overallStatus: 'pending'
  }
];

// Graduations
export const initialGraduations: Graduation[] = [
  {
    studentId: 'STU001',
    studentRegNumber: 'RHIT/CNA/1001/2026',
    studentName: 'Mercy Wanjiku',
    programCode: 'CNA',
    gpa: 3.65,
    graduationClass: 'Second Class Upper',
    overallStatus: 'passed',
    graduationDate: '2026-11-20',
    certificateNumber: 'RHIT-CERT-10492'
  },
  {
    studentId: 'STU002',
    studentRegNumber: 'RHIT/HRIT/1002/2026',
    studentName: 'David Kiprop',
    programCode: 'HRIT',
    gpa: 2.85,
    graduationClass: 'Second Class Lower',
    overallStatus: 'pending'
  }
];

// Hostels Booking
export const initialHostelBookings: HostelBooking[] = [
  {
    id: 'BKG001',
    studentId: 'STU001',
    studentRegNumber: 'RHIT/CNA/1001/2026',
    roomNumber: 'Hostel-A101',
    bookingDate: '2026-02-01',
    checkoutDate: '2026-06-01',
    status: 'checked-out',
    paymentStatus: 'paid',
    amount: 15000
  },
  {
    id: 'BKG002',
    studentId: 'STU002',
    studentRegNumber: 'RHIT/HRIT/1002/2026',
    roomNumber: 'Hostel-A102',
    bookingDate: '2026-02-01',
    status: 'active',
    paymentStatus: 'paid', // Paid
    amount: 10000
  }
];

// Users
export const initialUsers: User[] = [
  {
    id: 'USR001',
    username: 'admin@rhti.local',
    passwordHash: 'admin123',
    name: 'Dean Arthur Pendelton',
    role: 'admin'
  },
  {
    id: 'STU001',
    username: 'RHIT/CNA/1001/2026',
    passwordHash: 'RHIT/CNA/1001/2026',
    name: 'Mercy Wanjiku',
    role: 'student',
    forcePasswordReset: true, // Needs force reset on first login
    studentId: 'STU001'
  },
  {
    id: 'STU002',
    username: 'RHIT/HRIT/1002/2026',
    passwordHash: 'pass123', // Already reset
    name: 'David Kiprop',
    role: 'student',
    forcePasswordReset: false,
    studentId: 'STU002'
  }
];

export function getInitialState() {
  const defaults = {
    users: initialUsers,
    programs: initialPrograms,
    courses: initialCourses,
    modules: initialModules,
    cohorts: initialCohorts,
    classes: initialClasses,
    lecturers: initialLecturers,
    moduleLecturers: initialModuleLecturers,
    rooms: initialRooms,
    applicants: initialApplicants,
    acceptances: initialAcceptances,
    onboardings: initialOnboardings,
    courseFees: initialCourseFees,
    invoices: initialInvoices,
    payments: initialPayments,
    studentAssignments: initialStudentCourseAssignments,
    learningMaterials: initialLearningMaterials,
    medicalAttachments: initialMedicalAttachments,
    exams: initialExams,
    examResults: initialExamResults,
    departmentClearances: initialDepartmentClearance,
    graduations: initialGraduations,
    hostelBookings: initialHostelBookings
  };

  if (typeof window === 'undefined') return defaults;

  const loadOrSet = <T>(key: string, defaultValue: T): T => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  };

  return Object.fromEntries(
    Object.entries(defaults).map(([key, value]) => [
      key,
      loadOrSet(`rhit_${key.split(/(?=[A-Z])/).join('_').toLowerCase()}`, value),
    ])
  ) as typeof defaults;
}

export function saveStateToLocalStorage(state: ReturnType<typeof getInitialState>) {
  if (typeof window === 'undefined') return;
  Object.keys(state).forEach(key => {
    localStorage.setItem(`rhit_${key.split(/(?=[A-Z])/).join('_').toLowerCase()}`, JSON.stringify((state as any)[key]));
  });
}
