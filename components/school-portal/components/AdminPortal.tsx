import React, { useState } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  Home as HomeIcon, 
  UserCheck, 
  BookOpen, 
  DollarSign, 
  Users, 
  GraduationCap, 
  FolderOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  AlertCircle, 
  Mail, 
  Download, 
  FileText, 
  Eye, 
  Settings,
  BriefcaseMedical,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { 
  Applicant, 
  Acceptance, 
  Onboarding, 
  Program, 
  Course, 
  Module, 
  Class, 
  Cohort, 
  Lecturer, 
  ModuleLecturer, 
  Exam, 
  ExamResult, 
  CourseFee, 
  Invoice, 
  Payment, 
  StudentCourseAssignment, 
  Room, 
  LearningMaterial, 
  MedicalAttachment, 
  DepartmentClearance, 
  Graduation,
  User
} from '../types';
import { DataTable, Column } from './DataTable';
import { Modal } from './Modal';

type AdminTab = 'home' | 'registration' | 'academics' | 'finance' | 'students' | 'graduation' | 'resources' | 'grading' | 'users' | 'inquiries';
type GradeRule = {
  grade: string;
  min: number;
  max: number;
  status: 'Pass' | 'Fail';
  honour: Graduation['graduationClass'];
};

// Simplified premium chart using pure SVG to keep the code extremely elegant and secure
function StudentEnrollmentChart() {
  return (
    <div className="bg-white p-5 border border-zinc-200 rounded-xl shadow-sm">
      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Enrollment & Registration Trends (2026)</h4>
      <div className="h-48 w-full flex items-end justify-between space-x-2 pt-4 px-2">
        {[
          { label: 'Jan', val: 45, height: '45%' },
          { label: 'Feb', val: 55, height: '55%' },
          { label: 'Mar', val: 70, height: '70%' },
          { label: 'Apr', val: 90, height: '90%' },
          { label: 'May', val: 120, height: '100%' },
          { label: 'Jun', val: 110, height: '95%' }
        ].map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer">
            <span className="text-[10px] font-mono text-primary font-bold opacity-0 group-hover:opacity-100 transition duration-150 mb-1">{item.val}</span>
            <div className="w-full bg-slate-100 rounded-t-md relative overflow-hidden" style={{ height: '140px' }}>
              <div className="bg-primary absolute bottom-0 left-0 right-0 rounded-t-md transition-all duration-500 group-hover:bg-primary" style={{ height: item.height }}></div>
            </div>
            <span className="text-xs text-zinc-500 mt-2 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenueChart() {
  return (
    <div className="bg-white p-5 border border-zinc-200 rounded-xl shadow-sm">
      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Monthly Tuition Revenue Ledger (Kes &apos;000)</h4>
      <div className="h-48 w-full flex items-end justify-between space-x-2 pt-4 px-2">
        {[
          { label: 'Jan', val: '450k', height: '35%' },
          { label: 'Feb', val: '650k', height: '50%' },
          { label: 'Mar', val: '800k', height: '60%' },
          { label: 'Apr', val: '1.2M', height: '85%' },
          { label: 'May', val: '1.5M', height: '100%' },
          { label: 'Jun', val: '1.4M', height: '90%' }
        ].map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer">
            <span className="text-[10px] font-mono text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition duration-150 mb-1">{item.val}</span>
            <div className="w-full bg-slate-100 rounded-t-md relative overflow-hidden" style={{ height: '140px' }}>
              <div className="bg-emerald-600 absolute bottom-0 left-0 right-0 rounded-t-md transition-all duration-500 group-hover:bg-emerald-500" style={{ height: item.height }}></div>
            </div>
            <span className="text-xs text-zinc-500 mt-2 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AdminPortalProps {
  // Master state passed down from top-level App
  state: {
    users: User[];
    programs: Program[];
    courses: Course[];
    modules: Module[];
    cohorts: Cohort[];
    classes: Class[];
    lecturers: Lecturer[];
    moduleLecturers: ModuleLecturer[];
    rooms: Room[];
    applicants: Applicant[];
    acceptances: Acceptance[];
    onboardings: Onboarding[];
    courseFees: CourseFee[];
    invoices: Invoice[];
    payments: Payment[];
    hostelBookings: any[];
    studentAssignments: StudentCourseAssignment[];
    learningMaterials: LearningMaterial[];
    medicalAttachments: MedicalAttachment[];
    exams: Exam[];
    examResults: ExamResult[];
    departmentClearances: DepartmentClearance[];
    graduations: Graduation[];
  };
  
  // State Mutators
  setAppState: React.Dispatch<React.SetStateAction<any>>;
  onLogout?: () => void;
}

export function AdminPortal({ state, setAppState, onLogout }: AdminPortalProps) {
  // Tabs & Sub-tabs layout state
  const [activeTab, setActiveTab] = useState<AdminTab>('home');
  const [subTabs, setSubTabs] = useState<Record<string, string>>({
    registration: 'applications',
    academics: 'programs',
    finance: 'fees',
    students: 'id-management',
    graduation: 'clearance',
    resources: 'rooms'
  });

  const getSubTab = (tab: string) => subTabs[tab] || '';
  const setSubTab = (tab: string, val: string) => {
    setSubTabs(prev => ({ ...prev, [tab]: val }));
  };

  // Toast notification alert state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Generic modal form variables
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalType, setModalType] = useState<string>(''); // e.g. "add_applicant", "edit_applicant", "add_program", etc.
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [generatedPassword, setGeneratedPassword] = useState<{ username: string; password: string } | null>(null);
  const [adminInquiries, setAdminInquiries] = useState([
    { id: 'ENQ-901', student: 'Mercy Wanjiku', subject: 'Accommodation', message: 'I reserved accommodation but need key collection guidance.', status: 'Open' },
    { id: 'ENQ-812', student: 'David Mwangi', subject: 'Fees', message: 'Payment receipt is visible but balance still shows pending.', status: 'Open' }
  ]);
  const [gradeRules, setGradeRules] = useState<GradeRule[]>([
    { grade: 'A', min: 80, max: 101, status: 'Pass', honour: 'First Class' },
    { grade: 'B', min: 70, max: 80, status: 'Pass', honour: 'Second Class Upper' },
    { grade: 'C', min: 50, max: 70, status: 'Pass', honour: 'Second Class Lower' },
    { grade: 'D', min: 40, max: 50, status: 'Pass', honour: 'Pass' },
    { grade: 'E', min: 0, max: 40, status: 'Fail', honour: 'Fail' }
  ]);

  const handleOpenAddModal = (type: string, title: string, initialFields = {}) => {
    setFormData(initialFields);
    setSelectedItemId(null);
    setModalType(type);
    setModalTitle(title);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (type: string, title: string, item: any, idVal: string) => {
    setFormData({ ...item });
    setSelectedItemId(idVal);
    setModalType(type);
    setModalTitle(title);
    setIsModalOpen(true);
  };

  // Multi-step onboarding documents checklist
  const [onboardingStep, setOnboardingStep] = useState(1);

  const modulesForProgram = (programCode?: string) =>
    state.modules.filter((m) => !programCode || m.programCode === programCode);

  const cohortsForProgram = (programCode?: string) =>
    state.cohorts.filter((c) => !programCode || c.programCode === programCode);

  const getExamType = (examId?: string) => state.exams.find((exam) => exam.id === examId)?.examType || 'Final Exam';

  const ruleForMarks = (marks: number) =>
    gradeRules.find((rule) => marks >= rule.min && marks < rule.max) || gradeRules[gradeRules.length - 1];

  const gradeFromMarks = (marks: number, examType = 'Final Exam') => {
    if (examType === 'CAT') return 'Recorded';
    return ruleForMarks(marks).grade;
  };

  const statusFromMarks = (marks: number, examType = 'Final Exam'): ExamResult['status'] => {
    if (examType === 'CAT') return 'Recorded';
    return ruleForMarks(marks).status;
  };

  const graduationClassFromGrade = (grade: string): Graduation['graduationClass'] => {
    return gradeRules.find((rule) => rule.grade === grade)?.honour || 'Fail';
  };

  // General Delete handler
  const handleDeleteRow = (listKey: string, idField: string, idValue: string, message: string) => {
    if (!window.confirm(`Are you sure you want to delete this record?`)) return;
    setAppState((prev: any) => {
      if (!Array.isArray(prev[listKey])) {
        triggerToast('Action failed. The selected table could not be updated.', 'error');
        return prev;
      }
      return {
        ...prev,
        [listKey]: (prev[listKey] as any[]).filter((item: any) => item[idField] !== idValue)
      };
    });
    triggerToast(message, 'success');
  };

  const resetUserPassword = (user: User) => {
    const tempPassword = `RHTI-${Math.floor(100000 + Math.random() * 900000)}`;
    setAppState((prev: any) => ({
      ...prev,
      users: prev.users.map((item: User) =>
        item.id === user.id
          ? { ...item, passwordHash: tempPassword, forcePasswordReset: item.role === 'student' }
          : item
      )
    }));
    setGeneratedPassword({ username: user.username, password: tempPassword });
    triggerToast('Temporary password generated. Share it securely and ask the user to change it on first login.');
  };

  // Dynamic status triggers
  const updateApplicantStatus = (applicantId: string, status: Applicant['status']) => {
    setAppState((prev: any) => {
      const updatedApplicants = prev.applicants.map((a: Applicant) => 
        a.id === applicantId ? { ...a, status } : a
      );
      
      let updatedAcceptances = [...prev.acceptances];
      const applicant = updatedApplicants.find((a: Applicant) => a.id === applicantId);
      
      if (status === 'accepted' && applicant) {
        // Add to acceptance register if doesn't exist
        const exists = prev.acceptances.some((acc: Acceptance) => acc.applicantId === applicantId);
        if (!exists) {
          const newAcceptance: Acceptance = {
            id: 'ACC_' + Math.floor(Math.random() * 10000),
            applicantId: applicant.id,
            applicantName: applicant.name,
            email: applicant.email,
            programCode: applicant.programApplied,
            acceptanceDate: new Date().toISOString().split('T')[0],
            acceptanceLetterUrl: `https://rhit.edu/letters/acc-${applicant.name.toLowerCase().replace(/\s/g, '-')}.pdf`,
            status: 'pending'
          };
          updatedAcceptances.push(newAcceptance);
        }
      }
      
      return { 
        ...prev, 
        applicants: updatedApplicants,
        acceptances: updatedAcceptances
      };
    });
    triggerToast(`Applicant marked as ${status.toUpperCase()}!`);
  };

  // Complete Send Acceptance triggers
  const sendAcceptanceLetter = (accId: string) => {
    const acceptance = state.acceptances.find((acc) => acc.id === accId);
    if (!acceptance?.signedAcceptanceLetterUrl) {
      triggerToast('Upload the signed acceptance letter PDF before sending the acceptance.', 'error');
      return;
    }
    setAppState((prev: any) => ({
      ...prev,
      acceptances: prev.acceptances.map((acc: Acceptance) => 
        acc.id === accId ? { ...acc, status: 'sent' } : acc
      )
    }));
    triggerToast('Acceptance Letter Sent to Applicant Email via SMTP client simulation!');
  };

  const approveHostelBooking = (bookingId: string, transactionCode: string, bankTransactionCode: string) => {
    setAppState((prev: any) => ({
      ...prev,
      hostelBookings: prev.hostelBookings.map((booking: any) =>
        booking.id === bookingId
          ? { ...booking, status: 'approved', paymentStatus: 'paid', transactionCode, bankTransactionCode }
          : booking
      )
    }));
    triggerToast('Hostel slot approved with KSh 3,000 payment proof.');
  };

  // Complete student interactive onboarding trigger
  const processOnboarding = (acceptance: Acceptance) => {
    if (acceptance.status !== 'sent' || !acceptance.signedAcceptanceLetterUrl) {
      triggerToast('Onboarding requires a sent acceptance with the signed acceptance letter attached.', 'error');
      return;
    }

    const programObj = state.programs.find(p => p.code === acceptance.programCode);
    const initials = programObj?.initials || 'GEN';
    const year = new Date().getFullYear();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const regNo = `RHIT/${initials}/${randomDigits}/${year}`;

    // Default Cohort finding or auto-generation
    const defaultCohort = state.cohorts.find(c => c.programCode === acceptance.programCode)?.name || `${initials}-01`;
    // Class is treated as the cohort for this short-module implementation.
    const defaultClass = defaultCohort;

    const newStudentId = 'STU_' + Math.floor(Math.random() * 10000);

    const onboardingRecord: Onboarding = {
      id: newStudentId,
      applicantId: acceptance.applicantId,
      studentName: acceptance.applicantName,
      email: acceptance.email,
      programCode: acceptance.programCode,
      registrationNumber: regNo,
      onboardingDate: new Date().toISOString().split('T')[0],
      documentStatus: {
        idUploaded: true,
        certificatesUploaded: true,
        kcpeUploaded: true,
        photoUploaded: true
      },
      documentUrls: {
        nationalId: '',
        kcseCertificate: '',
        kcpeCertificate: ''
      },
      isCompleted: true,
      assignedCohort: defaultCohort,
      assignedClass: defaultClass
    };

    // Auto invoice generation based on the total program fee.
    const programFeesTotal = state.courseFees
      .filter(cf => cf.programCode === acceptance.programCode)
      .reduce((sum, cf) => sum + cf.feeAmount, 0) || 50000; // default 50k

    const invoice: Invoice = {
      id: 'INV_' + Math.floor(Math.random() * 10000),
      invoiceNumber: `INV/${year}/` + Math.floor(100 + Math.random() * 900),
      studentId: newStudentId,
      studentRegNumber: regNo,
      studentName: acceptance.applicantName,
      programCode: acceptance.programCode,
      amount: programFeesTotal,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days due
      status: 'pending'
    };

    // Auto curriculum module assignment
    const requiredModules = state.modules.filter(m => m.programCode === acceptance.programCode).map(m => m.code);
    const assignmentRecord: StudentCourseAssignment = {
      id: 'SCA_' + Math.floor(Math.random() * 10000),
      studentId: newStudentId,
      studentName: acceptance.applicantName,
      registrationNumber: regNo,
      programCode: acceptance.programCode,
      cohort: defaultCohort,
      className: defaultCohort,
      assignedModulesCode: requiredModules,
      status: 'active'
    };

    // User account creation with credentials
    const newUserAccount: User = {
      id: newStudentId,
      username: regNo,
      passwordHash: regNo, // force match initial password = regNo
      name: acceptance.applicantName,
      role: 'student',
      forcePasswordReset: true,
      studentId: newStudentId
    };

    setAppState((prev: any) => ({
      ...prev,
      onboardings: [...prev.onboardings, onboardingRecord],
      acceptances: prev.acceptances.map((acc: Acceptance) => 
        acc.id === acceptance.id ? { ...acc, status: 'onboarded' } : acc
      ),
      invoices: [...prev.invoices, invoice],
      studentAssignments: [...prev.studentAssignments, assignmentRecord],
      users: [...prev.users, newUserAccount]
    }));

    triggerToast(`Successfully onboarded student! Reg: ${regNo}. Automated credentials generated.`);
  };

  // Bulk Accept applicants triggers
  const bulkAcceptApplicants = (selectedList: Applicant[]) => {
    selectedList.forEach(a => {
      updateApplicantStatus(a.id, 'accepted');
    });
    triggerToast(`Bulk Accepted ${selectedList.length} applicants directly to Acceptance registers!`);
  };

  // Master form Submission dispatch
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create/Edit Dispatch center
    if (modalType === 'add_applicant' || modalType === 'edit_applicant') {
      if (modalType === 'add_applicant') {
        const item: Applicant = {
          id: 'APP_' + Math.floor(Math.random() * 10000),
          name: formData.name,
          email: formData.email,
          phone: formData.phone || '',
          birthDate: formData.birthDate || '2004-01-01',
          address: formData.address || 'Nairobi',
          programApplied: formData.programApplied || 'CNA',
          kcseGrade: formData.kcseGrade || 'B-',
          applicationDate: new Date().toISOString().split('T')[0],
          status: 'new'
        };
        setAppState((prev: any) => ({ ...prev, applicants: [item, ...prev.applicants] }));
        triggerToast('Applicant Registered Successfully!');
      } else {
        setAppState((prev: any) => ({
          ...prev,
          applicants: prev.applicants.map((a: Applicant) => a.id === selectedItemId ? { ...a, ...formData } : a)
        }));
        triggerToast('Applicant Entry Updated Successfully!');
      }
    } 

    else if (modalType === 'edit_acceptance') {
      setAppState((prev: any) => ({
        ...prev,
        acceptances: prev.acceptances.map((acc: Acceptance) =>
          acc.id === selectedItemId
            ? {
                ...acc,
                ...formData,
                signedAcceptanceLetterUrl: formData.signedAcceptanceLetterUrl || acc.signedAcceptanceLetterUrl || acc.acceptanceLetterUrl,
                status: formData.status || acc.status
              }
            : acc
        )
      }));
      triggerToast('Signed acceptance letter PDF reference saved to documents register.');
    }

    else if (modalType === 'edit_onboarding') {
      setAppState((prev: any) => ({
        ...prev,
        onboardings: prev.onboardings.map((o: Onboarding) =>
          o.id === selectedItemId
            ? {
                ...o,
                ...formData,
                assignedClass: formData.assignedCohort || o.assignedCohort,
                documentStatus: {
                  ...o.documentStatus,
                  idUploaded: Boolean(formData.documentUrls?.nationalId || formData.nationalIdUrl || o.documentStatus.idUploaded),
                  certificatesUploaded: Boolean(formData.documentUrls?.kcseCertificate || formData.kcseCertificateUrl || o.documentStatus.certificatesUploaded),
                  kcpeUploaded: Boolean(formData.documentUrls?.kcpeCertificate || formData.kcpeCertificateUrl || o.documentStatus.kcpeUploaded),
                  photoUploaded: o.documentStatus.photoUploaded
                },
                documentUrls: {
                  ...o.documentUrls,
                  nationalId: formData.nationalIdUrl || o.documentUrls?.nationalId || '',
                  kcseCertificate: formData.kcseCertificateUrl || o.documentUrls?.kcseCertificate || '',
                  kcpeCertificate: formData.kcpeCertificateUrl || o.documentUrls?.kcpeCertificate || ''
                }
              }
            : o
        )
      }));
      triggerToast('Clinical onboarding documents saved: National ID, KCSE and KCPE.');
    }
    
    else if (modalType === 'add_program' || modalType === 'edit_program') {
      if (modalType === 'add_program') {
        const item: Program = {
          code: formData.code.toUpperCase(),
          name: formData.name,
          initials: formData.initials.toUpperCase() || formData.code.toUpperCase(),
          duration: Number(formData.duration) || 3,
          status: 'Active',
          description: formData.description || ''
        };
        setAppState((prev: any) => ({ ...prev, programs: [...prev.programs, item] }));
        triggerToast('New Academic Program Initiated!');
      } else {
        setAppState((prev: any) => ({
          ...prev,
          programs: prev.programs.map((p: Program) => p.code === selectedItemId ? { ...p, ...formData } : p)
        }));
        triggerToast('Academic Program Modified!');
      }
    }

    else if (modalType === 'add_module' || modalType === 'edit_module') {
      if (modalType === 'add_module') {
        const item: Module = {
          code: formData.code.toUpperCase(),
          name: formData.name,
          programCode: formData.programCode || 'CNA'
        };
        setAppState((prev: any) => ({ ...prev, modules: [...prev.modules, item] }));
        triggerToast('Module mapped under curriculum tree!');
      } else {
        setAppState((prev: any) => ({
          ...prev,
          modules: prev.modules.map((m: Module) => m.code === selectedItemId ? { ...m, ...formData } : m)
        }));
        triggerToast('Curriculum Module record edited.');
      }
    }

    else if (modalType === 'add_class' || modalType === 'edit_class') {
      if (modalType === 'add_class') {
        const item: Class = {
          name: formData.name,
          cohortName: formData.cohortName || 'CNA-01',
          programCode: formData.programCode || 'CNA',
          moduleCode: formData.moduleCode || modulesForProgram(formData.programCode || 'CNA')[0]?.code,
          roomNumber: formData.roomNumber || 'Room-102',
          scheduleTime: formData.scheduleTime || '09:00 AM - 12:00 PM',
          scheduleDays: typeof formData.scheduleDays === 'string' ? formData.scheduleDays.split(',') : ['Monday', 'Wednesday'],
          capacity: Number(formData.capacity) || 30
        };
        setAppState((prev: any) => ({ ...prev, classes: [...prev.classes, item] }));
        triggerToast('Lecturer classroom schedule created!');
      } else {
        const updatedClass: Class = {
          ...formData,
          moduleCode: formData.moduleCode || modulesForProgram(formData.programCode)[0]?.code,
          scheduleDays: typeof formData.scheduleDays === 'string' ? formData.scheduleDays.split(',') : (formData.scheduleDays || []),
          capacity: Number(formData.capacity) || 30
        };
        setAppState((prev: any) => ({
          ...prev,
          classes: prev.classes.map((c: Class) => c.name === selectedItemId ? updatedClass : c)
        }));
        triggerToast('Classroom timetable schedule modified.');
      }
    }

    else if (modalType === 'add_cohort' || modalType === 'edit_cohort') {
      if (modalType === 'add_cohort') {
        // Auto increments cohort e.g. CNA-02
        const codeInit = formData.programCode || 'CNA';
        const cohortCount = state.cohorts.filter(c => c.programCode === codeInit).length + 1;
        const autoName = `${codeInit}-${cohortCount < 10 ? '0' + cohortCount : cohortCount}`;
        
        const item: Cohort = {
          name: autoName,
          programCode: codeInit,
          startDate: formData.startDate || '2026-09-01',
          endDate: formData.endDate || '2027-06-30',
          academicYear: formData.academicYear || '2026'
        };
        setAppState((prev: any) => ({ ...prev, cohorts: [...prev.cohorts, item] }));
        triggerToast(`Auto-Generated New Cohort: ${autoName}!`);
      } else {
        setAppState((prev: any) => ({
          ...prev,
          cohorts: prev.cohorts.map((c: Cohort) => c.name === selectedItemId ? { ...c, ...formData } : c)
        }));
        triggerToast('Cohort dates updated.');
      }
    }

    else if (modalType === 'add_lecturer' || modalType === 'edit_lecturer') {
      if (modalType === 'add_lecturer') {
        const item: Lecturer = {
          id: 'LEC_' + Math.floor(Math.random() * 10000),
          name: formData.name,
          employeeId: `RHIT-L${state.lecturers.length + 1}`,
          specialization: formData.specialization || 'Clinical Instructor',
          email: formData.email || '',
          assignedModuleCodes: Array.isArray(formData.assignedModuleCodes)
            ? formData.assignedModuleCodes
            : typeof formData.assignedModuleCodes === 'string'
              ? formData.assignedModuleCodes.split(',').map((code: string) => code.trim()).filter(Boolean)
              : []
        };
        setAppState((prev: any) => ({ ...prev, lecturers: [...prev.lecturers, item] }));
        triggerToast('Lecturer Profile Initiated.');
      } else {
        setAppState((prev: any) => ({
          ...prev,
          lecturers: prev.lecturers.map((l: Lecturer) => l.id === selectedItemId ? { ...l, ...formData } : l)
        }));
        triggerToast('Lecturer details updated.');
      }
    }

    else if (modalType === 'add_exam' || modalType === 'edit_exam') {
      if (modalType === 'add_exam') {
        const item: Exam = {
          id: 'EXM_' + Math.floor(Math.random() * 10000),
          name: formData.name,
          moduleCode: formData.moduleCode || 'MOD-CDA-01',
          examType: formData.examType || 'Final Exam',
          className: formData.cohortName || formData.className || 'CDA-01',
          cohortName: formData.cohortName || formData.className || 'CDA-01',
          date: formData.date || '2026-06-20',
          time: formData.time || '09:00 - 12:00',
          venue: formData.venue || 'Exam Hall A',
          totalMarks: Number(formData.totalMarks) || 100
        };
        setAppState((prev: any) => ({ ...prev, exams: [...prev.exams, item] }));
        triggerToast('Assessment Scheduled successfully!');
      } else {
        setAppState((prev: any) => ({
          ...prev,
          exams: prev.exams.map((ex: Exam) => ex.id === selectedItemId ? { ...ex, ...formData } : ex)
        }));
        triggerToast('Exam settings saved.');
      }
    }

    else if (modalType === 'add_result' || modalType === 'edit_result') {
      // Auto Grade calculation from marks
      const marks = Number(formData.marks) || 0;
      const examObj = state.exams.find((exam) => exam.id === formData.examId);
      const examType = examObj?.examType || getExamType(formData.examId);
      const totalMarks = Number(examObj?.totalMarks || 100);
      const normalizedMarks = totalMarks > 0 ? (marks / totalMarks) * 100 : marks;
      const grade = gradeFromMarks(normalizedMarks, examType);
      const statusVal = statusFromMarks(normalizedMarks, examType);

      if (modalType === 'add_result') {
        const studentObj = state.onboardings.find(o => o.id === formData.studentId);
        const item: ExamResult = {
          id: 'RES_' + Math.floor(Math.random() * 10000),
          studentId: formData.studentId || '',
          studentRegNumber: studentObj?.registrationNumber || '',
          studentName: studentObj?.studentName || '',
          moduleCode: formData.moduleCode || 'MOD-CDA-01',
          examId: formData.examId || '',
          marks,
          grade,
          comments: formData.comments || 'Evaluated standard modulework.',
          status: statusVal
        };
        setAppState((prev: any) => ({ ...prev, examResults: [...prev.examResults, item] }));
        triggerToast('Student Grade Card Recorded!');
      } else {
        setAppState((prev: any) => ({
          ...prev,
          examResults: prev.examResults.map((r: ExamResult) => r.id === selectedItemId ? { ...r, ...formData, grade, status: statusVal } : r)
        }));
        triggerToast('Result grading recalculated and updated!');
      }
    }

    else if (modalType === 'edit_grade_rules') {
      const nextRules: GradeRule[] = [
        { grade: 'A', min: Number(formData.aMin) || 80, max: 101, status: 'Pass', honour: 'First Class' },
        { grade: 'B', min: Number(formData.bMin) || 70, max: Number(formData.aMin) || 80, status: 'Pass', honour: 'Second Class Upper' },
        { grade: 'C', min: Number(formData.cMin) || 50, max: Number(formData.bMin) || 70, status: 'Pass', honour: 'Second Class Lower' },
        { grade: 'D', min: Number(formData.dMin) || 40, max: Number(formData.cMin) || 50, status: 'Pass', honour: 'Pass' },
        { grade: 'E', min: 0, max: Number(formData.dMin) || 40, status: 'Fail', honour: 'Fail' }
      ];
      setGradeRules(nextRules);
      triggerToast('Final exam grading and graduation honour rules updated.');
    }

    else if (modalType === 'add_fee_structure') {
      const item: CourseFee = {
        id: 'CF_' + Math.floor(Math.random() * 10000),
        programCode: formData.programCode || 'CNA',
        feeAmount: Number(formData.feeAmount) || 20000,
        academicYear: formData.academicYear || '2026'
      };
      setAppState((prev: any) => ({ ...prev, courseFees: [...prev.courseFees, item] }));
      triggerToast('Tuition Ledger Fee configuration set.');
    }

    else if (modalType === 'add_invoice') {
      const studentObj = state.onboardings.find(o => o.id === formData.studentId);
      const programFeesTotal = state.courseFees
        .filter(cf => cf.programCode === studentObj?.programCode)
        .reduce((sum, cf) => sum + cf.feeAmount, 0) || 45000;

      const item: Invoice = {
        id: 'INV_' + Math.floor(Math.random() * 10000),
        invoiceNumber: 'INV/MNT/' + Math.floor(1000 + Math.random() * 9000),
        studentId: formData.studentId || '',
        studentRegNumber: studentObj?.registrationNumber || '',
        studentName: studentObj?.studentName || '',
        programCode: studentObj?.programCode || 'CNA',
        amount: programFeesTotal,
        dueDate: formData.dueDate || '2026-07-31',
        status: 'pending'
      };
      setAppState((prev: any) => ({ ...prev, invoices: [...prev.invoices, item] }));
      triggerToast('Invoice processed!');
    }

    else if (modalType === 'add_room' || modalType === 'edit_room') {
      if (modalType === 'add_room') {
        const item: Room = {
          roomNumber: formData.roomNumber,
          type: formData.type || 'classroom',
          capacity: Number(formData.capacity) || 40,
          status: 'available',
          facilities: typeof formData.facilities === 'string' ? formData.facilities.split(',') : ['Smart Board'],
          hostelFee: formData.type === 'hostel' ? Number(formData.hostelFee) || 3000 : undefined
        };
        setAppState((prev: any) => ({ ...prev, rooms: [...prev.rooms, item] }));
        triggerToast('New Property Resource Registered!');
      } else {
        setAppState((prev: any) => ({
          ...prev,
          rooms: prev.rooms.map((r: Room) => r.roomNumber === selectedItemId ? { ...r, ...formData } : r)
        }));
        triggerToast('Property resource modified.');
      }
    }

    else if (modalType === 'approve_hostel_booking') {
      if (!formData.transactionCode || !formData.bankTransactionCode) {
        triggerToast('Approval failed. Transaction code and bank transaction code are required.', 'error');
        return;
      }
      approveHostelBooking(selectedItemId || formData.id, formData.transactionCode, formData.bankTransactionCode);
    }

    else if (modalType === 'add_material') {
      const item: LearningMaterial = {
        id: 'MAT_' + Math.floor(Math.random() * 10000),
        title: formData.title || 'Study Material',
        moduleCode: formData.moduleCode || state.modules[0]?.code || '',
        materialType: formData.materialType || 'PDF',
        uploadedBy: formData.uploadedBy || 'Admin',
        uploadDate: new Date().toISOString().split('T')[0],
        fileUrl: formData.fileUrl || '#'
      };
      setAppState((prev: any) => ({ ...prev, learningMaterials: [item, ...prev.learningMaterials] }));
      triggerToast('Study material assigned successfully.');
    }

    else if (modalType === 'add_rotation') {
      const studentObj = state.onboardings.find((o) => o.id === formData.studentId);
      const item: MedicalAttachment = {
        id: 'ROT_' + Math.floor(Math.random() * 10000),
        studentId: formData.studentId || '',
        studentName: studentObj?.studentName || '',
        studentRegNumber: studentObj?.registrationNumber || '',
        facilityName: formData.facilityName || '',
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        endDate: formData.endDate || new Date().toISOString().split('T')[0],
        supervisor: formData.supervisor || '',
        status: formData.status || 'pending'
      };
      setAppState((prev: any) => ({ ...prev, medicalAttachments: [item, ...prev.medicalAttachments] }));
      triggerToast('Medical rotation assigned successfully.');
    }

    else if (modalType === 'add_assignment' || modalType === 'edit_assignment') {
      if (modalType === 'add_assignment') {
        const studentObj = state.onboardings.find(o => o.id === formData.studentId);
        const item: StudentCourseAssignment = {
          id: 'ASG_' + Math.floor(Math.random() * 10000),
          studentId: formData.studentId || '',
          studentName: studentObj ? studentObj.studentName : '',
          registrationNumber: studentObj ? studentObj.registrationNumber : '',
          programCode: studentObj ? studentObj.programCode : '',
          cohort: formData.cohort || 'CNA-01',
          className: formData.cohort || 'CNA-01',
          assignedModulesCode: Array.isArray(formData.assignedModulesCode) ? formData.assignedModulesCode : [],
          status: formData.status || 'active'
        };
        setAppState((prev: any) => ({ ...prev, studentAssignments: [item, ...prev.studentAssignments] }));
        triggerToast('Student module assignment recorded successfully!');
      } else {
        setAppState((prev: any) => ({
          ...prev,
          studentAssignments: prev.studentAssignments.map((a: StudentCourseAssignment) => 
            a.id === selectedItemId ? { ...a, ...formData } : a
          )
        }));
        triggerToast('Student module assignment updated successfully!');
      }
    }
    
    // Clear and close
    setIsModalOpen(false);
  };

  // Bulk student ID generator / assign rules
  const triggerBulkAssignIDs = () => {
    setAppState((prev: any) => {
      // Only assign to onboarded students who don't have ID assignments or have overallStatus completed
      const updatedOnboards = prev.onboardings.map((o: Onboarding) => {
        return o;
      });
      return { ...prev, onboardings: updatedOnboards };
    });
    triggerToast('Bulk Assigned Plastic NFC Student IDs for all current Onboarded students!');
  };

  // Departments clearance markers
  const toggleClearanceDept = (studentId: string, department: 'library' | 'finance' | 'academic' | 'accommodation') => {
    setAppState((prev: any) => {
      return {
        ...prev,
        departmentClearances: prev.departmentClearances.map((dc: DepartmentClearance) => {
          if (dc.studentId === studentId) {
            let updated: any = { ...dc };
            if (department === 'library') {
              updated.libraryCleared = !dc.libraryCleared;
              updated.libraryComments = updated.libraryCleared ? 'Cleared via Librarica' : 'Overdue manuals pending return';
            }
            if (department === 'finance') {
              updated.financeCleared = !dc.financeCleared;
              updated.financeComments = updated.financeCleared ? 'Full audit complete' : 'Sub-tuition balance outstanding';
            }
            if (department === 'academic') {
              updated.academicCleared = !dc.academicCleared;
              updated.academicComments = updated.academicCleared ? 'Clinical logs verified' : 'Missed clinical attachment review';
            }
            if (department === 'accommodation') {
              updated.accommodationCleared = !dc.accommodationCleared;
              updated.accommodationComments = updated.accommodationCleared ? 'Hostel checkout approved' : 'Hostel checkout keys pending';
            }
            
            // Re-calculate overall
            updated.overallStatus = (updated.libraryCleared && updated.financeCleared && updated.academicCleared && updated.accommodationCleared) 
              ? 'cleared' : 'pending';
              
            return updated;
          }
          return dc;
        })
      };
    });
    triggerToast('Department Clearance status verified!');
  };

  // Graduation process uses the RHTI letter-grade honours mapping.
  const promoteToGraduation = (studentId: string) => {
    const studentObj = state.onboardings.find(o => o.id === studentId);
    if (!studentObj) return;

    const results = state.examResults.filter(r => r.studentId === studentId);
    const finalResults = results.filter((result) => getExamType(result.examId) !== 'CAT');
    const bestGrade = finalResults.map((result) => result.grade).sort()[0] || 'D';
    const gradClass = graduationClassFromGrade(bestGrade);

    const item: Graduation = {
      studentId,
      studentRegNumber: studentObj.registrationNumber,
      studentName: studentObj.studentName,
      programCode: studentObj.programCode,
      gpa: 0,
      graduationClass: gradClass,
      overallStatus: gradClass === 'Fail' ? 'failed' : 'passed',
      graduationDate: '2026-11-20',
      certificateNumber: 'RHIT-CERT-' + Math.floor(10000 + Math.random() * 90000)
    };

    setAppState((prev: any) => {
      // Remove any existing graduation record for this student
      const remaining = prev.graduations.filter((g: Graduation) => g.studentId !== studentId);
      return {
        ...prev,
        graduations: [...remaining, item]
      };
    });

    triggerToast(`Graduated ${studentObj.studentName} with ${gradClass}. Certificate assigned.`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#f8f8f0] text-[#2C3E50] font-sans antialiased p-2 md:p-6 select-none">
      
      {/* Dynamic Toast feedback */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-5 right-5 z-50 min-w-[280px] max-w-md rounded-lg border bg-white px-4 py-3 text-xs font-bold shadow-2xl flex items-start gap-3 ${
              toast.type === 'success' ? 'border-emerald-200 text-emerald-900' : 'border-rose-200 text-rose-900'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> : <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />}
            <span className="leading-relaxed">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CENTRAL PLATFORM WRAPPER PAGE */}
      <div className="school-portal-shell max-w-7xl mx-auto bg-white border border-[#BDC3C7] shadow-xl rounded-md overflow-hidden flex flex-col p-4 md:p-8 space-y-4">
        
        {/* LOGO & HEADING SECTION - RHTI portal header */}
        <div className="flex items-center justify-start border-b border-zinc-200 pb-3">
          <div className="flex items-center justify-start">
            <img 
              src="/logo/rhti-logo.png" 
              alt="Radiant Hospital Training Institute Logo" 
              className="h-14 object-contain"
            />
          </div>
        </div>

        {/* RECTANGULAR FOLDER TABS - MATCHES SCREENTSHOT TAB STYLING PRODUCING BULLET ACCENTS */}
        <div className="flex flex-wrap gap-0.5 mt-2 border-b border-[#7E8B92] pb-[1px]">
          {[
            { id: 'home', label: 'Admin Dashboard' },
            { id: 'registration', label: 'Registration' },
            { id: 'academics', label: 'Academics Control' },
            { id: 'finance', label: 'Finance & Ledgers' },
            { id: 'students', label: 'Student Portals' },
            { id: 'graduation', label: 'Graduation Audits' },
            { id: 'grading', label: 'Grading Rules' },
            { id: 'resources', label: 'Resources Panel' },
            { id: 'users', label: 'Users' },
            { id: 'inquiries', label: 'Inquiries' },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs font-bold uppercase transition-all whitespace-nowrap outline-none ${
                  isSelected 
                    ? 'bg-primary text-white border-t border-x border-primary rounded-t' 
                    : 'bg-dark/85 hover:bg-primary text-white rounded-t border-t border-x border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
          <button
            onClick={onLogout || (() => { window.location.href = '/login'; })}
            className="ml-auto px-2.5 py-1 text-[10px] font-bold uppercase transition-all whitespace-nowrap outline-none bg-[#E74C3C] hover:bg-[#C0392B] text-white rounded-t border-t border-x border-transparent flex items-center gap-1"
            title="Logout session"
          >
            <LogOut className="h-3 w-3" />
            Logout
          </button>
        </div>

        {/* SUB-TAB NAVIGATIONAL BAR STRIP - MATCHES BLUE ACCENTS FROM THE SCREENSHOT */}
        <div className="bg-primary/10 border-b border-primary/30 px-4 py-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-slate-900 font-medium select-none shadow-sm rounded-b">
          
          {activeTab === 'home' && (
            <span className="font-bold text-primary underline underline-offset-2">• Operations Overview</span>
          )}

          {activeTab === 'registration' && (
            <>
              <span className={`cursor-pointer ${getSubTab('registration') === 'applications' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('registration', 'applications')}>• Applications Inbox</span>
              <span className={`cursor-pointer ${getSubTab('registration') === 'acceptances' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('registration', 'acceptances')}>• Acceptances Register</span>
              <span className={`cursor-pointer ${getSubTab('registration') === 'onboardings' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('registration', 'onboardings')}>• Clinical Onboarding file</span>
            </>
          )}

          {activeTab === 'academics' && (
            <>
              <span className={`cursor-pointer ${getSubTab('academics') === 'programs' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('academics', 'programs')}>• Programs</span>
              <span className={`cursor-pointer ${getSubTab('academics') === 'modules' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('academics', 'modules')}>• Modules</span>
              <span className={`cursor-pointer ${getSubTab('academics') === 'classes' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('academics', 'classes')}>• Module Timetables</span>
              <span className={`cursor-pointer ${getSubTab('academics') === 'cohorts' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('academics', 'cohorts')}>• Cohorts</span>
              <span className={`cursor-pointer ${getSubTab('academics') === 'lecturers' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('academics', 'lecturers')}>• Lecturers</span>
              <span className={`cursor-pointer ${getSubTab('academics') === 'exams' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('academics', 'exams')}>• Exams schedules</span>
              <span className={`cursor-pointer ${getSubTab('academics') === 'results' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('academics', 'results')}>• Published Results</span>
            </>
          )}

          {activeTab === 'finance' && (
            <>
              <span className={`cursor-pointer ${getSubTab('finance') === 'fees' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('finance', 'fees')}>• Tuition fee structures</span>
              <span className={`cursor-pointer ${getSubTab('finance') === 'invoices' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('finance', 'invoices')}>• Invoice records</span>
              <span className={`cursor-pointer ${getSubTab('finance') === 'payments' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('finance', 'payments')}>• Payment Ledgers</span>
            </>
          )}

          {activeTab === 'students' && (
            <>
              <span className={`cursor-pointer ${getSubTab('students') === 'id-management' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('students', 'id-management')}>• Student ID badge management</span>
              <span className={`cursor-pointer ${getSubTab('students') === 'module-assignments' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('students', 'module-assignments')}>• Assigned units</span>
            </>
          )}

          {activeTab === 'graduation' && (
            <>
              <span className={`cursor-pointer ${getSubTab('graduation') === 'clearance' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('graduation', 'clearance')}>• Clearance office desks</span>
              <span className={`cursor-pointer ${getSubTab('graduation') === 'graduations' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('graduation', 'graduations')}>• Graduation candidate lists</span>
            </>
          )}

          {activeTab === 'grading' && (
            <span className="font-bold text-primary underline underline-offset-2">• Final Exam Grades & Graduation Honours</span>
          )}

          {activeTab === 'resources' && (
            <>
              <span className={`cursor-pointer ${getSubTab('resources') === 'rooms' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('resources', 'rooms')}>• Create Rooms</span>
              <span className={`cursor-pointer ${getSubTab('resources') === 'room-approvals' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('resources', 'room-approvals')}>• Room Approvals</span>
              <span className={`cursor-pointer ${getSubTab('resources') === 'materials' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('resources', 'materials')}>• Study materials</span>
              <span className={`cursor-pointer ${getSubTab('resources') === 'medical-attachments' ? 'font-bold text-primary underline underline-offset-2' : 'hover:underline text-primary'}`} onClick={() => setSubTab('resources', 'medical-attachments')}>• Medical Clinical rotations</span>
            </>
          )}

          {activeTab === 'users' && (
            <span className="font-bold text-primary underline underline-offset-2">• User Accounts & Password Reset</span>
          )}

          {activeTab === 'inquiries' && (
            <span className="font-bold text-primary underline underline-offset-2">• Student Inquiries Response Desk</span>
          )}

        </div>

        {/* CORE WORKSPACE INNER CONTENT BOX */}
        <div className="bg-[#FFFFFF] p-2 md:p-6 border border-[#BDC3C7] rounded mt-2 min-h-[500px]">
          
          {/* Subtab Title Info Banner */}
          <div className="bg-[#EDF2F7] border border-[#BDC3C7] p-2.5 px-4 mb-6 flex justify-between items-center text-[10px] text-slate-700 font-bold uppercase tracking-wider font-mono">
            <span>Core Workspace Module: {activeTab === 'home' ? 'Academic Dashboard Overview' : `${activeTab} registers panel`}</span>
            <span>Intake: June 2026</span>
          </div>

          <div className="w-full">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-zinc-900 mb-1">Urgent Institutional Overview</h3>
              <p className="text-xs text-zinc-500 mb-5">Operational tables for records that need administrator action.</p>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Students By Program</h4>
                  <table className="w-full border-collapse border border-zinc-300 text-xs text-left">
                    <thead className="bg-primary text-white">
                      <tr>
                        <th className="border border-primary/40 p-2">Program</th>
                        <th className="border border-primary/40 p-2">Total Students</th>
                        <th className="border border-primary/40 p-2">Active Cohorts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.programs.map((program) => (
                        <tr key={program.code} className="hover:bg-zinc-50">
                          <td className="border border-zinc-300 p-2 font-bold">{program.name}</td>
                          <td className="border border-zinc-300 p-2 font-mono">{state.onboardings.filter((student) => student.programCode === program.code).length}</td>
                          <td className="border border-zinc-300 p-2 font-mono">{state.cohorts.filter((cohort) => cohort.programCode === program.code).length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Applications Pending Action</h4>
                  <table className="w-full border-collapse border border-zinc-300 text-xs text-left">
                    <thead className="bg-primary text-white">
                      <tr>
                        <th className="border border-primary/40 p-2">Applicant</th>
                        <th className="border border-primary/40 p-2">Program</th>
                        <th className="border border-primary/40 p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.applicants.filter((applicant) => !['accepted', 'rejected'].includes(applicant.status)).slice(0, 6).map((applicant) => (
                        <tr key={applicant.id} className="hover:bg-zinc-50">
                          <td className="border border-zinc-300 p-2 font-bold">{applicant.name}</td>
                          <td className="border border-zinc-300 p-2">{applicant.programApplied}</td>
                          <td className="border border-zinc-300 p-2">
                            <button
                              onClick={() => {
                                setActiveTab('registration');
                                setSubTab('registration', 'applications');
                              }}
                              className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800"
                            >
                              {applicant.status}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Acceptance Reminders</h4>
                  <table className="w-full border-collapse border border-zinc-300 text-xs text-left">
                    <thead className="bg-primary text-white">
                      <tr>
                        <th className="border border-primary/40 p-2">Applicant</th>
                        <th className="border border-primary/40 p-2">Program</th>
                        <th className="border border-primary/40 p-2">Required Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.acceptances.filter((acceptance) => acceptance.status !== 'onboarded').slice(0, 6).map((acceptance) => (
                        <tr key={acceptance.id} className="hover:bg-zinc-50">
                          <td className="border border-zinc-300 p-2 font-bold">{acceptance.applicantName}</td>
                          <td className="border border-zinc-300 p-2">{acceptance.programCode}</td>
                          <td className="border border-zinc-300 p-2">{acceptance.signedAcceptanceLetterUrl ? 'Send / onboard' : 'Upload signed letter'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Upcoming Exams Modulewise</h4>
                  <table className="w-full border-collapse border border-zinc-300 text-xs text-left">
                    <thead className="bg-primary text-white">
                      <tr>
                        <th className="border border-primary/40 p-2">Module</th>
                        <th className="border border-primary/40 p-2">Exam</th>
                        <th className="border border-primary/40 p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...state.exams].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6).map((exam) => (
                        <tr key={exam.id} className="hover:bg-zinc-50">
                          <td className="border border-zinc-300 p-2 font-bold">{exam.moduleCode}</td>
                          <td className="border border-zinc-300 p-2">{exam.name}</td>
                          <td className="border border-zinc-300 p-2 font-mono">{exam.date} {exam.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* REGISTRATION SUBTABS */}
        {activeTab === 'registration' && (
          <div className="space-y-6">
            
            {/* 1. APPLICATIONS */}
            {getSubTab('registration') === 'applications' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">Website Applications Registry</h3>
                    <p className="text-xs text-zinc-500 mt-1">Review secondary metrics and accept students into clinical portals.</p>
                  </div>
                </div>

                <DataTable<Applicant>
                  data={state.applicants}
                  idKey="id"
                  searchFilter={(item, q) => item.name.toLowerCase().includes(q) || item.email.toLowerCase().includes(q) || item.programApplied.toLowerCase().includes(q)}
                  searchPlaceholder="Search applicants..."
                  bulkActions={(selectedList) => (
                    <button
                      onClick={() => bulkAcceptApplicants(selectedList)}
                      className="bg-primary hover:bg-primary text-white px-2 py-1 rounded text-xs font-semibold transition"
                    >
                      Bulk Accept
                    </button>
                  )}
                  columns={[
                    { header: 'Applicant Name', accessor: (a) => <span className="font-semibold text-zinc-900">{a.name}</span>, sortKey: 'name' },
                    { header: 'Program Applied For', accessor: (a) => <span className="font-semibold text-zinc-800">{state.programs.find((p) => p.code.toLowerCase() === a.programApplied.toLowerCase())?.name || a.programApplied}</span>, sortKey: 'programApplied' },
                    { header: 'KCSE Grade', accessor: (a) => <span className="font-bold text-primary">{a.kcseGrade}</span>, sortKey: 'kcseGrade' },
                    { header: 'Status Flag', accessor: (a) => (
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.status === 'accepted' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                        a.status === 'rejected' ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {a.status.toUpperCase()}
                      </span>
                    ), sortKey: 'status' },
                    { header: 'Actions', accessor: (a) => (
                      <div className="flex items-center space-x-2">
                        {a.status !== 'accepted' && (
                          <button
                            onClick={() => updateApplicantStatus(a.id, 'accepted')}
                            className="text-xs font-bold text-emerald-600 hover:underline"
                            title="Accept Student"
                          >
                            Accept
                          </button>
                        )}
                        {a.status !== 'rejected' && (
                          <button
                            onClick={() => updateApplicantStatus(a.id, 'rejected')}
                            className="text-xs font-bold text-rose-600 hover:underline"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditModal('edit_applicant', 'Modify Application details', a, a.id)}
                          className="hover:text-zinc-900 text-zinc-400 transition"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRow('applicants', 'id', a.id, 'Applicant removed.')}
                          className="hover:text-rose-600 text-zinc-400 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  ]}
                />
              </div>
            )}

            {/* 2. ACCEPTANCE */}
            {getSubTab('registration') === 'acceptances' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 mb-2">Acceptance Registers Office</h3>
                  <p className="text-xs text-zinc-500 mb-6">Send legally validated acceptance letter pdf files and triggers student onboarding portals.</p>
                </div>

                <DataTable<Acceptance>
                  data={state.acceptances}
                  idKey="id"
                  searchFilter={(item, q) => item.applicantName.toLowerCase().includes(q) || item.email.toLowerCase().includes(q)}
                  columns={[
                    { header: 'Applicant Name', accessor: (acc) => <span className="font-semibold">{acc.applicantName}</span> },
                    { header: 'Email Register', accessor: (acc) => acc.email },
                    { header: 'Program Code', accessor: (acc) => acc.programCode },
                    { header: 'Letter Link', accessor: (acc) => (
                      <a href={acc.acceptanceLetterUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center space-x-1 font-semibold">
                        <FileText className="h-3.5 w-3.5" />
                        <span>Acceptance_Review.pdf</span>
                      </a>
                    )},
                    { header: 'Status Flag', accessor: (acc) => (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        acc.status === 'onboarded' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {acc.status.toUpperCase()}
                      </span>
                    )},
                    { header: 'Actions trigger', accessor: (acc) => (
                      <div className="flex space-x-3">
                        {acc.status === 'pending' && (
                          <button
                            onClick={() => sendAcceptanceLetter(acc.id)}
                            className="bg-primary hover:bg-primary text-white rounded px-2.5 py-1 text-[10px] font-bold"
                          >
                            Send letter via SMTP
                          </button>
                        )}
                        {acc.status === 'sent' && (
                          <button
                            onClick={() => processOnboarding(acc)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-2.5 py-1 text-[10px] font-bold"
                          >
                            Execute Onboarding
                          </button>
                        )}
                        {acc.status === 'onboarded' && (
                          <span className="text-[10px] text-zinc-400 italic">Fully Onboarded</span>
                        )}
                        <button
                          onClick={() => handleOpenEditModal('edit_acceptance', 'Upload Signed Acceptance Letter', acc, acc.id)}
                          className="hover:text-zinc-900 text-zinc-400 transition"
                          title="Edit acceptance and upload signed PDF"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  ]}
                />
              </div>
            )}

            {/* 3. ONBOARDING */}
            {getSubTab('registration') === 'onboardings' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 mb-2">Onboarded Student Matriculates</h3>
                  <p className="text-xs text-zinc-500 mb-6">Matriculate check logs and database user synchronized profiles.</p>
                </div>

                <DataTable<Onboarding>
                  data={state.onboardings}
                  idKey="id"
                  searchFilter={(item, q) => item.studentName.toLowerCase().includes(q) || item.registrationNumber.toLowerCase().includes(q)}
                  columns={[
                    { header: 'Student Name', accessor: (o) => <span className="font-bold text-zinc-900">{o.studentName}</span> },
                    { header: 'Registration Number', accessor: (o) => <span className="font-mono text-xs font-semibold text-primary">{o.registrationNumber}</span> },
                    { header: 'Program Code', accessor: (o) => o.programCode },
                    { header: 'Matric Date', accessor: (o) => o.onboardingDate },
                    { header: 'Onboarding Files Status', accessor: (o) => (
                      <div className="flex space-x-1.5 text-[9px] font-mono">
                        <span className={`px-1 rounded ${o.documentStatus.idUploaded ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-400'}`}>ID</span>
                        <span className={`px-1 rounded ${o.documentStatus.certificatesUploaded ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-400'}`}>KCSE</span>
                        <span className={`px-1 rounded ${o.documentStatus.kcpeUploaded ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-400'}`}>KCPE</span>
                      </div>
                    )},
                    { header: 'Action', accessor: (o) => (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenEditModal('edit_onboarding', 'Edit Clinical Onboarding File', o, o.id)}
                          className="hover:text-zinc-900 text-zinc-400 transition"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRow('onboardings', 'id', o.id, 'Onboard student de-matriculated.')}
                          className="hover:text-rose-600 text-zinc-400 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  ]}
                />
              </div>
            )}

          </div>
        )}

        {/* ACADEMICS SUBTABS */}
        {activeTab === 'academics' && (
          <div className="space-y-6">
            
            {/* Programs subtab */}
            {getSubTab('academics') === 'programs' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">Academic Programs Catalogue</h3>
                    <p className="text-xs text-zinc-500 mt-1">Defines structural codes, durations and initials utilized for reg formats.</p>
                  </div>
                  <button
                    onClick={() => handleOpenAddModal('add_program', 'Initiate New Academic Program', { code: '', name: '', duration: '3', initials: '', description: '' })}
                    className="bg-primary text-white rounded-xl px-4 py-2 text-xs font-semibold hover:bg-primary flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Initiate Program</span>
                  </button>
                </div>

                <DataTable<Program>
                  data={state.programs}
                  idKey="code"
                  searchFilter={(item, q) => item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q)}
                  columns={[
                    { header: 'Program Code', accessor: (p) => <span className="font-bold text-primary">{p.code}</span> },
                    { header: 'Program Title', accessor: (p) => <span className="font-semibold text-zinc-800">{p.name}</span> },
                    { header: 'Initials Register', accessor: (p) => p.initials },
                    { header: 'Duration', accessor: (p) => `${p.duration} Month${p.duration === 1 ? '' : 's'}` },
                    { header: 'Status', accessor: (p) => <span className="text-emerald-600 font-bold text-xs">{p.status}</span> },
                    { header: 'Actions', accessor: (p) => (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenEditModal('edit_program', 'Modify Academic Program Settings', p, p.code)}
                          className="text-zinc-400 hover:text-zinc-950 transition"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRow('programs', 'code', p.code, 'Academic Program deleted.')}
                          className="hover:text-rose-600 text-zinc-400 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  ]}
                />
              </div>
            )}

            {/* Modules subtab */}
            {getSubTab('academics') === 'modules' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">Academic Curriculum Modules catalogue</h3>
                    <p className="text-xs text-zinc-500 mt-1">Modules belong directly to a program in the Kenya short-module structure.</p>
                  </div>
                  <button
                    onClick={() => handleOpenAddModal('add_module', 'Add Curriculum Module', { code: '', name: '', programCode: 'CNA' })}
                    className="bg-primary text-white rounded-xl px-4 py-2 text-xs font-semibold hover:bg-primary flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Module</span>
                  </button>
                </div>

                <DataTable<Module>
                  data={state.modules}
                  idKey="code"
                  searchFilter={(item, q) => item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q)}
                  columns={[
                    { header: 'Module Code', accessor: (m) => <span className="font-bold text-primary">{m.code}</span> },
                    { header: 'Module Title', accessor: (m) => <span className="font-semibold text-zinc-800">{m.name}</span> },
                    { header: 'Program', accessor: (m) => m.programCode },
                    { header: 'Action', accessor: (m) => (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenEditModal('edit_module', 'Edit Curriculum Module', m, m.code)}
                          className="hover:text-zinc-950 text-zinc-400"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRow('modules', 'code', m.code, 'Curriculum Module deleted.')}
                          className="hover:text-rose-600 text-zinc-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  ]}
                />
              </div>
            )}

            {/* Classes timetable subtab */}
            {getSubTab('academics') === 'classes' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">Module Timetable Planner</h3>
                    <p className="text-xs text-zinc-500 mt-1">Maps each timetable to a target module and cohort.</p>
                  </div>
                  <button
                    onClick={() => handleOpenAddModal('add_class', 'Schedule Module Timetable', { name: '', cohortName: 'CNA-01', programCode: 'CNA', moduleCode: 'MOD-CNA-01', roomNumber: 'Room-102', scheduleTime: '09:00 AM - 12:00 PM', scheduleDays: 'Monday,Wednesday', capacity: '30' })}
                    className="bg-primary text-white rounded-xl px-4 py-2 text-xs font-semibold hover:bg-primary flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Schedule Timetable</span>
                  </button>
                </div>

                <DataTable<Class>
                  data={state.classes}
                  idKey="name"
                  searchFilter={(item, q) => item.name.toLowerCase().includes(q) || item.roomNumber.toLowerCase().includes(q)}
                  columns={[
                    { header: 'Timetable ID', accessor: (c) => <span className="font-bold">{c.name}</span> },
                    { header: 'Target Module', accessor: (c) => c.moduleCode || 'Not assigned' },
                    { header: 'Assigned Cohort', accessor: (c) => c.cohortName },
                    { header: 'Residency Room', accessor: (c) => c.roomNumber },
                    { header: 'Schedule Hours', accessor: (c) => c.scheduleTime },
                    { header: 'Time Slot Days', accessor: (c) => c.scheduleDays.join(', ') },
                    { header: 'Capacity', accessor: (c) => `${c.capacity} Students` },
                    { header: 'Action', accessor: (c) => (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenEditModal('edit_class', 'Modify timetabled classroom slot', c, c.name)}
                          className="hover:text-zinc-950 text-zinc-400"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRow('classes', 'name', c.name, 'Class timetable deleted.')}
                          className="hover:text-rose-600 text-zinc-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  ]}
                />
              </div>
            )}

            {/* Cohorts subtab */}
            {getSubTab('academics') === 'cohorts' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">Academic Cohorts Registry</h3>
                    <p className="text-xs text-zinc-500 mt-1">Cohorts names auto-increment on program initials.</p>
                  </div>
                  <button
                    onClick={() => handleOpenAddModal('add_cohort', 'Add Cohort group', { programCode: 'CNA', startDate: '2026-09-01', endDate: '2027-06-30', academicYear: '2026' })}
                    className="bg-primary text-white rounded-xl px-4 py-2 text-xs font-semibold hover:bg-primary flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Generate Cohort</span>
                  </button>
                </div>

                <DataTable<Cohort>
                  data={state.cohorts}
                  idKey="name"
                  searchFilter={(item, q) => item.name.toLowerCase().includes(q) || item.programCode.toLowerCase().includes(q)}
                  columns={[
                    { header: 'Cohort Identifier', accessor: (c) => <span className="font-bold text-primary">{c.name}</span> },
                    { header: 'Assigned Program', accessor: (c) => c.programCode },
                    { header: 'Launch Start', accessor: (c) => c.startDate },
                    { header: 'Term End Limit', accessor: (c) => c.endDate },
                    { header: 'Academic Year', accessor: (c) => c.academicYear },
                    { header: 'Action', accessor: (c) => (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenEditModal('edit_cohort', 'Edit Cohort range dates', c, c.name)}
                          className="hover:text-zinc-950 text-zinc-400 animate"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRow('cohorts', 'name', c.name, 'Cohort record removed.')}
                          className="hover:text-rose-600 text-zinc-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  ]}
                />
              </div>
            )}

            {/* Lecturers subtab */}
            {getSubTab('academics') === 'lecturers' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">Academic Lecturers Panel</h3>
                    <p className="text-xs text-zinc-500 mt-1">Create lecturers and assign the modules they teach.</p>
                  </div>
                  <button
                    onClick={() => handleOpenAddModal('add_lecturer', 'Register Lecturer Profile', { name: '', specialization: '', email: '', assignedModuleCodes: '' })}
                    className="bg-primary text-white rounded-xl px-4 py-2 text-xs font-semibold hover:bg-primary flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Register Lecturer</span>
                  </button>
                </div>

                <DataTable<Lecturer>
                  data={state.lecturers}
                  idKey="id"
                  searchFilter={(item, q) => item.name.toLowerCase().includes(q) || item.specialization.toLowerCase().includes(q)}
                  columns={[
                    { header: 'Lecturer Name', accessor: (l) => <span className="font-bold text-zinc-900">{l.name}</span> },
                    { header: 'Email Register', accessor: (l) => l.email },
                    { header: 'Syllabus Modules Link', accessor: (l) => (
                      <div className="flex flex-wrap gap-1">
                        {l.assignedModuleCodes.map((m, idx) => (
                          <span key={idx} className="bg-indigo-50 text-primary rounded px-1.5 py-0.5 text-[9px] font-mono">{m}</span>
                        ))}
                      </div>
                    )},
                    { header: 'Action', accessor: (l) => (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenEditModal('edit_lecturer', 'Edit Lecturer details', l, l.id)}
                          className="hover:text-zinc-950 text-zinc-400"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRow('lecturers', 'id', l.id, 'Lecturer deleted.')}
                          className="hover:text-rose-600 text-zinc-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  ]}
                />
              </div>
            )}

            {/* Exams subtab */}
            {getSubTab('academics') === 'exams' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">Assessment & Exams Scheduler</h3>
                    <p className="text-xs text-zinc-500 mt-1">Initialize Final Exam, CAT, or Assignment records for a module and cohort.</p>
                  </div>
                  <button
                    onClick={() => handleOpenAddModal('add_exam', 'Schedule Module Examination', { name: '', programCode: 'CDA', examType: 'Final Exam', moduleCode: 'MOD-CDA-01', cohortName: 'CDA-01', date: '2026-06-25', time: '09:00 - 12:00', venue: 'Exam Hall B', totalMarks: '100' })}
                    className="bg-primary text-white rounded-xl px-4 py-2 text-xs font-semibold hover:bg-primary flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Schedule Exam</span>
                  </button>
                </div>

                <DataTable<Exam>
                  data={state.exams}
                  idKey="id"
                  searchFilter={(item, q) => item.name.toLowerCase().includes(q) || item.moduleCode.toLowerCase().includes(q)}
                  columns={[
                    { header: 'Exam ID', accessor: (e) => <span className="font-mono text-xs">{e.id}</span> },
                    { header: 'Assessment Title', accessor: (e) => <span className="font-bold text-zinc-800">{e.name}</span> },
                    { header: 'Subject Module', accessor: (e) => e.moduleCode },
                    { header: 'Exam Type', accessor: (e) => e.examType || 'Final Exam' },
                    { header: 'Target Cohort', accessor: (e) => e.cohortName || e.className },
                    { header: 'Schedules', accessor: (e) => `${e.date} &bull; ${e.time}` },
                    { header: 'Exam Hall', accessor: (e) => e.venue },
                    { header: 'Total Score', accessor: (e) => `${e.totalMarks} Marks` },
                    { header: 'Action', accessor: (e) => (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenEditModal('edit_exam', 'Modify Exam Settings', e, e.id)}
                          className="hover:text-zinc-950 text-zinc-400"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRow('exams', 'id', e.id, 'Exam deleted.')}
                          className="hover:text-rose-600 text-zinc-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  ]}
                />
              </div>
            )}

            {/* Exam results subtab */}
            {getSubTab('academics') === 'results' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">Student Examination Grades Transcript</h3>
                    <p className="text-xs text-zinc-500 mt-1">Filter by module and edit each result row. CATs record marks without a graded letter.</p>
                  </div>
                  <select
                    className="border border-zinc-200 rounded-lg p-2 bg-white text-xs font-semibold"
                    value={formData.resultModuleFilter || ''}
                    onChange={(e) => setFormData({ ...formData, resultModuleFilter: e.target.value })}
                  >
                    <option value="">All Modules</option>
                    {state.modules.map((m) => <option key={m.code} value={m.code}>{m.name}</option>)}
                  </select>
                </div>

                <DataTable<ExamResult>
                  data={state.examResults.filter((result) => !formData.resultModuleFilter || result.moduleCode === formData.resultModuleFilter)}
                  idKey="id"
                  searchFilter={(item, q) => item.studentName.toLowerCase().includes(q) || item.studentRegNumber.toLowerCase().includes(q)}
                  columns={[
                    { header: 'Student Name', accessor: (r) => <span className="font-bold text-zinc-900">{r.studentName}</span> },
                    { header: 'Reg Number', accessor: (r) => <span className="font-mono text-xs text-primary">{r.studentRegNumber}</span> },
                    { header: 'Module', accessor: (r) => r.moduleCode },
                    { header: 'Marks Score', accessor: (r) => `${r.marks}%`, sortKey: 'marks' },
                    { header: 'Grade Metric', accessor: (r) => (
                      <span className={`h-6 w-6 inline-flex items-center justify-center rounded-full font-bold text-xs ${
                        r.grade === 'A' ? 'bg-emerald-50 text-emerald-800' : 'bg-indigo-50 text-indigo-800'
                      }`}>
                        {r.grade}
                      </span>
                    ), sortKey: 'grade' },
                    { header: 'Pass Flag', accessor: (r) => (
                      <span className={`px-1 rounded text-[10px] font-bold ${r.status === 'Pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {r.status}
                      </span>
                    ) },
                    { header: 'Feedback comments', accessor: (r) => <span className="text-zinc-500 italic max-w-[150px] truncate block">{r.comments}</span> },
                    { header: 'Action', accessor: (r) => (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenEditModal('edit_result', 'Edit Grade outcome entry', r, r.id)}
                          className="hover:text-zinc-950 text-zinc-400"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRow('examResults', 'id', r.id, 'Exam result deleted.')}
                          className="hover:text-rose-600 text-zinc-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  ]}
                />
              </div>
            )}

          </div>
        )}

        {/* FINANCE SUBTABS */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            
            {/* Fees structures info */}
            {getSubTab('finance') === 'fees' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">Tuition Fee structures Catalogues</h3>
                    <p className="text-xs text-zinc-500 mt-1">Set approved tuition ledger fees per individual Program curriculum.</p>
                  </div>
                  <button
                    onClick={() => handleOpenAddModal('add_fee_structure', 'Set Program Tuition approved fee', { programCode: 'CNA', feeAmount: '58000', academicYear: '2026' })}
                    className="bg-primary text-white rounded-xl px-4 py-2 text-xs font-semibold hover:bg-primary flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Configure Fee Structure</span>
                  </button>
                </div>

                <DataTable<CourseFee>
                  data={state.courseFees}
                  idKey="id"
                  searchFilter={(item, q) => item.programCode.toLowerCase().includes(q)}
                  columns={[
                    { header: 'Fee ID', accessor: (f) => <span className="font-mono text-xs">{f.id}</span> },
                    { header: 'Program Code', accessor: (f) => f.programCode },
                    { header: 'Program tuition amount', accessor: (f) => <span className="font-semibold text-zinc-900">Kes {f.feeAmount.toLocaleString()}</span>, sortKey: 'feeAmount' },
                    { header: 'Academic Year', accessor: (f) => f.academicYear },
                    { header: 'Action', accessor: (f) => (
                      <button
                        onClick={() => handleDeleteRow('courseFees', 'id', f.id, 'Fee structures configuration deleted.')}
                        className="hover:text-rose-600 text-zinc-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  ]}
                />
              </div>
            )}

            {/* Invoices */}
            {getSubTab('finance') === 'invoices' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">Matriculated Invoice Register</h3>
                    <p className="text-xs text-zinc-500 mt-1">Lists students current billing invoices, calculated on program fees.</p>
                  </div>
                  <button
                    onClick={() => handleOpenAddModal('add_invoice', 'Generate billing Invoice', { studentId: '', dueDate: '2026-07-31' })}
                    className="bg-primary text-white rounded-xl px-4 py-2 text-xs font-semibold hover:bg-primary flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Generate Invoice</span>
                  </button>
                </div>

                <DataTable<Invoice>
                  data={state.invoices}
                  idKey="id"
                  searchFilter={(item, q) => item.studentName.toLowerCase().includes(q) || item.invoiceNumber.toLowerCase().includes(q)}
                  columns={[
                    { header: 'Invoice Code', accessor: (inv) => <span className="font-mono font-semibold text-xs">{inv.invoiceNumber}</span> },
                    { header: 'Student Name', accessor: (inv) => <span className="font-bold">{inv.studentName}</span> },
                    { header: 'Reg Number', accessor: (inv) => <span className="font-mono text-primary text-xs">{inv.studentRegNumber}</span> },
                    { header: 'Program Code', accessor: (inv) => inv.programCode },
                    { header: 'Invoiced tuition', accessor: (inv) => <span className="font-bold">Kes {inv.amount.toLocaleString()}</span>, sortKey: 'amount' },
                    { header: 'Settlement Due', accessor: (inv) => inv.dueDate },
                    { header: 'Status Key', accessor: (inv) => (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                        {inv.status.toUpperCase()}
                      </span>
                    ), sortKey: 'status' },
                    { header: 'Action', accessor: (inv) => (
                      <button
                        onClick={() => handleDeleteRow('invoices', 'id', inv.id, 'Invoice record discarded.')}
                        className="hover:text-rose-600 text-zinc-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  ]}
                />
              </div>
            )}

            {/* Payments Ledger */}
            {getSubTab('finance') === 'payments' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 mb-1">Tuition Payment Ledger Audit</h3>
                  <p className="text-xs text-zinc-500 mb-6">Cleared receipts from student payment gateways.</p>
                </div>

                <DataTable<Payment>
                  data={state.payments}
                  idKey="id"
                  searchFilter={(item, q) => item.studentRegNumber.toLowerCase().includes(q) || item.receiptNumber.toLowerCase().includes(q)}
                  columns={[
                    { header: 'Receipt Code', accessor: (pay) => <span className="font-mono font-bold text-xs text-emerald-600">{pay.receiptNumber}</span> },
                    { header: 'Reg Number', accessor: (pay) => <span className="font-mono text-zinc-600 text-xs">{pay.studentRegNumber}</span> },
                    { header: 'Target Invoice', accessor: (pay) => pay.invoiceId },
                    { header: 'Paid currency', accessor: (pay) => <span className="font-bold text-zinc-900">Kes {pay.amountPaid.toLocaleString()}</span> },
                    { header: 'Transact Date', accessor: (pay) => pay.paymentDate },
                    { header: 'Channel Protocol', accessor: (pay) => pay.method },
                    { header: 'Audit Status', accessor: (pay) => <span className="text-emerald-600 font-bold text-[10px]">{pay.status.toUpperCase()}</span> },
                    { header: 'Action', accessor: (pay) => (
                      <button
                        onClick={() => handleDeleteRow('payments', 'id', pay.id, 'Payment ledger entry voided.')}
                        className="hover:text-rose-600 text-zinc-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  ]}
                />
              </div>
            )}

          </div>
        )}

        {/* STUDENTS SUBTABS */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            
            {/* Student ID cards subtab */}
            {getSubTab('students') === 'id-management' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">Plastics NFC ID Cards Management</h3>
                    <p className="text-xs text-zinc-500 mt-1">Assign unique, contact-less proximity IDs to onboarded students.</p>
                  </div>
                  <button
                    onClick={triggerBulkAssignIDs}
                    className="bg-primary hover:bg-primary text-white rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition"
                  >
                    Bulk Generate PlastIDs
                  </button>
                </div>

                <DataTable<Onboarding>
                  data={state.onboardings}
                  idKey="id"
                  searchFilter={(item, q) => item.studentName.toLowerCase().includes(q) || item.registrationNumber.toLowerCase().includes(q)}
                  columns={[
                    { header: 'Onboarded Student', accessor: (o) => <span className="font-bold text-zinc-900">{o.studentName}</span> },
                    { header: 'Reg Number', accessor: (o) => <span className="font-mono text-xs font-semibold text-primary">{o.registrationNumber}</span> },
                    { header: 'Degree Program', accessor: (o) => o.programCode },
                    { header: 'NFC Badge ID status', accessor: (o) => (
                      <span className="bg-emerald-50 text-emerald-800 rounded px-2.5 py-0.5 text-[10px] font-bold">
                        ASSIGNED &bull; NFC-ACTIVE
                      </span>
                    )},
                    { header: 'Physical ID Number', accessor: (o) => <span className="text-xs font-mono font-bold text-zinc-600">RHIT-ID-{o.registrationNumber.split('/')[2]}</span> }
                  ]}
                />
              </div>
            )}

            {/* Module assignments catalog */}
            {getSubTab('students') === 'module-assignments' && (() => {
              const unifiedAssignmentsData = state.onboardings.map(o => {
                const asg = state.studentAssignments.find(a => a.studentId === o.id);
                if (asg) {
                  return {
                    onboardingId: o.id,
                    studentName: o.studentName,
                    registrationNumber: o.registrationNumber,
                    programCode: o.programCode,
                    assignmentId: asg.id,
                    cohort: asg.cohort,
                    className: asg.className,
                    assignedModulesCode: asg.assignedModulesCode,
                    status: asg.status
                  };
                } else {
                  return {
                    onboardingId: o.id,
                    studentName: o.studentName,
                    registrationNumber: o.registrationNumber,
                    programCode: o.programCode,
                    cohort: 'Not Assigned',
                    className: 'Not Assigned',
                    assignedModulesCode: [],
                    status: 'not_assigned' as const
                  };
                }
              });

              return (
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 mb-1">Matriculated Syllabus & Syllabus enrollments</h3>
                      <p className="text-xs text-zinc-500">Monitored active credit limits per cohort student groups.</p>
                    </div>
                  </div>

                  <DataTable<any>
                    data={unifiedAssignmentsData}
                    idKey="onboardingId"
                    searchFilter={(item, q) => item.studentName.toLowerCase().includes(q) || item.registrationNumber.toLowerCase().includes(q)}
                    columns={[
                      { header: 'Student Matriculate', accessor: (row) => <span className="font-bold text-zinc-900">{row.studentName}</span> },
                      { header: 'Registration code', accessor: (row) => <span className="font-mono text-zinc-500 text-xs font-semibold">{row.registrationNumber}</span> },
                      { header: 'Assigned Cohort', accessor: (row) => (
                        <span className={row.status === 'not_assigned' ? 'text-zinc-400 italic text-xs' : 'font-semibold text-zinc-800'}>
                          {row.cohort}
                        </span>
                      )},
                      { header: 'Enrolled Modules Curriculum', accessor: (row) => (
                        row.status === 'not_assigned' ? (
                          <span className="text-zinc-400 italic text-xs">-</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {row.assignedModulesCode.map((m: string, idx: number) => (
                              <span key={idx} className="bg-zinc-100 text-zinc-600 font-mono text-[9px] px-1 rounded">{m}</span>
                            ))}
                          </div>
                        )
                      )},
                      { header: 'Status Flag', accessor: (row) => (
                        row.status === 'not_assigned' ? (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 rounded px-2.5 py-0.5 text-[10px] font-bold inline-block">
                            PENDING / NOT ASSIGNED
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded px-2.5 py-0.5 text-[10px] font-bold inline-block">
                            {row.status.toUpperCase()}
                          </span>
                        )
                      )},
                      { header: 'Actions', accessor: (row) => (
                        <div className="flex items-center space-x-2">
                          {row.status === 'not_assigned' ? (
                            <button
                              onClick={() => {
                                handleOpenAddModal('add_assignment', 'Student Module Assignment', {
                                  studentId: row.onboardingId,
                                  studentName: row.studentName,
                                  registrationNumber: row.registrationNumber,
                                  programCode: row.programCode,
                                  cohort: cohortsForProgram(row.programCode)[0]?.name || '',
                                  className: cohortsForProgram(row.programCode)[0]?.name || '',
                                  assignedModulesCode: [],
                                  status: 'active'
                                });
                              }}
                              className="bg-indigo-50 border border-accent text-primary hover:bg-accent rounded-lg px-2.5 py-1 text-xs font-bold flex items-center space-x-1 transition shadow-xs cursor-pointer"
                              title="Assign units to student"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Assign Units</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  const sca = state.studentAssignments.find(a => a.id === row.assignmentId);
                                  if (sca) {
                                    handleOpenEditModal('edit_assignment', 'Student Module Assignment', sca, sca.id);
                                  }
                                }}
                                className="hover:text-zinc-900 text-zinc-400 transition"
                                title="Modify assignment"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRow('studentAssignments', 'id', row.assignmentId, 'Assigned units deleted successfully.')}
                                className="hover:text-rose-600 text-zinc-400 transition"
                                title="Remove assignment"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    ]}
                  />
                </div>
              );
            })()}

          </div>
        )}

        {/* GRADUATION SUBTABS */}
        {activeTab === 'graduation' && (
          <div className="space-y-6">
            
            {/* clearances subtab */}
            {getSubTab('graduation') === 'clearance' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 mb-1">Departments clearance Master Desk</h3>
                  <p className="text-xs text-zinc-500 mb-6">Individually review student clearance files and sign off across library, finance, academic, and hostels.</p>
                </div>

                <DataTable<DepartmentClearance>
                  data={state.departmentClearances}
                  idKey="studentId"
                  searchFilter={(item, q) => item.studentName.toLowerCase().includes(q) || item.studentRegNumber.toLowerCase().includes(q)}
                  columns={[
                    { header: 'Student Name', accessor: (dc) => <span className="font-extrabold text-zinc-900">{dc.studentName}</span> },
                    { header: 'Reg Number', accessor: (dc) => <span className="font-mono text-xs text-primary font-semibold">{dc.studentRegNumber}</span> },
                    
                    { header: 'Library Desk', accessor: (dc) => (
                      <button
                        onClick={() => toggleClearanceDept(dc.studentId, 'library')}
                        className={`text-xs px-2 py-0.5 rounded font-semibold text-center border transition ${
                          dc.libraryCleared ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}
                      >
                        {dc.libraryCleared ? 'Cleared' : 'Sign Off'}
                      </button>
                    )},

                    { header: 'Finance audit', accessor: (dc) => (
                      <button
                        onClick={() => toggleClearanceDept(dc.studentId, 'finance')}
                        className={`text-xs px-2 py-0.5 rounded font-semibold text-center border transition ${
                          dc.financeCleared ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}
                      >
                        {dc.financeCleared ? 'Cleared' : 'Sign Off'}
                      </button>
                    )},

                    { header: 'Acad Standards', accessor: (dc) => (
                      <button
                        onClick={() => toggleClearanceDept(dc.studentId, 'academic')}
                        className={`text-xs px-2 py-0.5 rounded font-semibold text-center border transition ${
                          dc.academicCleared ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}
                      >
                        {dc.academicCleared ? 'Cleared' : 'Sign Off'}
                      </button>
                    )},

                    { header: 'Accomodation Checkout', accessor: (dc) => (
                      <button
                        onClick={() => toggleClearanceDept(dc.studentId, 'accommodation')}
                        className={`text-xs px-2 py-0.5 rounded font-semibold text-center border transition ${
                          dc.accommodationCleared ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}
                      >
                        {dc.accommodationCleared ? 'Cleared' : 'Sign Off'}
                      </button>
                    )},

                    { header: 'Overall Sign', accessor: (dc) => (
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        dc.overallStatus === 'cleared' ? 'bg-emerald-100 text-emerald-800 font-extrabold' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {dc.overallStatus.toUpperCase()}
                      </span>
                    )},

                    { header: 'Process Graduation', accessor: (dc) => (
                      <div>
                        {dc.overallStatus === 'cleared' ? (
                          <button
                            onClick={() => promoteToGraduation(dc.studentId)}
                            className="bg-primary hover:bg-primary text-white rounded px-2.5 py-1 text-[10px] font-bold"
                          >
                            Graduate Student
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-400 italic">Clearance Pending</span>
                        )}
                      </div>
                    )}
                  ]}
                />
              </div>
            )}

            {/* graduations subtab */}
            {getSubTab('graduation') === 'graduations' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 mb-1">Graduates Central Registries</h3>
                  <p className="text-xs text-zinc-500 mb-6">A list of all graduated students with automatic letter-grade honours and assigned certificate numbers.</p>
                </div>

                <DataTable<Graduation>
                  data={state.graduations}
                  idKey="studentId"
                  searchFilter={(item, q) => item.studentName.toLowerCase().includes(q) || item.studentRegNumber.toLowerCase().includes(q)}
                  columns={[
                    { header: 'Student Name', accessor: (g) => <span className="font-bold text-zinc-900">{g.studentName}</span> },
                    { header: 'Reg Number', accessor: (g) => <span className="font-mono text-zinc-600 font-semibold text-xs">{g.studentRegNumber}</span> },
                    { header: 'Award Standing', accessor: (g) => g.graduationClass, sortKey: 'graduationClass' },
                    { header: 'Graduate Status', accessor: (g) => (
                      <span className="bg-emerald-50 text-emerald-800 rounded px-2.5 py-0.5 text-[10px] font-bold">
                        {g.overallStatus.toUpperCase()}
                      </span>
                    )},
                    { header: 'NFC Certificate Number', accessor: (g) => <span className="font-mono text-xs bg-zinc-100 px-2 py-0.5 rounded font-bold text-zinc-600">{g.certificateNumber || 'Pending'}</span> }
                  ]}
                />
              </div>
            )}

          </div>
        )}

        {/* GRADING RULES TAB */}
        {activeTab === 'grading' && (
          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Final Exam Grade & Honour Definitions</h3>
                  <p className="text-xs text-zinc-500 mt-1">Final exams and assignments produce letter grades; CATs remain absolute score records only.</p>
                </div>
                <button
                  onClick={() => handleOpenAddModal('edit_grade_rules', 'Define Grade Thresholds', {
                    aMin: gradeRules.find((rule) => rule.grade === 'A')?.min || 80,
                    bMin: gradeRules.find((rule) => rule.grade === 'B')?.min || 70,
                    cMin: gradeRules.find((rule) => rule.grade === 'C')?.min || 50,
                    dMin: gradeRules.find((rule) => rule.grade === 'D')?.min || 40
                  })}
                  className="bg-primary text-white rounded-xl px-4 py-2 text-xs font-semibold hover:bg-primary flex items-center space-x-1"
                >
                  <Settings className="h-4 w-4" />
                  <span>Edit Rules</span>
                </button>
              </div>

              <DataTable<GradeRule>
                data={gradeRules}
                idKey={(rule) => rule.grade}
                searchFilter={(rule, q) => rule.grade.toLowerCase().includes(q) || rule.honour.toLowerCase().includes(q)}
                columns={[
                  { header: 'Letter Grade', accessor: (rule) => <span className="font-black text-primary">{rule.grade}</span>, sortKey: 'grade' },
                  { header: 'Score Range', accessor: (rule) => `${rule.min}-${rule.max > 100 ? 100 : rule.max}%` },
                  { header: 'Graduation Standing', accessor: (rule) => rule.honour },
                  { header: 'Status', accessor: (rule) => (
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${rule.status === 'Pass' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                      {rule.status}
                    </span>
                  ) }
                ]}
              />

              <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-zinc-700">
                CATs are recorded as absolute marks against the scheduled total, such as 20/30, and do not generate letter grades or graduation honours.
              </div>
            </div>
          </div>
        )}

        {/* RESOURCES SUBTABS */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            
            {/* 1. ROOMS */}
            {getSubTab('resources') === 'rooms' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">Campus Property Allocations</h3>
                    <p className="text-xs text-zinc-500 mt-1">Configure campus classrooms, diagnostic computer laboratories and hostel bookings.</p>
                  </div>
                  <button
                    onClick={() => handleOpenAddModal('add_room', 'Configure Campus Room', { roomNumber: '', type: 'classroom', capacity: '40', facilities: 'Smart Board, Projector', hostelFee: '3000' })}
                    className="bg-primary text-white rounded-xl px-4 py-2 text-xs font-semibold hover:bg-primary flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Property Room</span>
                  </button>
                </div>

                <DataTable<Room>
                  data={state.rooms}
                  idKey="roomNumber"
                  searchFilter={(item, q) => item.roomNumber.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)}
                  columns={[
                    { header: 'Property Room ID', accessor: (r) => <span className="font-bold text-zinc-900">{r.roomNumber}</span> },
                    { header: 'Property Type', accessor: (r) => <span className="font-semibold text-xs text-primary">{r.type.toUpperCase()}</span> },
                    { header: 'Beds/Seat Capacity', accessor: (r) => `${r.capacity} Occupants` },
                    { header: 'Property status', accessor: (r) => <span className="text-emerald-600 font-bold text-[10px]">{r.status.toUpperCase()}</span> },
                    { header: 'Facilities Included', accessor: (r) => (
                      <div className="flex flex-wrap gap-1">
                        {r.facilities.map((f, i) => (
                          <span key={i} className="bg-zinc-50 border border-zinc-100 px-1 py-0.5 rounded text-[9px] text-zinc-500 font-medium">{f}</span>
                        ))}
                      </div>
                    ) },
                    { header: 'Hostel Approval Fee', accessor: (r) => r.hostelFee ? `Kes 3,000` : <span className="text-zinc-400 font-mono italic">Not Hostel</span> },
                    { header: 'Action', accessor: (r) => (
                      <button
                        onClick={() => handleDeleteRow('rooms', 'roomNumber', r.roomNumber, 'Campus property room deleted.')}
                        className="hover:text-rose-600 text-zinc-400 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  ]}
                />
              </div>
            )}

            {getSubTab('resources') === 'room-approvals' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-base font-bold text-zinc-900">Student Hostel Room Applications</h3>
                  <p className="text-xs text-zinc-500 mt-1">Approve student room applications after confirming the required KSh 3,000 payment proof.</p>
                </div>

                <DataTable<any>
                  data={state.hostelBookings || []}
                  idKey="id"
                  searchFilter={(item, q) => item.studentRegNumber?.toLowerCase().includes(q) || item.roomNumber?.toLowerCase().includes(q)}
                  emptyMessage="No room applications are waiting for approval."
                  columns={[
                    { header: 'Reg Number', accessor: (b) => <span className="font-mono text-xs font-semibold">{b.studentRegNumber}</span> },
                    { header: 'Room Applied', accessor: (b) => <span className="font-bold">{b.roomNumber}</span> },
                    { header: 'Application Date', accessor: (b) => b.bookingDate },
                    { header: 'Payment', accessor: (b) => <span className="font-semibold">Kes {(b.amount || 3000).toLocaleString()}</span> },
                    { header: 'Status', accessor: (b) => (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.status === 'approved' || b.status === 'active' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                        {String(b.status).toUpperCase()}
                      </span>
                    )},
                    { header: 'Action', accessor: (b) => (
                      <button
                        onClick={() => handleOpenEditModal('approve_hostel_booking', 'Approve Hostel Application', b, b.id)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Approve
                      </button>
                    )}
                  ]}
                />
              </div>
            )}

            {/* 2. LEARNING MATERIALS */}
            {getSubTab('resources') === 'materials' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 mb-1">Curriculum Materials Registry</h3>
                    <p className="text-xs text-zinc-500">Upload PDFs, recorded clinics, or instructions manuals assigned directly within syllabus codes.</p>
                  </div>
                  <button
                    onClick={() => handleOpenAddModal('add_material', 'Assign Study Material', { title: '', moduleCode: state.modules[0]?.code || '', materialType: 'PDF', uploadedBy: 'Admin', fileUrl: '' })}
                    className="bg-primary text-white rounded-xl px-4 py-2 text-xs font-semibold hover:bg-dark flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Assign Material</span>
                  </button>
                </div>

                <DataTable<LearningMaterial>
                  data={state.learningMaterials}
                  idKey="id"
                  searchFilter={(item, q) => item.title.toLowerCase().includes(q) || item.moduleCode.toLowerCase().includes(q)}
                  columns={[
                    { header: 'Material Title', accessor: (lm) => <span className="font-bold text-primary">{lm.title}</span> },
                    { header: 'Subject module', accessor: (lm) => lm.moduleCode },
                    { header: 'File Type', accessor: (lm) => <span className="bg-zinc-100 text-zinc-500 px-1 text-[10px] rounded uppercase font-bold font-mono">{lm.materialType}</span> },
                    { header: 'Instructor Upload', accessor: (lm) => lm.uploadedBy },
                    { header: 'Added Date', accessor: (lm) => lm.uploadDate },
                    { header: 'Document Path', accessor: (lm) => (
                      <a href={lm.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Download Link</a>
                    )}
                  ]}
                />
              </div>
            )}

            {/* 3. MEDICAL ROTATIONS ATTACHMENTS */}
            {getSubTab('resources') === 'medical-attachments' && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 mb-1">Diagnostic Ward Practicums (Rotations)</h3>
                    <p className="text-xs text-zinc-500 font-medium">Assign onboarded students directly to hospitals and medical facilities.</p>
                  </div>
                  <button
                    onClick={() => handleOpenAddModal('add_rotation', 'Create Medical Rotation', { studentId: '', facilityName: '', startDate: '', endDate: '', supervisor: '', status: 'pending' })}
                    className="bg-primary text-white rounded-xl px-4 py-2 text-xs font-semibold hover:bg-dark flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Rotation</span>
                  </button>
                </div>

                <DataTable<MedicalAttachment>
                  data={state.medicalAttachments}
                  idKey="id"
                  searchFilter={(item, q) => item.studentName.toLowerCase().includes(q) || item.facilityName.toLowerCase().includes(q)}
                  columns={[
                    { header: 'Practitioner Candidate', accessor: (ma) => <span className="font-extrabold text-zinc-950">{ma.studentName}</span> },
                    { header: 'Reg NumberCode', accessor: (ma) => <span className="font-mono text-zinc-500 text-xs">{ma.studentRegNumber}</span> },
                    { header: 'Hospital Facility', accessor: (ma) => <span className="font-bold text-primary flex items-center gap-1"><BriefcaseMedical className="h-3.5 w-3.5" /> {ma.facilityName}</span> },
                    { header: 'Rotation range', accessor: (ma) => `${ma.startDate} to ${ma.endDate}` },
                    { header: 'Assigned Board Supervisor', accessor: (ma) => ma.supervisor },
                    { header: 'Status Flag', accessor: (ma) => (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ma.status === 'completed' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {ma.status.toUpperCase()}
                      </span>
                    )}
                  ]}
                />
              </div>
            )}

          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-base font-bold text-zinc-900">Application User Management</h3>
                <p className="text-xs text-zinc-500 mt-1">Only admin and student roles are active. Existing passwords are not displayed; generate a temporary password when a user needs access.</p>
              </div>

              {generatedPassword && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                  Temporary password for <strong>{generatedPassword.username}</strong>: <span className="font-mono font-black">{generatedPassword.password}</span>
                </div>
              )}

              <DataTable<User>
                data={state.users}
                idKey="id"
                searchFilter={(user, q) => user.name.toLowerCase().includes(q) || user.username.toLowerCase().includes(q) || user.role.toLowerCase().includes(q)}
                columns={[
                  { header: 'User Name', accessor: (user) => <span className="font-bold text-zinc-900">{user.name}</span> },
                  { header: 'Login Username', accessor: (user) => <span className="font-mono text-xs">{user.username}</span> },
                  { header: 'Role', accessor: (user) => <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">{user.role}</span> },
                  { header: 'Student Link', accessor: (user) => user.studentId || <span className="text-zinc-400">Admin account</span> },
                  { header: 'Password Access', accessor: (user) => (
                    <button
                      onClick={() => resetUserPassword(user)}
                      className="rounded bg-primary px-2.5 py-1 text-[10px] font-bold text-white"
                    >
                      Generate temporary password
                    </button>
                  ) }
                ]}
              />
            </div>
          </div>
        )}

        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-base font-bold text-zinc-900">Student Inquiries Response Desk</h3>
                <p className="text-xs text-zinc-500 mt-1">Respond to common issues and mark resolved cases for fees, accommodation, IT, admissions, and exams.</p>
              </div>
              <DataTable<typeof adminInquiries[number]>
                data={adminInquiries}
                idKey="id"
                searchFilter={(ticket, q) => ticket.student.toLowerCase().includes(q) || ticket.subject.toLowerCase().includes(q) || ticket.message.toLowerCase().includes(q)}
                columns={[
                  { header: 'Ticket', accessor: (ticket) => <span className="font-mono font-bold text-primary">{ticket.id}</span> },
                  { header: 'Student', accessor: (ticket) => <span className="font-bold">{ticket.student}</span> },
                  { header: 'Subject', accessor: (ticket) => ticket.subject },
                  { header: 'Message', accessor: (ticket) => ticket.message },
                  { header: 'Status', accessor: (ticket) => (
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                      {ticket.status}
                    </span>
                  ) },
                  { header: 'Action', accessor: (ticket) => (
                    <button
                      onClick={() => {
                        setAdminInquiries((prev) => prev.map((item) => item.id === ticket.id ? { ...item, status: 'Resolved' } : item));
                        triggerToast('Inquiry marked as resolved.');
                      }}
                      className="rounded bg-primary px-2.5 py-1 text-[10px] font-bold text-white"
                    >
                      Resolve
                    </button>
                  ) }
                ]}
              />
            </div>
          </div>
        )}

          </div>
        </div>

        {/* COMPREHENSIVE VINTAGE FOOTER */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-[10.5px] font-sans border-t border-zinc-200 pt-5 text-zinc-400 select-none">
          <div className="hover:underline cursor-pointer font-bold text-blue-800">
            About Us
          </div>
          <div className="text-center sm:text-right mt-1 sm:mt-0 font-medium">
            Data Privacy © 2013 <strong className="text-zinc-650">Radiant Hospital Training Institute</strong>. Design: by <strong className="text-zinc-650">ICT Centre</strong>
          </div>
        </div>

      {/* COMPREHENSIVE GENERATED DYNAMIC MODAL FORM DISPATCHER */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        <form onSubmit={handleFormSubmit} className="portal-slide-form space-y-4 text-xs rounded-xl border border-zinc-300 bg-white p-4 shadow-sm">
          
          {/* APPLICANT FORM */}
          {(modalType === 'add_applicant' || modalType === 'edit_applicant') && (
            <>
              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Full Applicant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mercy Wanjiku"
                  className="w-full border border-zinc-200 rounded-lg p-2 focus:ring-1 focus:ring-primary bg-white"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Email Register</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="w-full border border-zinc-200 rounded-lg p-2 focus:ring-1 focus:ring-primary bg-white"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Active phone number</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Aspirative Program</label>
                  <select
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.programApplied || 'CNA'}
                    onChange={(e) => setFormData({ ...formData, programApplied: e.target.value })}
                  >
                    {state.programs.map(p => (
                      <option key={p.code} value={p.code}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">KCSE Highschool Grade</label>
                  <input
                    type="text"
                    placeholder="B-"
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.kcseGrade || ''}
                    onChange={(e) => setFormData({ ...formData, kcseGrade: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {modalType === 'edit_acceptance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <span className="sm:text-right text-zinc-600 font-bold pr-2">Applicant</span>
                <div className="sm:col-span-2 font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-lg p-2.5">
                  {formData.applicantName} <span className="font-mono text-primary ml-1">({formData.programCode})</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">Signed Acceptance PDF</label>
                <div className="sm:col-span-2">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    onChange={(e) => setFormData({ ...formData, signedAcceptanceLetterUrl: e.target.files?.[0]?.name ? `/documents/${e.target.files[0].name}` : formData.signedAcceptanceLetterUrl })}
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">Saved as Signed Acceptance Letter in the documents register.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">Acceptance Status</label>
                <div className="sm:col-span-2">
                  <select
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.status || 'sent'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="sent">Sent</option>
                    <option value="onboarded">Onboarded</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {modalType === 'edit_onboarding' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <span className="sm:text-right text-zinc-600 font-bold pr-2">Student</span>
                <div className="sm:col-span-2 font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-lg p-2.5">
                  {formData.studentName} <span className="font-mono text-primary ml-1">({formData.registrationNumber})</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">Cohort</label>
                <div className="sm:col-span-2">
                  <select
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.assignedCohort || ''}
                    onChange={(e) => setFormData({ ...formData, assignedCohort: e.target.value })}
                  >
                    {cohortsForProgram(formData.programCode).map((coh) => (
                      <option key={coh.name} value={coh.name}>{coh.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {[
                ['nationalIdUrl', 'National ID PDF/Image'],
                ['kcseCertificateUrl', 'KCSE Certificate PDF/Image'],
                ['kcpeCertificateUrl', 'KCPE Certificate PDF/Image'],
              ].map(([field, label]) => (
                <div key={field} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <label className="sm:text-right text-zinc-600 font-bold pr-2">{label}</label>
                  <div className="sm:col-span-2">
                    <input
                      type="file"
                      className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.files?.[0]?.name ? `/documents/${e.target.files[0].name}` : formData[field] })}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ACADEMIC PROGRAM FORM */}
          {(modalType === 'add_program' || modalType === 'edit_program') && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">Program Code *</label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    disabled={modalType === 'edit_program'}
                    placeholder="e.g. CNA"
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-zinc-50"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">Initials Register *</label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="CNA"
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.initials || ''}
                    onChange={(e) => setFormData({ ...formData, initials: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">Program Title *</label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Certificate in Nursing Assistant"
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">Duration (Years) *</label>
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    required
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">Curriculum Status *</label>
                <div className="sm:col-span-2">
                  <select
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.status || 'Active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* MODULE FORM */}
          {(modalType === 'add_module' || modalType === 'edit_module') && (
            <>
              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Target Program</label>
                <select
                  className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                  value={formData.programCode || 'CNA'}
                  onChange={(e) => setFormData({ ...formData, programCode: e.target.value })}
                >
                  {state.programs.map(p => (
                    <option key={p.code} value={p.code}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Module unique code</label>
                <input
                  type="text"
                  required
                  placeholder="MOD-CNA-01"
                  className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Module Title</label>
                <input
                  type="text"
                  required
                  className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

            </>
          )}

          {/* CLASS TIMETABLE FORM */}
          {(modalType === 'add_class' || modalType === 'edit_class') && (
            <>
              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Class Schedule Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CNA-01-A"
                  className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Target Program Sector *</label>
                  <select
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.programCode || 'CNA'}
                    onChange={(e) => {
                      const programCode = e.target.value;
                      setFormData({
                        ...formData,
                        programCode,
                        moduleCode: modulesForProgram(programCode)[0]?.code || '',
                        cohortName: cohortsForProgram(programCode)[0]?.name || ''
                      });
                    }}
                  >
                    {state.programs.map(p => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Target Module *</label>
                  <select
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.moduleCode || modulesForProgram(formData.programCode || 'CNA')[0]?.code || ''}
                    onChange={(e) => setFormData({ ...formData, moduleCode: e.target.value })}
                  >
                    {modulesForProgram(formData.programCode || 'CNA').map(m => (
                      <option key={m.code} value={m.code}>{m.name} ({m.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Target Cohort Group *</label>
                <select
                  className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                  value={formData.cohortName || cohortsForProgram(formData.programCode || 'CNA')[0]?.name || ''}
                  onChange={(e) => setFormData({ ...formData, cohortName: e.target.value })}
                >
                  {cohortsForProgram(formData.programCode || 'CNA').map(coh => (
                    <option key={coh.name} value={coh.name}>{coh.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Classroom / Facility Block *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Room-102"
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.roomNumber || ''}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Maximum Seating Capacity *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 30"
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Daily timing block *</label>
                  <input
                    type="text"
                    required
                    placeholder="09:00 AM - 12:00 PM"
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.scheduleTime || ''}
                    onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Days of week (Comma separated) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Monday,Wednesday,Friday"
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={typeof formData.scheduleDays === 'string' ? formData.scheduleDays : (formData.scheduleDays?.join(',') || 'Monday,Wednesday')}
                    onChange={(e) => setFormData({ ...formData, scheduleDays: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {/* COHORT GENERATION FORM */}
          {(modalType === 'add_cohort' || modalType === 'edit_cohort') && (
            <>
              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Academic Program Sector *</label>
                <select
                  className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                  value={formData.programCode || 'CNA'}
                  onChange={(e) => setFormData({ ...formData, programCode: e.target.value })}
                >
                  {state.programs.map(p => (
                    <option key={p.code} value={p.code}>{p.name} ({p.code})</option>
                  ))}
                </select>
                {modalType === 'add_cohort' && (
                  <p className="text-[10px] text-green-700 font-semibold mt-1">
                    ✔ Unique cohort label identifier (e.g. CNA-02) is auto-sequenced on creation.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Academic Term Start Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Academic Term End Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Stated Academic Calendar Year *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026"
                  className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                  value={formData.academicYear || '2026'}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                />
              </div>
            </>
          )}

          {/* LECTURER PROFILE REGISTRATION FORM */}
          {(modalType === 'add_lecturer' || modalType === 'edit_lecturer') && (
            <>
              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Lecturer Full Names *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Peter Kamau"
                  className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Lecturer Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. p.kamau@rhti.local"
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Modules Taught</label>
                {(() => {
                  const selectedCodes = typeof formData.assignedModuleCodes === 'string'
                    ? formData.assignedModuleCodes.split(',').map((code: string) => code.trim()).filter(Boolean)
                    : Array.isArray(formData.assignedModuleCodes)
                      ? formData.assignedModuleCodes
                      : [];
                  const toggleModule = (code: string) => {
                    const nextCodes = selectedCodes.includes(code)
                      ? selectedCodes.filter((item: string) => item !== code)
                      : [...selectedCodes, code];
                    setFormData({ ...formData, assignedModuleCodes: nextCodes });
                  };

                  return (
                    <div className="rounded-lg border border-zinc-300 bg-white shadow-inner">
                      <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2">
                        <span className="text-[10px] font-bold uppercase text-zinc-500">Target Modules</span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {selectedCodes.length} selected
                        </span>
                      </div>
                      <div className="max-h-56 overflow-y-auto p-2 space-y-1">
                        {state.modules.map((m) => {
                          const isSelected = selectedCodes.includes(m.code);
                          return (
                            <label
                              key={m.code}
                              className={`flex cursor-pointer items-start gap-2 rounded-md border px-2 py-2 transition ${
                                isSelected ? 'border-primary bg-primary/5' : 'border-zinc-200 hover:border-primary/50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="mt-0.5 h-4 w-4 accent-primary"
                                checked={isSelected}
                                onChange={() => toggleModule(m.code)}
                              />
                              <span className="min-w-0">
                                <span className="block font-bold text-zinc-800">{m.name}</span>
                                <span className="block text-[10px] font-mono text-zinc-500">{m.code} • {m.programCode}</span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </>
          )}

          {/* APPROVED PROGRAM TUITION FEE CONFIG FORM */}
          {modalType === 'add_fee_structure' && (
            <>
              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Program Choice *</label>
                <select
                  className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                  value={formData.programCode || 'CNA'}
                  onChange={(e) => setFormData({ ...formData, programCode: e.target.value })}
                >
                  {state.programs.map(p => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Approved Tuition Amount (KSh) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 24000"
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white font-mono font-bold"
                    value={formData.feeAmount || ''}
                    onChange={(e) => setFormData({ ...formData, feeAmount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Target Year *</label>
                  <input
                    type="text"
                    required
                    placeholder="2026"
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.academicYear || '2026'}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {/* GENERATE LEDGER BILLING INVOICE FORM */}
          {modalType === 'add_invoice' && (
            <>
              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Select Active Student *</label>
                <select
                  required
                  className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                  value={formData.studentId || ''}
                  onChange={(e) => {
                    const studentId = e.target.value;
                    const programCode = state.onboardings.find((student) => student.id === studentId)?.programCode;
                    const firstModule = modulesForProgram(programCode)[0]?.code || '';
                    setFormData({ ...formData, studentId, moduleCode: firstModule, examId: '' });
                  }}
                >
                  <option value="">-- Choose Student candidate --</option>
                  {state.onboardings.map(stud => (
                    <option key={stud.id} value={stud.id}>{stud.studentName} ({stud.registrationNumber})</option>
                  ))}
                </select>
                <p className="text-[10px] text-zinc-500 font-semibold mt-1">
                  ✔ System automatically calculates tuition charges based on their assigned program registers.
                </p>
              </div>

              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Payment due deadline *</label>
                <input
                  type="date"
                  required
                  className="w-full border border-zinc-200 rounded-lg p-2 bg-white font-mono"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </>
          )}

          {/* ROOM/HOSTEL PROPERTY CONFIGURATION FORM */}
          {(modalType === 'add_room' || modalType === 'edit_room') && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Room Facility Number *</label>
                  <input
                    type="text"
                    required
                    disabled={modalType === 'edit_room'}
                    placeholder="e.g. Room-102 or Hall-4-B"
                    className="w-full border border-zinc-200 rounded-lg p-2 disabled:bg-zinc-100 bg-white"
                    value={formData.roomNumber || ''}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Utility Classification *</label>
                  <select
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.type || 'classroom'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="classroom">Academic Classroom</option>
                    <option value="lab">Science Diagnostics Laboratory</option>
                    <option value="hostel">Resident Hostel Suite</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Maximum Student Capacity *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 40"
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>
                {formData.type === 'hostel' && (
                  <div>
                    <label className="block text-zinc-600 font-bold text-dark mb-1">Approval Fee (KSh) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 3000"
                      className="w-full border border-blue-300 rounded-lg p-2 bg-accent/30/50 text-[#0D233A] font-mono font-bold focus:ring-1 focus:ring-primary font-bold"
                      value={formData.hostelFee || ''}
                      onChange={(e) => setFormData({ ...formData, hostelFee: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Equipment and Facilities list (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Smart Board, Projector, Wi-Fi router"
                  className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                  value={typeof formData.facilities === 'string' ? formData.facilities : (formData.facilities?.join(',') || '')}
                  onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                />
              </div>
            </>
          )}

          {modalType === 'approve_hostel_booking' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <span className="sm:text-right text-zinc-600 font-bold pr-2">Application</span>
                <div className="sm:col-span-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 font-bold text-zinc-900">
                  {formData.studentRegNumber} - {formData.roomNumber}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">Transaction Code *</label>
                <input
                  required
                  className="sm:col-span-2 w-full border border-zinc-300 rounded-lg p-2 bg-white"
                  value={formData.transactionCode || ''}
                  onChange={(e) => setFormData({ ...formData, transactionCode: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">Bank Transaction Code *</label>
                <input
                  required
                  className="sm:col-span-2 w-full border border-zinc-300 rounded-lg p-2 bg-white"
                  value={formData.bankTransactionCode || ''}
                  onChange={(e) => setFormData({ ...formData, bankTransactionCode: e.target.value })}
                />
              </div>
            </div>
          )}

          {modalType === 'add_material' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">Material Title *</label>
                <input required className="sm:col-span-2 w-full border border-zinc-300 rounded-lg p-2 bg-white" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">Module *</label>
                <select className="sm:col-span-2 w-full border border-zinc-300 rounded-lg p-2 bg-white" value={formData.moduleCode || ''} onChange={(e) => setFormData({ ...formData, moduleCode: e.target.value })}>
                  {state.modules.map((m) => <option key={m.code} value={m.code}>{m.name} ({m.code})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">File Type</label>
                <select className="sm:col-span-2 w-full border border-zinc-300 rounded-lg p-2 bg-white" value={formData.materialType || 'PDF'} onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}>
                  <option value="PDF">PDF</option>
                  <option value="Video">Video</option>
                  <option value="Document">Document</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">Document URL</label>
                <input className="sm:col-span-2 w-full border border-zinc-300 rounded-lg p-2 bg-white" value={formData.fileUrl || ''} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} />
              </div>
            </div>
          )}

          {modalType === 'add_rotation' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">Student *</label>
                <select required className="sm:col-span-2 w-full border border-zinc-300 rounded-lg p-2 bg-white" value={formData.studentId || ''} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}>
                  <option value="">Select student</option>
                  {state.onboardings.map((o) => <option key={o.id} value={o.id}>{o.studentName} ({o.registrationNumber})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">Hospital Facility *</label>
                <input required className="sm:col-span-2 w-full border border-zinc-300 rounded-lg p-2 bg-white" value={formData.facilityName || ''} onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">Medical Staff Supervisor *</label>
                <input required className="sm:col-span-2 w-full border border-zinc-300 rounded-lg p-2 bg-white" value={formData.supervisor || ''} onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">Start Date</label>
                <input type="date" className="sm:col-span-2 w-full border border-zinc-300 rounded-lg p-2 bg-white" value={formData.startDate || ''} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">End Date</label>
                <input type="date" className="sm:col-span-2 w-full border border-zinc-300 rounded-lg p-2 bg-white" value={formData.endDate || ''} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
            </div>
          )}

          {/* EXAM SCHEDULE FORM */}
          {(modalType === 'add_exam' || modalType === 'edit_exam') && (
            <>
              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Assessment Assessment Title</label>
                <input
                  type="text"
                  required
                  placeholder="First Sem Final Assessment"
                  className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Target Program</label>
                  <select
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.programCode || state.modules.find((m) => m.code === formData.moduleCode)?.programCode || 'CDA'}
                    onChange={(e) => {
                      const programCode = e.target.value;
                      setFormData({
                        ...formData,
                        programCode,
                        moduleCode: modulesForProgram(programCode)[0]?.code || '',
                        cohortName: cohortsForProgram(programCode)[0]?.name || '',
                        className: cohortsForProgram(programCode)[0]?.name || ''
                      });
                    }}
                  >
                    {state.programs.map(p => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Subject Module Code</label>
                  <select
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.moduleCode || modulesForProgram(formData.programCode || state.modules.find((m) => m.code === formData.moduleCode)?.programCode || 'CDA')[0]?.code || ''}
                    onChange={(e) => setFormData({ ...formData, moduleCode: e.target.value })}
                  >
                    {modulesForProgram(formData.programCode || state.modules.find((m) => m.code === formData.moduleCode)?.programCode || 'CDA').map(m => (
                      <option key={m.code} value={m.code}>{m.name} ({m.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Target Cohort</label>
                  <select
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.cohortName || formData.className || cohortsForProgram(formData.programCode || 'CDA')[0]?.name || ''}
                    onChange={(e) => setFormData({ ...formData, cohortName: e.target.value, className: e.target.value })}
                  >
                    {cohortsForProgram(formData.programCode || state.modules.find((m) => m.code === formData.moduleCode)?.programCode || 'CDA').map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Exam Type</label>
                <select
                  className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                  value={formData.examType || 'Final Exam'}
                  onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                >
                  <option value="Final Exam">Final Exam</option>
                  <option value="CAT">CAT</option>
                  <option value="Assignment">Assignment</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Total Marks</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full border border-zinc-200 rounded-lg p-2 bg-white font-mono font-bold"
                  value={formData.totalMarks || (formData.examType === 'CAT' ? '30' : '100')}
                  onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Exam Date</label>
                  <input
                    type="date"
                    required
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Timing Schedule</label>
                  <input
                    type="text"
                    placeholder="09:00 - 11:00"
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.time || ''}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Venue Hall</label>
                  <input
                    type="text"
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white font-semibold"
                    value={formData.venue || 'Exam Hall A'}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {/* EXAM RESULT ENTRY FORM */}
          {(modalType === 'add_result' || modalType === 'edit_result') && (
            <>
              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Select Active Onboarded Student</label>
                <select
                  className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                  value={formData.studentId || ''}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                >
                  <option value="">-- Choose Candidate --</option>
                  {state.onboardings.map(o => (
                    <option key={o.id} value={o.id}>{o.studentName} ({o.registrationNumber})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Subject Module</label>
                  <select
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.moduleCode || modulesForProgram(state.onboardings.find((student) => student.id === formData.studentId)?.programCode)[0]?.code || 'MOD-CDA-01'}
                    onChange={(e) => setFormData({ ...formData, moduleCode: e.target.value, examId: '' })}
                  >
                    {modulesForProgram(state.onboardings.find((student) => student.id === formData.studentId)?.programCode).map(m => (
                      <option key={m.code} value={m.code}>{m.name} ({m.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Score Marks</label>
                  <input
                    type="number"
                    max={state.exams.find((exam) => exam.id === formData.examId)?.totalMarks || 100}
                    required
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white font-mono font-bold"
                    value={formData.marks || '80'}
                    onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Direct Evaluative Exam Code</label>
                <select
                  className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                  value={formData.examId || ''}
                  onChange={(e) => {
                    const examId = e.target.value;
                    const exam = state.exams.find((item) => item.id === examId);
                    setFormData({ ...formData, examId, moduleCode: exam?.moduleCode || formData.moduleCode });
                  }}
                >
                  <option value="">-- Choose assessment --</option>
                  {state.exams.filter(ex => !formData.moduleCode || ex.moduleCode === formData.moduleCode).map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name} ({ex.examType || 'Final Exam'} / {ex.totalMarks} marks)</option>
                  ))}
                </select>
                {state.exams.find((exam) => exam.id === formData.examId)?.examType === 'CAT' && (
                  <p className="mt-1 text-[10px] font-semibold text-zinc-500">CAT marks are stored as absolute scores only and do not generate a letter grade.</p>
                )}
              </div>

              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Lecturer Feedback Evaluatives</label>
                <input
                  type="text"
                  placeholder="Superb modulework logs."
                  className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                  value={formData.comments || ''}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                />
              </div>
            </>
          )}

          {/* ASSIGNED UNITS FORM (STUDENT COURSE ASSIGNMENT) */}
          {(modalType === 'add_assignment' || modalType === 'edit_assignment') && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <span className="sm:text-right text-zinc-600 font-bold pr-2">Student Matriculate</span>
                <div className="sm:col-span-2 font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-lg p-2.5">
                  {formData.studentName} <span className="font-mono text-primary ml-1">({formData.registrationNumber})</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">Target Cohort *</label>
                <div className="sm:col-span-2">
                  <select
                    required
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.cohort || ''}
                    onChange={(e) => setFormData({ ...formData, cohort: e.target.value })}
                  >
                    <option value="">-- Select Cohort Group --</option>
                    {cohortsForProgram(formData.programCode).map(coh => (
                      <option key={coh.name} value={coh.name}>{coh.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                <label className="sm:text-right text-zinc-600 font-bold pr-2 pt-2">Enrolled Modules *</label>
                <div className="sm:col-span-2">
                  <select
                    multiple
                    required
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white font-mono"
                    value={Array.isArray(formData.assignedModulesCode) ? formData.assignedModulesCode : []}
                    onChange={(e) => {
                      const modulesArr = Array.from(e.target.selectedOptions).map((option) => option.value);
                      setFormData({ ...formData, assignedModulesCode: modulesArr });
                    }}
                  >
                    {modulesForProgram(formData.programCode).map((m) => (
                      <option key={m.code} value={m.code}>{m.name} ({m.code})</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-zinc-400 mt-1">Only modules belonging to the student's program are shown.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="sm:text-right text-zinc-600 font-bold pr-2">Status Flag *</label>
                <div className="sm:col-span-2">
                  <select
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white"
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="deferred">Deferred</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {modalType === 'edit_grade_rules' && (
            <div className="space-y-4">
              <div>
                <label className="block text-zinc-600 font-semibold mb-1">A Minimum Score</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  className="w-full border border-zinc-300 rounded-lg p-2 bg-white"
                  value={formData.aMin || 80}
                  onChange={(e) => setFormData({ ...formData, aMin: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-zinc-600 font-semibold mb-1">B Minimum Score</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  className="w-full border border-zinc-300 rounded-lg p-2 bg-white"
                  value={formData.bMin || 70}
                  onChange={(e) => setFormData({ ...formData, bMin: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-zinc-600 font-semibold mb-1">C Minimum Score</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  className="w-full border border-zinc-300 rounded-lg p-2 bg-white"
                  value={formData.cMin || 50}
                  onChange={(e) => setFormData({ ...formData, cMin: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-zinc-600 font-semibold mb-1">D Minimum Score</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  className="w-full border border-zinc-300 rounded-lg p-2 bg-white"
                  value={formData.dMin || 40}
                  onChange={(e) => setFormData({ ...formData, dMin: e.target.value })}
                />
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-[10px] font-semibold text-zinc-600">
                E is automatically assigned below the D minimum score. CATs bypass these grade bands.
              </div>
            </div>
          )}

          {/* DYNAMIC SUBMIT ACTIONS FOR MODAL */}
          <div className="sticky bottom-0 -mx-4 -mb-4 mt-6 flex justify-end space-x-2 border-t border-zinc-200 bg-white/95 p-4 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="py-2 px-4 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-primary hover:bg-primary text-white rounded-lg text-xs font-semibold shadow-md transition"
            >
              Apply Records
            </button>
          </div>

        </form>
      </Modal>

      </div>
    </div>
  );
}
