import React, { useState } from 'react';
import { 
  User as UserIcon, 
  CreditCard, 
  BookOpen, 
  Award, 
  GraduationCap, 
  Home as HomeIcon, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign, 
  Check, 
  Loader2, 
  LogOut, 
  Sparkles, 
  MessageSquare, 
  FileDown, 
  Bell,
  Calendar,
  FileText,
  Lock,
  Phone,
  Mail,
  ArrowRight
} from 'lucide-react';
import { Onboarding, Program, Invoice, Payment, Room, HostelBooking, Exam, ExamResult, DepartmentClearance, Graduation, LearningMaterial, Module, Class } from '../types';

interface StudentPortalProps {
  currentStudentId: string;
  onboards: Onboarding[];
  programs: Program[];
  classes: Class[];
  lecturers: Lecturer[];
  modules: Module[];
  invoices: Invoice[];
  payments: Payment[];
  rooms: Room[];
  hostelBookings: HostelBooking[];
  exams: Exam[];
  examResults: ExamResult[];
  clearances: DepartmentClearance[];
  graduations: Graduation[];
  materials: LearningMaterial[];
  
  onUpdateInvoice: (invoiceId: string, status: 'pending' | 'paid' | 'overdue') => void;
  onAddPayment: (payment: Payment) => void;
  onUpdateRoom: (roomNumber: string, updates: Partial<Room>) => void;
  onAddHostelBooking: (booking: HostelBooking) => void;
  onUpdateHostelBooking: (bookingId: string, updates: Partial<HostelBooking>) => void;
  onAddClearanceRequest: (studentId: string, name: string, reg: string) => void;
  onApplyGraduation: (studentId: string) => void;
  onUploadStudentDocument: (studentId: string, type: 'id' | 'certs' | 'photo') => void;
  onLogout: () => void;
}

// Custom type for coursework lecturer
interface Lecturer {
  id: string;
  name: string;
  email: string;
  department?: string;
}

export function StudentPortal({
  currentStudentId,
  onboards,
  programs,
  classes,
  lecturers,
  modules,
  invoices,
  payments,
  rooms,
  hostelBookings,
  exams,
  examResults,
  clearances,
  graduations,
  materials,
  onUpdateInvoice,
  onAddPayment,
  onUpdateRoom,
  onAddHostelBooking,
  onUpdateHostelBooking,
  onAddClearanceRequest,
  onApplyGraduation,
  onUploadStudentDocument,
  onLogout
}: StudentPortalProps) {
  // Main tabs based on RHTI Portal tabs
  const [activeTab, setActiveTab] = useState<'home' | 'fees' | 'timetable' | 'registration' | 'results' | 'bookroom' | 'enquiries'>('home');
  // Secondary subtabs within active tabs (bullet items separated by dot)
  const [activeSubTab, setActiveSubTab] = useState<string>('profile');

  // Find logged-in student details
  const student = onboards.find(s => s.id === currentStudentId) || onboards[0];
  const program = programs.find(p => p.code === student.programCode);
  
  // Derived lists
  const studentInvoices = invoices.filter(inv => inv.studentId === student.id);
  const studentPayments = payments.filter(pay => pay.studentId === student.id);
  const studentBookings = hostelBookings.filter(b => b.studentId === student.id);
  const hasAllocatedAccommodation = studentBookings.some((booking) => ['active', 'approved'].includes(booking.status));
  const studentClearance = clearances.find(c => c.studentId === student.id);
  const studentGraduation = graduations.find(g => g.studentId === student.id);
  const studentModules = modules.filter(m => m.programCode === student.programCode);
  const studentResults = examResults.filter(r => r.studentId === student.id);
  const studentExams = exams.filter(e => e.className === student.assignedClass);

  // Stats calculation
  const totalInvoiced = studentInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = studentPayments.reduce((sum, pay) => sum + pay.amountPaid, 0);
  const feeBalance = Math.max(0, totalInvoiced - totalPaid);

  // States for modals
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('M-Pesa');
  const [phoneNumber, setPhoneNumber] = useState('0712345678');
  const [personalEmail, setPersonalEmail] = useState(student.email || 'student@rhti.local');
  const [passwordState, setPasswordState] = useState('●●●●●●●●');

  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingRoom, setBookingRoom] = useState(false);

  // Coursework appraisal feedback form state
  const [evaluationFeedback, setEvaluationFeedback] = useState<Record<string, number>>({});
  const [completedEvaluations, setCompletedEvaluations] = useState<string[]>([]);

  // Enquiries thread state
  const [enquirySubject, setEnquirySubject] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquiryTickets, setEnquiryTickets] = useState<{id: string; subject: string; message: string; date: string; status: string}[]>([
    { id: 'ENQ-901', subject: 'Hostel Slot Key Retrieval', message: 'I reserved Hall 4 Cubicle but have not obtained physical key passcode.', date: '2026-06-03', status: 'In Process' },
    { id: 'ENQ-812', subject: 'STK Settle Surcharge Dispute', message: 'M-pesa code clearance updated on wallet but nominal roll still has warning.', date: '2026-05-28', status: 'Resolved' }
  ]);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handlePayInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPayModalOpen(true);
  };

  const executePayment = () => {
    if (!selectedInvoice) return;
    setPaying(true);
    setTimeout(() => {
      const payment: Payment = {
        id: 'PAY_' + Math.floor(Math.random() * 100000),
        receiptNumber: 'RCPT-' + Math.floor(100000 + Math.random() * 900000),
        studentId: student.id,
        studentRegNumber: student.registrationNumber,
        invoiceId: selectedInvoice.id,
        amountPaid: selectedInvoice.amount,
        paymentDate: new Date().toISOString().split('T')[0],
        method: paymentMethod,
        status: 'cleared'
      };
      
      onAddPayment(payment);
      onUpdateInvoice(selectedInvoice.id, 'paid');
      
      setPaying(false);
      setPayModalOpen(false);
      setSelectedInvoice(null);
      showToast(`Payment of Kes ${payment.amountPaid.toLocaleString()} processed successfully via STK push receipt code ${payment.receiptNumber}!`);
    }, 1200);
  };

  const executeRoomBooking = (room: Room) => {
    setSelectedRoom(room);
    setBookingRoom(true);
    setTimeout(() => {
      const newBooking: HostelBooking = {
        id: 'BKG_' + Math.floor(Math.random() * 1000),
        studentId: student.id,
        studentRegNumber: student.registrationNumber,
        roomNumber: room.roomNumber,
        bookingDate: new Date().toISOString().split('T')[0],
        status: 'active',
        paymentStatus: 'paid',
        amount: room.hostelFee || 8500
      };

      const feeInvoice: Invoice = {
        id: 'INV_' + Math.floor(Math.random() * 1000),
        invoiceNumber: 'INV/HSTL/' + Math.floor(1000 + Math.random() * 9000),
        studentId: student.id,
        studentRegNumber: student.registrationNumber,
        studentName: student.studentName,
        programCode: student.programCode,
        amount: room.hostelFee || 8500,
        dueDate: new Date().toISOString().split('T')[0],
        status: 'paid'
      };

      const roomPayment: Payment = {
        id: 'PAY_' + Math.floor(Math.random() * 100000),
        receiptNumber: 'RCPT-' + Math.floor(200000 + Math.random() * 800500),
        studentId: student.id,
        studentRegNumber: student.registrationNumber,
        invoiceId: feeInvoice.id,
        amountPaid: room.hostelFee || 8500,
        paymentDate: new Date().toISOString().split('T')[0],
        method: 'SMIS Wallet',
        status: 'cleared'
      };

      onAddHostelBooking(newBooking);
      onUpdateRoom(room.roomNumber, { status: 'full' });
      onAddPayment(roomPayment);

      setBookingRoom(false);
      setSelectedRoom(null);
      showToast(`Hostel Room Cubicle ${newBooking.roomNumber} allocated and paid invoice has compiled.`, 'success');
    }, 1000);
  };

  const handleClearanceApplication = () => {
    onAddClearanceRequest(student.id, student.studentName, student.registrationNumber);
    showToast('Sent electronic clearance file request to Deans Office board.', 'success');
  };

  const handleGraduationApplication = () => {
    onApplyGraduation(student.id);
    showToast('Congregation Board registration for graduation filed!', 'success');
  };

  const triggerDocUpload = (type: 'id' | 'certs' | 'photo') => {
    onUploadStudentDocument(student.id, type);
    showToast(`Successfully registered and updated ${type === 'id' ? 'ID Card Copy' : type === 'certs' ? 'Secondary School Certificate' : 'Passport Portrait Photo'} in SMIS.`, 'success');
  };

  const calculateGPA = () => {
    if (studentResults.length === 0) return 3.45;
    const sum = studentResults.reduce((acc, current) => {
      if (current.grade === 'A') return acc + 4.0;
      if (current.grade === 'B') return acc + 3.0;
      if (current.grade === 'C') return acc + 2.0;
      if (current.grade === 'D') return acc + 1.0;
      return acc;
    }, 0);
    return Number((sum / studentResults.length).toFixed(2));
  };

  const moduleResultRows = studentModules.map((module) => {
    const results = studentResults.filter((result) => result.moduleCode === module.code);
    const catResults = results.filter((result) => exams.find((exam) => exam.id === result.examId)?.examType === 'CAT');
    const finalExam = results.find((result) => exams.find((exam) => exam.id === result.examId)?.examType === 'Final Exam') || results.find((result) => exams.find((exam) => exam.id === result.examId)?.examType !== 'CAT');
    const catAverage = catResults.length
      ? catResults.reduce((sum, result) => {
          const exam = exams.find((item) => item.id === result.examId);
          const total = exam?.totalMarks || 30;
          return sum + ((result.marks / total) * 100);
        }, 0) / catResults.length
      : 0;
    const examPercent = finalExam
      ? (finalExam.marks / (exams.find((exam) => exam.id === finalExam.examId)?.totalMarks || 100)) * 100
      : 0;
    const finalScore = Number(((catAverage * 0.3) + (examPercent * 0.7)).toFixed(1));
    const grade = finalScore >= 80 ? 'A' : finalScore >= 70 ? 'B' : finalScore >= 50 ? 'C' : finalScore >= 40 ? 'D' : 'E';
    const verdict = finalScore >= 40 ? 'Pass' : 'Fail';

    return { module, catAverage, examPercent, finalScore, grade, verdict, hasResults: results.length > 0 };
  });

  const profileCompleteness = () => {
    let score = 30;
    if (student.documentStatus.idUploaded) score += 25;
    if (student.documentStatus.certificatesUploaded) score += 25;
    if (student.documentStatus.photoUploaded) score += 20;
    return score;
  };

  // Nav actions
  const selectMainTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    // Auto-select corresponding sub-tabs as shown in the RHTI screenshot
    if (tab === 'home') setActiveSubTab('profile');
    else if (tab === 'fees') setActiveSubTab('statement');
    else if (tab === 'timetable') setActiveSubTab('weekly');
    else if (tab === 'registration') setActiveSubTab('units');
    else if (tab === 'results') setActiveSubTab('grades');
    else if (tab === 'bookroom') setActiveSubTab('booking');
    else if (tab === 'enquiries') setActiveSubTab('tickets');
  };

  // Profile Form updates
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('SMIS Student profile record parameters updated successfully.');
  };

  // Coursework Evaluation submission
  const handleEvaluationSubmit = (moduleCode: string) => {
    setCompletedEvaluations(prev => [...prev, moduleCode]);
    showToast(`Module Evaluation submitted to academic registry for module: ${moduleCode}`, 'success');
  };

  // Enquiry submit
  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquirySubject || !enquiryMessage) return;
    const newEnq = {
      id: 'ENQ-' + Math.floor(100 + Math.random() * 900),
      subject: enquirySubject,
      message: enquiryMessage,
      date: new Date().toISOString().split('T')[0],
      status: 'In Process'
    };
    setEnquiryTickets(prev => [newEnq, ...prev]);
    setEnquirySubject('');
    setEnquiryMessage('');
    showToast('Support enquiry ticket filed at ICT / Registry center.', 'success');
  };

  return (
    <div className="min-h-screen bg-[#f8f8f0] text-[#2C3E50] font-sans antialiased p-2 md:p-6 select-none">
      
      {/* Toast alerts */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#2C3E50] text-[#FFFFFF] px-6 py-3 border border-[#34495E] shadow-xl flex items-center space-x-3 text-xs font-bold rounded">
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-[#2ECC71]" /> : <AlertCircle className="h-4 w-4 text-[#E74C3C]" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* CENTRAL PLATFORM WRAPPER PAGE */}
      <div className="school-portal-shell max-w-6xl mx-auto bg-white border border-[#BDC3C7] shadow-xl rounded-md overflow-hidden flex flex-col p-4 md:p-8 space-y-4">
        
        {/* LOGO & HEADING SECTION - AS SEEN IN THE RHTI INTEGRATED SCREENSHOT */}
        <div className="flex items-center justify-start border-b border-zinc-200 pb-3">
          <img 
            src="/logo/rhti-logo.png" 
            alt="Radiant Hospital Training Institute Logo" 
            className="h-14 object-contain"
          />
        </div>

        {/* RECTANGULAR FOLDER TABS - MATCHES SCREENTSHOT TAB STYLING PRODUCING BULLET ACCENTS */}
        <div className="flex flex-wrap gap-0.5 mt-2 border-b border-[#7E8B92] pb-[1px]">
          {[
            { id: 'home', label: 'Home' },
            { id: 'fees', label: 'Fees' },
            { id: 'timetable', label: 'Timetables' },
            { id: 'registration', label: 'Module Registration' },
            { id: 'results', label: 'Results' },
            { id: 'bookroom', label: 'Book Room' },
            { id: 'enquiries', label: 'Enquiries' },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => selectMainTab(tab.id as any)}
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
            onClick={onLogout}
            className="ml-auto bg-[#E74C3C] hover:bg-[#C0392B] text-white px-2.5 py-1 rounded-t text-[10px] uppercase font-bold outline-none whitespace-nowrap"
          >
            Logout
          </button>
        </div>

        {/* SUB-TAB NAVIGATIONAL BAR STRIP - MATCHES BLUE ACCENTS FROM THE SCREENSHOT */}
        <div className="bg-primary/10 border-b border-primary/30 px-4 py-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-slate-900 font-medium select-none shadow-sm rounded-b">
          
          {/* Dynamically query corresponding RHTI sub-links with bullet divider dot indicators */}
          {activeTab === 'home' && (
            <>
              <span className={`cursor-pointer ${activeSubTab === 'profile' ? 'font-bold text-dark underline underline-offset-2' : 'hover:underline text-blue-800'}`} onClick={() => setActiveSubTab('profile')}>• My profile</span>
              <span className={`cursor-pointer ${activeSubTab === 'student-id' ? 'font-bold text-dark underline underline-offset-2' : 'hover:underline text-blue-800'}`} onClick={() => setActiveSubTab('student-id')}>• Student ID</span>
              <span className={`cursor-pointer ${activeSubTab === 'password' ? 'font-bold text-dark underline underline-offset-2' : 'hover:underline text-blue-800'}`} onClick={() => setActiveSubTab('password')}>• Change Password</span>
              <span className={`cursor-pointer ${activeSubTab === 'clearance' ? 'font-bold text-dark underline underline-offset-2' : 'hover:underline text-blue-800'}`} onClick={() => setActiveSubTab('clearance')}>• Clearance Status</span>
              <span className={`cursor-pointer ${activeSubTab === 'tracking' ? 'font-bold text-dark underline underline-offset-2' : 'hover:underline text-blue-800'}`} onClick={() => setActiveSubTab('tracking')}>• Academic Tracking</span>
            </>
          )}

          {activeTab === 'fees' && (
            <>
              <span className={`cursor-pointer ${activeSubTab === 'statement' ? 'font-bold text-dark underline underline-offset-2' : 'hover:underline text-blue-800'}`} onClick={() => setActiveSubTab('statement')}>• Fee Statement</span>
              <span className={`cursor-pointer ${activeSubTab === 'history' ? 'font-bold text-dark underline underline-offset-2' : 'hover:underline text-blue-800'}`} onClick={() => setActiveSubTab('history')}>• Payment History</span>
            </>
          )}

          {activeTab === 'timetable' && (
            <>
              <span className={`cursor-pointer ${activeSubTab === 'weekly' ? 'font-bold text-dark underline underline-offset-2' : 'hover:underline text-blue-800'}`} onClick={() => setActiveSubTab('weekly')}>• Weekly Class Timetable</span>
            </>
          )}

          {activeTab === 'registration' && (
            <>
              <span className={`cursor-pointer ${activeSubTab === 'units' ? 'font-bold text-dark underline underline-offset-2' : 'hover:underline text-blue-800'}`} onClick={() => setActiveSubTab('units')}>• Registered Units list</span>
              <span className={`cursor-pointer ${activeSubTab === 'materials' ? 'font-bold text-dark underline underline-offset-2' : 'hover:underline text-blue-800'}`} onClick={() => setActiveSubTab('materials')}>• Learning Resources</span>
            </>
          )}

          {activeTab === 'results' && (
            <>
              <span className={`cursor-pointer ${activeSubTab === 'grades' ? 'font-bold text-dark underline underline-offset-2' : 'hover:underline text-blue-800'}`} onClick={() => setActiveSubTab('grades')}>• Module Grade Sheet</span>
              <span className={`cursor-pointer ${activeSubTab === 'transcript' ? 'font-bold text-dark underline underline-offset-2' : 'hover:underline text-blue-800'}`} onClick={() => setActiveSubTab('transcript')}>• Certified Transcripts</span>
              <span className={`cursor-pointer ${activeSubTab === 'graduation' ? 'font-bold text-dark underline underline-offset-2' : 'hover:underline text-blue-800'}`} onClick={() => setActiveSubTab('graduation')}>• Graduation Status</span>
            </>
          )}

          {activeTab === 'bookroom' && (
            <>
              <span className={`cursor-pointer ${activeSubTab === 'booking' ? 'font-bold text-dark underline underline-offset-2' : 'hover:underline text-blue-800'}`} onClick={() => setActiveSubTab('booking')}>• Hostel Cubicle Placement</span>
              <span className={`cursor-pointer ${activeSubTab === 'booking-status' ? 'font-bold text-dark underline underline-offset-2' : 'hover:underline text-blue-800'}`} onClick={() => setActiveSubTab('booking-status')}>• Core Assignment status</span>
            </>
          )}

          {activeTab === 'enquiries' && (
            <>
              <span className={`cursor-pointer ${activeSubTab === 'tickets' ? 'font-bold text-dark underline underline-offset-2' : 'hover:underline text-blue-800'}`} onClick={() => setActiveSubTab('tickets')}>• Support Tickets thread</span>
              <span className={`cursor-pointer ${activeSubTab === 'submit-ticket' ? 'font-bold text-dark underline underline-offset-2' : 'hover:underline text-blue-800'}`} onClick={() => setActiveSubTab('submit-ticket')}>• Lodge New Enquiry</span>
            </>
          )}

        </div>

        {/* CORE CONTENT LAYOUT WINDOW */}
        <div className="bg-[#FFFFFF] p-2 md:p-6 border border-[#BDC3C7] rounded mt-2 min-h-[480px]">

          {/* DYNAMIC SCENE CONTENT */}
          
          {/* ============ TAB: HOME ============ */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              
              {/* Profile subtab */}
              {activeSubTab === 'profile' && (
                <div className="max-w-2xl">
                  <fieldset className="border border-zinc-300 p-5 rounded-md text-left bg-white">
                    <legend className="text-xs font-black text-dark bg-white px-2">Student Profile</legend>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="h-24 w-24 rounded border border-zinc-300 bg-zinc-50 flex items-center justify-center shrink-0">
                        <UserIcon className="h-10 w-10 text-zinc-300" />
                      </div>
                      <div className="grid grid-cols-1 gap-3 text-xs flex-1">
                        <div className="flex justify-between gap-4 border-b border-zinc-100 pb-2">
                          <span className="font-bold text-zinc-500">Student name</span>
                          <span className="font-bold text-zinc-900 text-right">{student.studentName}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-zinc-100 pb-2">
                          <span className="font-bold text-zinc-500">Registration number</span>
                          <span className="font-mono font-bold text-primary text-right">{student.registrationNumber}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-zinc-100 pb-2">
                          <span className="font-bold text-zinc-500">Program</span>
                          <span className="font-bold text-zinc-900 text-right">{program?.name || student.programCode}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-zinc-100 pb-2">
                          <span className="font-bold text-zinc-500">Cohort</span>
                          <span className="font-bold text-zinc-900 text-right">{student.assignedCohort}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="font-bold text-zinc-500">Email</span>
                          <span className="font-bold text-zinc-900 text-right">{student.email}</span>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ID subtab */}
              {activeSubTab === 'student-id' && (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="border-4 border-double border-[#BDC3C7] p-4 rounded-lg bg-slate-50 shadow-md">
                    <div className="w-[360px] bg-[#1E3F66] text-white rounded p-4 border border-[#526E90] space-y-4">
                      <div className="flex justify-between items-center border-b border-[#526E90] pb-2">
                        <div>
                          <h4 className="text-[10px] tracking-widest font-bold">RADIANT HOSPITAL TRAINING INSTITUTE</h4>
                          <span className="text-[8px] uppercase tracking-wider text-slate-350 block leading-none">Student Identification Badge</span>
                        </div>
                        <span className="bg-[#E74C3C] text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase">SMIS</span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="h-20 w-20 bg-white/10 rounded border-2 border-[#526E90] overflow-hidden shrink-0 flex items-center justify-center">
                          <span className="text-2xl font-black text-white">
                            {student.studentName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-left select-none truncate">
                          <h3 className="font-bold text-sm tracking-tight leading-none text-white truncate">{student.studentName}</h3>
                          <span className="block text-[10px] font-mono text-zinc-300 mt-1.5">REG NO: {student.registrationNumber}</span>
                          <span className="block text-[8px] text-[#A5C1E1] mt-1 font-bold">COHORT: {student.assignedCohort}</span>
                          <span className="inline-block mt-2 text-[8px] font-sans font-bold bg-[#2ECC71] text-zinc-950 px-2 py-0.5 rounded uppercase">Active Matric</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#526E90] flex justify-between items-center text-[9px] font-mono text-[#A5C1E1]">
                        <div>
                          <span className="block text-[7px] text-[#A5C1E1]/80">DEPARTMENT</span>
                          <span className="font-bold text-white uppercase">{program?.name || student.programCode}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[7px] text-[#A5C1E1]/80">VALID UNTIL</span>
                          <span className="font-bold text-white uppercase">DECEMBER 2027</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-505 mt-4 text-center">
                    This document card is computer generated by the SMIS system and satisfies regulatory campus identification benchmarks.
                  </p>
                </div>
              )}

              {/* Password subtab */}
              {activeSubTab === 'password' && (
                <div className="max-w-xl mx-auto">
                  <fieldset className="border border-zinc-300 p-6 rounded-md text-left bg-[#FCFCFC]">
                    <legend className="text-xs font-black text-dark bg-white px-2">Update Core registry parameters & Password</legend>
                    <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs font-sans">
                      <div className="space-y-1">
                        <label className="font-bold text-zinc-702 block">Student registration number:</label>
                        <input
                          type="text"
                          readOnly
                          value={student.registrationNumber}
                          className="w-full border border-zinc-300 p-2 bg-[#F1F2F6] font-mono font-bold text-zinc-600 rounded outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-zinc-702 block">Active cellular phone number:</label>
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full border border-zinc-350 p-2 bg-white font-mono font-bold text-zinc-802 rounded focus:border-[#526E90] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-zinc-702 block">Active personal email address:</label>
                        <input
                          type="email"
                          value={personalEmail}
                          onChange={(e) => setPersonalEmail(e.target.value)}
                          className="w-full border border-zinc-350 p-2 bg-white font-mono font-bold text-zinc-802 rounded focus:border-[#526E90] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <label className="font-bold text-zinc-750 block">Current password:</label>
                          <span className="text-[10px] text-zinc-400 font-mono">MD5 Encrypted</span>
                        </div>
                        <input
                          type="password"
                          value={passwordState}
                          onChange={(e) => setPasswordState(e.target.value)}
                          className="w-full border border-zinc-350 p-2 font-mono text-zinc-802 rounded focus:border-[#526E90] outline-none"
                        />
                      </div>

                      <div className="pt-3">
                        <button
                          type="submit"
                          className="bg-[#2C3E50] hover:bg-zinc-800 text-white font-bold uppercase py-2 px-6 rounded shadow-xs"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </fieldset>
                </div>
              )}

              {/* Clearance subtab */}
              {activeSubTab === 'clearance' && (
                <div className="space-y-4">
                  <fieldset className="border border-zinc-300 p-5 rounded-md text-left">
                    <legend className="text-xs font-black text-dark bg-white px-2">Deans Campus Clearance status reports</legend>
                    <p className="text-xs text-zinc-500 mb-4">
                      Academic regulations demand scholars obtain computer verified clearances across key faculty nodes prior to congregation dockets.
                    </p>

                    <table className="w-full border-collapse border border-zinc-300 text-xs font-sans select-none text-left">
                      <thead>
                        <tr className="bg-[#9ACCE6] text-black">
                          <th className="border border-zinc-300 p-2.5">Office</th>
                          <th className="border border-zinc-300 p-2.5">Liaison Verdict Comments</th>
                          <th className="border border-zinc-300 p-2.5">Approval Code Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-zinc-300 p-2.5 font-bold">RHTI Library</td>
                          <td className="border border-zinc-300 p-2.5 italic">{studentClearance?.libraryComments || 'No overdue return books found on log.'}</td>
                          <td className="border border-zinc-300 p-2.5">
                            {studentClearance?.libraryCleared ? (
                              <span className="bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded font-bold font-mono">APPROVED</span>
                            ) : (
                              <span className="bg-amber-100 text-amber-850 px-2 py-0.5 rounded font-bold font-mono">PENDING</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-zinc-300 p-2.5 font-bold">Registry Finance Core</td>
                          <td className="border border-zinc-300 p-2.5 italic">{studentClearance?.financeComments || 'Statement invoices balance confirmed.'}</td>
                          <td className="border border-zinc-300 p-2.5">
                            {studentClearance?.financeCleared ? (
                              <span className="bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded font-bold font-mono">APPROVED</span>
                            ) : (
                              <span className="bg-amber-100 text-amber-850 px-2 py-0.5 rounded font-bold font-mono">PENDING</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-zinc-300 p-2.5 font-bold">Academics Curriculum Dean</td>
                          <td className="border border-zinc-300 p-2.5 italic">{studentClearance?.academicComments || 'Cumulative credit parameters satisfied.'}</td>
                          <td className="border border-zinc-300 p-2.5">
                            {studentClearance?.academicCleared ? (
                              <span className="bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded font-bold font-mono">APPROVED</span>
                            ) : (
                              <span className="bg-amber-100 text-amber-850 px-2 py-0.5 rounded font-bold font-mono">PENDING</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-zinc-300 p-2.5 font-bold">Accommodation Division</td>
                          <td className="border border-zinc-350 p-2.5 italic">{studentClearance?.accommodationComments || 'Residency key checklist returned.'}</td>
                          <td className="border border-zinc-300 p-2.5">
                            {studentClearance?.accommodationCleared ? (
                              <span className="bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded font-bold font-mono">APPROVED</span>
                            ) : (
                              <span className="bg-amber-100 text-amber-850 px-2 py-0.5 rounded font-bold font-mono">PENDING</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="mt-4 pt-3 border-t border-zinc-200">
                      {!studentClearance ? (
                        <button
                          onClick={handleClearanceApplication}
                          className="bg-[#2C3E50] hover:bg-zinc-800 text-white font-bold py-2 px-5 rounded text-xs uppercase"
                        >
                          Launch Deans Clearance File
                        </button>
                      ) : (
                        <div className="p-3 bg-accent/30 border border-blue-200 text-dark text-xs font-bold font-mono rounded">
                          ✓ ACTIVE INDIVIDUAL DISCHARGE RECORD IN DEANS PANEL • CURRENT STATUS: {studentClearance.overallStatus.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </fieldset>
                </div>
              )}

              {/* Tracking subtab */}
              {activeSubTab === 'tracking' && (
                <div className="space-y-4 text-left">
                  <fieldset className="border border-zinc-300 p-5 rounded-md">
                    <legend className="text-xs font-black text-dark bg-white px-2">Academic Audit Progress Tracking</legend>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-zinc-300 text-xs font-sans text-left">
                        <thead>
                          <tr className="font-bold">
                            <th className="border border-zinc-300 p-2.5">Module</th>
                            <th className="border border-zinc-300 p-2.5">CATs Recorded</th>
                            <th className="border border-zinc-300 p-2.5">Final Exam</th>
                            <th className="border border-zinc-300 p-2.5">Final Score</th>
                            <th className="border border-zinc-300 p-2.5">Progress</th>
                          </tr>
                        </thead>
                        <tbody>
                          {moduleResultRows.map((row) => {
                            const moduleExams = studentResults.filter((result) => result.moduleCode === row.module.code);
                            const catCount = moduleExams.filter((result) => exams.find((exam) => exam.id === result.examId)?.examType === 'CAT').length;
                            const hasFinal = moduleExams.some((result) => exams.find((exam) => exam.id === result.examId)?.examType === 'Final Exam');
                            return (
                              <tr key={row.module.code} className="hover:bg-zinc-50">
                                <td className="border border-zinc-300 p-2.5 font-bold">{row.module.name}</td>
                                <td className="border border-zinc-300 p-2.5 font-mono">{catCount}</td>
                                <td className="border border-zinc-300 p-2.5">{hasFinal ? 'Recorded' : 'Pending'}</td>
                                <td className="border border-zinc-300 p-2.5 font-mono font-bold">{row.hasResults ? `${row.finalScore}%` : 'Pending'}</td>
                                <td className="border border-zinc-300 p-2.5">
                                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${row.hasResults && hasFinal ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                                    {row.hasResults && hasFinal ? 'Complete' : 'In progress'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </fieldset>
                </div>
              )}

            </div>
          )}


          {/* ============ TAB: FEES ============ */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
              
              {/* Fee statement */}
              {activeSubTab === 'statement' && (
                <div className="space-y-6 text-left font-sans">
                  <div className="space-y-4">
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs font-bold text-zinc-700">
                      Total invoiced: Kes {totalInvoiced.toLocaleString()} • Paid: Kes {totalPaid.toLocaleString()} • Balance: Kes {feeBalance.toLocaleString()}
                    </div>
                    <div className="space-y-4">
                      <fieldset className="border border-zinc-300 p-5 rounded-md">
                        <legend className="text-xs font-black text-dark bg-white px-2">Program Tuition Invoices & balance tracking</legend>
                        <p className="text-xs text-zinc-405 leading-relaxed mb-4">
                          Invoices are compiled at program registration time based on active modules layout. Pay immediately using computer integrated checkout STK Push.
                        </p>

                        <div className="space-y-3">
                          {studentInvoices.map((inv) => (
                            <div key={inv.id} className="p-3 bg-[#FCFCFC] border border-zinc-250 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs select-none">
                              <div>
                                <span className="font-mono text-[9px] text-[#2980B9] font-bold block">Ref ID: {inv.invoiceNumber}</span>
                                <span className="font-bold text-zinc-800 block text-xs">{inv.programCode} Core Anatomy Program Allocation Tuition</span>
                                <span className="text-[10px] text-zinc-400 block font-mono mt-0.5">Payment due date: {inv.dueDate}</span>
                              </div>
                              <div className="flex items-center space-x-4 shrink-0 font-sans">
                                <div className="text-right">
                                  <span className="font-bold text-slate-900 block font-mono text-sm">Kes {inv.amount.toLocaleString()}</span>
                                  <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase mt-1 border ${
                                    inv.status === 'paid' 
                                      ? 'bg-emerald-50 border-emerald-150 text-emerald-800' 
                                      : 'bg-rose-50 border-rose-150 text-rose-800 animate-pulse'
                                  }`}>
                                    {inv.status}
                                  </span>
                                </div>
                                {inv.status !== 'paid' && (
                                  <button
                                    onClick={() => handlePayInvoice(inv)}
                                    className="bg-emerald-650 hover:bg-emerald-705 text-white bg-emerald-600 hover:bg-emerald-700 font-bold uppercase text-[9px] px-3.5 py-1.5 rounded transition shadow-xs"
                                  >
                                    STK Push Pay
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </fieldset>
                    </div>

                  </div>
                </div>
              )}

              {/* Payment history */}
              {activeSubTab === 'history' && (
                <fieldset className="border border-zinc-300 p-5 rounded-md text-left">
                  <legend className="text-xs font-black text-dark bg-white px-2">Validated payment receipt logs</legend>
                  <p className="text-xs text-zinc-405 mb-4 font-sans">
                    These receipt vouchers represent modules processed and authorized by student finance operations against active outstanding fees accounts structure.
                  </p>

                  <table className="w-full border-collapse border border-zinc-300 text-xs font-sans text-left">
                    <thead>
                      <tr className="bg-[#9ACCE6] text-black font-bold">
                        <th className="border border-zinc-300 p-2.5">Receipt Voucher Number</th>
                        <th className="border border-zinc-300 p-2.5">Clearing Gateway Method</th>
                        <th className="border border-zinc-300 p-2.5">Clearing Date</th>
                        <th className="border border-zinc-300 p-2.5">Amount processed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentPayments.length > 0 ? (
                        studentPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="border border-zinc-300 p-2.5 font-mono font-bold text-zinc-901">{p.receiptNumber}</td>
                            <td className="border border-zinc-300 p-2.5 font-bold">{p.method}</td>
                            <td className="border border-zinc-300 p-2.5">{p.paymentDate}</td>
                            <td className="border border-zinc-300 p-2.5 font-mono font-bold text-[#27AE60]">+ Kes {p.amountPaid.toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="border border-zinc-30s bg-slate-50/50 p-6 text-center text-zinc-400 italic">No historical cash transactions validated in this matric user wallet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </fieldset>
              )}

              {/* Caution subtab */}
              {activeSubTab === 'caution' && (
                <div className="max-w-xl mx-auto">
                  <fieldset className="border border-zinc-300 p-6 rounded-md text-left bg-[#FCFCFC]">
                    <legend className="text-xs font-black text-dark bg-white px-2">Caution Refund registration filing portal</legend>
                    <p className="text-xs text-zinc-502 mb-4 leading-relaxed font-sans">
                      Undergraduates may register caution deposit claims evaluated against library or residency damage liabilities logs during final clearance audits.
                    </p>

                    <div className="space-y-4 text-xs font-sans">
                      <div className="p-3.5 bg-accent/30 border border-blue-200 text-blue-905 rounded">
                        <span className="font-bold block text-blue-901 uppercase tracking-wide text-[9px]">CAUTION WALLET DISCHARGE CRITERIA:</span>
                        <p className="mt-1">Claims process up to 30 academic calendar days after the Congregation board releases degree transcripts.</p>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-zinc-650 block">Current Caution fee reserve:</span>
                        <span className="font-mono text-base font-bold text-[#2C3E50] block">Kes 5,000.00</span>
                      </div>

                      <button
                        onClick={() => showToast('Caution claim recorded in registrar dashboard records.', 'success')}
                        className="bg-[#2C3E50] hover:bg-zinc-800 text-white font-bold uppercase py-2 px-5 rounded"
                      >
                        Register Refund claim
                      </button>
                    </div>
                  </fieldset>
                </div>
              )}

            </div>
          )}


          {/* ============ TAB: TIMETABLE ============ */}
          {activeTab === 'timetable' && (
            <div className="space-y-6">
              
              {/* Weekly schedule */}
              {activeSubTab === 'weekly' && (
                <fieldset className="border border-zinc-300 p-5 rounded-md text-left">
                  <legend className="text-xs font-black text-dark bg-white px-2">Live Session Schedules & Locations</legend>
                  <p className="text-xs text-zinc-405 mb-4 font-sans leading-relaxed">
                    Verify locations, timeslots, and assigned halls for your medicine cohort study sequence classrooms below. Rooms are refreshed on sem boundary updates.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-zinc-300 text-xs font-sans text-left">
                      <thead className="bg-primary text-white">
                        <tr>
                          <th className="border border-primary/40 p-2">Timetable</th>
                          <th className="border border-primary/40 p-2">Module</th>
                          <th className="border border-primary/40 p-2">Cohort</th>
                          <th className="border border-primary/40 p-2">Days</th>
                          <th className="border border-primary/40 p-2">Time</th>
                          <th className="border border-primary/40 p-2">Room</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classes.filter(c => c.programCode === student.programCode).map((cls) => (
                          <tr key={cls.name} className="hover:bg-zinc-50">
                            <td className="border border-zinc-300 p-2 font-bold">{cls.name}</td>
                            <td className="border border-zinc-300 p-2 font-mono">{cls.moduleCode || 'Assigned module'}</td>
                            <td className="border border-zinc-300 p-2">{cls.cohortName}</td>
                            <td className="border border-zinc-300 p-2">{cls.scheduleDays.join(', ')}</td>
                            <td className="border border-zinc-300 p-2 font-mono">{cls.scheduleTime}</td>
                            <td className="border border-zinc-300 p-2">{cls.roomNumber}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </fieldset>
              )}

              {/* Nominal roll */}
              {activeSubTab === 'nominal' && (
                <div className="max-w-2xl mx-auto">
                  <fieldset className="border border-zinc-300 p-5 rounded-md text-left bg-[#FCFCFC]">
                    <legend className="text-xs font-black text-dark bg-white px-2">Class Nominal Roll Registration status</legend>
                    <p className="text-xs text-zinc-405 mb-4 leading-relaxed font-sans">
                      A student's register standing in an active lecture roll depends on registry payment verification schedules compiling fully beforehand.
                    </p>

                    <div className="space-y-3 font-sans text-xs">
                      <div className="flex justify-between border-b border-zinc-200 pb-1.5">
                        <span className="font-semibold text-zinc-505">Enrolled Module Curriculum:</span>
                        <span className="font-bold text-zinc-902">{program?.name || 'Science track'}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-200 pb-1.5">
                        <span className="font-semibold text-zinc-505">RHTI registry group:</span>
                        <span className="font-bold text-zinc-902 font-mono">{student.assignedClass}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-200 pb-1.5">
                        <span className="font-semibold text-zinc-505">Academic calendar term:</span>
                        <span className="font-bold text-zinc-902 font-mono">AY 2026/2027 • SEMESTER II</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-200 pb-1.5">
                        <span className="font-semibold text-zinc-505">Core nominal roll eligibility:</span>
                        {feeBalance === 0 ? (
                          <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded font-mono text-[10px]">✓ CONFIRMED ACTIVE ELIGIBILITY</span>
                        ) : (
                          <span className="text-amber-800 font-bold bg-amber-55 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded font-mono text-[10px] animate-pulse">⚠️ NOMINAL EXCLUSION ALERT (FEE ARREARS)</span>
                        )}
                      </div>
                    </div>
                  </fieldset>
                </div>
              )}

            </div>
          )}


          {/* ============ TAB: COURSE REGISTRATION ============ */}
          {activeTab === 'registration' && (
            <div className="space-y-6">
              
              {/* Units */}
              {activeSubTab === 'units' && (
                <fieldset className="border border-zinc-300 p-5 rounded-md text-left">
                  <legend className="text-xs font-black text-dark bg-white px-2">Registered Units List</legend>
                  <p className="text-xs text-zinc-405 mb-4 leading-relaxed font-sans">
                    These modules are assigned to your program and cohort from the administration registry.
                  </p>

                  <table className="w-full border-collapse border border-zinc-300 text-xs font-sans text-left select-none">
                    <thead>
                      <tr className="bg-[#9ACCE6] text-black font-bold">
                        <th className="border border-zinc-300 p-2.5">Module Code</th>
                        <th className="border border-zinc-300 p-2.5">Module Name</th>
                        <th className="border border-zinc-300 p-2.5">Program</th>
                        <th className="border border-zinc-300 p-2.5">Registry Verdict</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentModules.map((m) => (
                        <tr key={m.code} className="hover:bg-slate-50">
                          <td className="border border-zinc-300 p-2.5 font-mono font-bold text-dark">{m.code}</td>
                          <td className="border border-zinc-300 p-2.5 font-bold">{m.name}</td>
                          <td className="border border-zinc-300 p-2.5 font-mono">{m.programCode}</td>
                          <td className="border border-zinc-300 p-2.5 font-bold uppercase text-emerald-800">ENROLLED ACTIVE</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </fieldset>
              )}

              {/* Materials */}
              {activeSubTab === 'materials' && (
                <fieldset className="border border-zinc-300 p-5 rounded-md text-left">
                  <legend className="text-xs font-black text-dark bg-white px-2">Virtual Syllabus Materials & Document store</legend>
                  <p className="text-xs text-[#7F8C8D] mb-4 font-sans leading-relaxed">
                    Download core study references, anatomical checklists, and lesson presentations compiled and assigned to your clinical track modules.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
                    {materials.map((mat) => (
                      <div key={mat.id} className="p-4 bg-[#FCFCFC] border border-zinc-200 rounded flex flex-col justify-between space-y-3">
                        <div>
                          <span className="inline-block bg-zinc-200 font-mono text-[8px] font-black px-1.5 py-0.5 rounded uppercase">{mat.materialType} file</span>
                          <h4 className="font-serif font-bold text-zinc-900 text-xs leading-snug mt-1.5">{mat.title}</h4>
                          <span className="text-[10px] text-zinc-400 block mt-1">Uploaded by: Dr. {mat.uploadedBy} • {mat.uploadDate}</span>
                        </div>
                        <div className="pt-2 border-t border-zinc-100 flex justify-end">
                          <button
                            onClick={() => showToast(`Study view requested for ${mat.title}. Loading Virtual PDF engine...`)}
                            className="bg-[#2C3E50] hover:bg-zinc-805 text-white font-bold uppercase text-[9px] px-3.5 py-1.5 rounded flex items-center space-x-1.5"
                          >
                            <FileDown className="h-3 w-3 text-white" />
                            <span>Read Document</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </fieldset>
              )}

            </div>
          )}


          {/* ============ TAB: RESULTS ============ */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              
              {/* Grades */}
              {activeSubTab === 'grades' && (
                <fieldset className="border border-zinc-300 p-5 rounded-md text-left">
                  <legend className="text-xs font-black text-dark bg-white px-2">Published Module Results marksheets</legend>
                  <p className="text-xs text-zinc-405 mb-4 leading-relaxed font-sans">
                    These exam grades compiled by the clinical boards division reflect cumulative test standing scores obtained across authorized academic year modules.
                  </p>

                  <table className="w-full border-collapse border border-zinc-300 text-xs font-sans text-left">
                    <thead>
                      <tr className="bg-primary text-white font-bold">
                        <th className="border border-zinc-300 p-2.5">Module Code</th>
                        <th className="border border-zinc-300 p-2.5">Core Syllabus Description</th>
                        <th className="border border-zinc-300 p-2.5">CAT Score (30%)</th>
                        <th className="border border-zinc-300 p-2.5">Exam Score (70%)</th>
                        <th className="border border-zinc-300 p-2.5">Final Score</th>
                        <th className="border border-zinc-300 p-2.5">Grade Verdict</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moduleResultRows.some((row) => row.hasResults) ? (
                        moduleResultRows.filter((row) => row.hasResults).map((row) => (
                          <tr key={row.module.code} className="hover:bg-slate-50">
                            <td className="border border-zinc-300 p-2.5 font-mono font-bold text-dark">{row.module.code}</td>
                            <td className="border border-zinc-300 p-2.5">{row.module.name}</td>
                            <td className="border border-zinc-300 p-2.5 font-mono font-bold text-zinc-901">{row.catAverage.toFixed(1)}%</td>
                            <td className="border border-zinc-300 p-2.5 font-mono font-bold text-zinc-901">{row.examPercent.toFixed(1)}%</td>
                            <td className="border border-zinc-300 p-2.5 font-mono font-black text-primary">{row.finalScore}%</td>
                            <td className="border border-zinc-300 p-2.5">
                              <span className={`px-2.5 py-0.5 rounded font-bold font-mono ${
                                row.grade === 'A' ? 'bg-emerald-50 text-emerald-805' :
                                row.grade === 'B' ? 'bg-indigo-50 text-indigo-805' :
                                'bg-teal-50 text-teal-805'
                              }`}>
                                {row.grade} ({row.verdict.toUpperCase()})
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="border border-zinc-3b p-6 text-center text-zinc-400 italic">No published marks record files found in this matric cohort user.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </fieldset>
              )}

              {/* Certified transcripts */}
              {activeSubTab === 'transcript' && (
                <div className="max-w-xl mx-auto">
                  <fieldset className="border border-zinc-300 p-6 rounded-md text-left bg-[#FCFCFC]">
                    <legend className="text-xs font-black text-dark bg-white px-2">Certified Transcript Downloader client</legend>
                    <p className="text-xs text-[#7F8C8D] leading-relaxed mb-4 font-sans">
                      Requesting certified transcript records compiles results directly across all academic rosters, complete with ICT security stamps and registry digital signatures.
                    </p>

                    <table className="w-full border-collapse border border-zinc-300 text-xs font-sans text-left mb-4">
                      <thead>
                        <tr className="bg-[#9ACCE6] text-black">
                          <th className="border border-zinc-300 p-2">Roster Session Rank</th>
                          <th className="border border-zinc-300 p-2">Grade Standing</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-zinc-300 p-2 font-bold">Clinical Medicine Year II</td>
                          <td className="border border-zinc-300 p-2 font-mono font-extrabold text-blue-901">{studentResults[0]?.grade || 'Pending'}</td>
                        </tr>
                      </tbody>
                    </table>

                    <button
                      onClick={() => showToast(`Transcript compiled as secure PDF representation. Generated document code: RHTI_TRANS_${student.id}.pdf`)}
                      className="bg-[#2C3E50] hover:bg-zinc-800 text-white font-bold uppercase text-[9px] px-4 py-2 rounded shadow-xs"
                    >
                      Compile Certified PDF Representation
                    </button>
                  </fieldset>
                </div>
              )}

              {/* Graduation status */}
              {activeSubTab === 'graduation' && (
                <div className="max-w-xl mx-auto">
                  <fieldset className="border border-zinc-300 p-6 rounded-md text-left bg-zinc-50 border-double border-4">
                    <legend className="text-xs font-black text-dark bg-white px-2">Graduation Congregation Auditing status</legend>
                    <p className="text-xs text-zinc-502 leading-relaxed mb-4 font-sans">
                      Verify your eligibility for inclusion in the upcoming graduation docket list below. Prior node clearances must compile successfully.
                    </p>

                    <div className="space-y-3 font-sans text-xs">
                      <div className="p-3 bg-[#FCFCFC] border border-zinc-200 rounded space-y-1">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase">Audit standing files status:</span>
                        {studentClearance?.overallStatus === 'cleared' ? (
                          <span className="font-extrabold text-emerald-800 block">✓ All Institutional node clearances resolved.</span>
                        ) : (
                          <span className="font-extrabold text-amber-800 block">⚠️ Node clearances pending resolution.</span>
                        )}
                      </div>

                      <div className="pt-2">
                        {studentGraduation ? (
                          <div className="bg-[#2C3E50] text-[#FFFFFF] p-4 rounded font-serif space-y-2">
                            <span className="text-orange-300 font-black text-[9px] uppercase tracking-wider block">✓ CONGREGATION CONFIRMATION VOUCHER</span>
                            <p className="text-xs italic">
                              {studentGraduation.overallStatus === 'graduated'
                                ? `Award Standing: ${studentGraduation.graduationClass}. certified Certificate number registry: ${studentGraduation.certificateNumber}`
                                : `Candidatureship submitted. Review and degree audits proceeding inside board desks.`}
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={handleGraduationApplication}
                            disabled={!(studentClearance?.overallStatus === 'cleared')}
                            className="bg-[#2C3E50] hover:bg-zinc-800 disabled:opacity-40 text-white font-bold uppercase py-2 px-5 rounded w-full transition"
                          >
                            File Graduation Request Claim
                          </button>
                        )}
                      </div>
                    </div>
                  </fieldset>
                </div>
              )}

            </div>
          )}


          {/* ============ TAB: BOOK ROOM ============ */}
          {activeTab === 'bookroom' && (
            <div className="space-y-6 text-left font-sans">
              
              {/* Cubicle placements list */}
              {activeSubTab === 'booking' && (
                <div>
                  <fieldset className="border border-zinc-300 p-5 rounded-md">
                    <legend className="text-xs font-black text-dark bg-white px-2">School Accommodation</legend>
                    <p className="text-xs text-zinc-403 leading-relaxed mb-4">
                      Allocation of cubicles is structured automatically against dynamic tuition wallet reserves. Confirm availability before reserving slots.
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-zinc-300 text-xs font-sans text-left">
                        <thead>
                          <tr className="font-bold">
                            <th className="border border-zinc-300 p-2.5">Accommodation</th>
                            <th className="border border-zinc-300 p-2.5">Status</th>
                            <th className="border border-zinc-300 p-2.5">Payment</th>
                            <th className="border border-zinc-300 p-2.5">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rooms.filter(r => r.type === 'hostel').map((room) => {
                            const allocatedBooking = hostelBookings.find(b => b.roomNumber === room.roomNumber && ['active', 'approved'].includes(b.status));
                            const isReserved = studentBookings.find(b => b.roomNumber === room.roomNumber && ['active', 'approved'].includes(b.status));
                            const isAvailable = !allocatedBooking && room.status === 'available';
                            return (
                              <tr key={room.roomNumber} className="hover:bg-zinc-50">
                                <td className="border border-zinc-300 p-2.5 font-bold">{room.roomNumber}</td>
                                <td className="border border-zinc-300 p-2.5">
                                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${isAvailable ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                                    {isAvailable ? 'Available' : 'Allocated'}
                                  </span>
                                </td>
                                <td className="border border-zinc-300 p-2.5 font-bold">{isReserved ? 'Paid' : 'Not paid'}</td>
                                <td className="border border-zinc-300 p-2.5">
                                  {isReserved ? (
                                    <span className="text-emerald-700 font-bold">Allocated to you</span>
                                  ) : !hasAllocatedAccommodation && isAvailable ? (
                                    <button
                                      onClick={() => executeRoomBooking(room)}
                                      className="bg-[#2C3E50] hover:bg-zinc-800 text-white font-bold uppercase text-[9px] px-3.5 py-1.5 rounded transition"
                                    >
                                      STK Pay
                                    </button>
                                  ) : (
                                    <span className="text-zinc-400 italic font-semibold">{hasAllocatedAccommodation ? 'Already allocated' : 'Unavailable'}</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </fieldset>
                </div>
              )}

              {/* Core assignment status */}
              {activeSubTab === 'booking-status' && (
                <div className="max-w-xl mx-auto">
                  <fieldset className="border border-zinc-300 p-5 rounded-md">
                    <legend className="text-xs font-black text-dark bg-white px-2">Active hostel allocation histories</legend>
                    <div className="overflow-x-auto text-xs">
                      {studentBookings.length > 0 ? (
                        <table className="w-full border-collapse border border-zinc-300 text-left">
                          <thead>
                            <tr className="font-bold">
                              <th className="border border-zinc-300 p-2.5">Accommodation</th>
                              <th className="border border-zinc-300 p-2.5">Status</th>
                              <th className="border border-zinc-300 p-2.5">Payment</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentBookings.slice(0, 1).map((b) => (
                              <tr key={b.id}>
                                <td className="border border-zinc-300 p-2.5 font-bold">{b.roomNumber}</td>
                                <td className="border border-zinc-300 p-2.5">{b.status}</td>
                                <td className="border border-zinc-300 p-2.5 font-bold text-emerald-700">{b.paymentStatus || 'paid'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-6 bg-slate-50/50 text-center text-zinc-451 italic">No physical housing slot coordinates assigned in active matric register records.</div>
                      )}
                    </div>
                  </fieldset>
                </div>
              )}

            </div>
          )}


          {/* ============ TAB: ENQUIRIES ============ */}
          {activeTab === 'enquiries' && (
            <div className="space-y-6 text-left font-sans">
              
              {/* Tickets */}
              {activeSubTab === 'tickets' && (
                <fieldset className="border border-zinc-300 p-5 rounded-md text-left bg-[#FCFCFC]">
                  <legend className="text-xs font-black text-dark bg-white px-2">ICT Center Helpdesk support thread</legend>
                  <p className="text-xs text-zinc-405 mb-4 leading-relaxed font-sans">
                    Monitor progress or liaison responses of filed queries with the RHTI client support core desks below.
                  </p>

                  <div className="space-y-3 text-xs">
                    {enquiryTickets.map((enq) => (
                      <div key={enq.id} className="p-4 bg-white border border-zinc-250 rounded space-y-2">
                        <div className="flex justify-between items-center border-b border-dashed border-zinc-200 pb-1.5">
                          <span className="font-bold text-[#1F40AF] font-mono">{enq.id}: {enq.subject}</span>
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[8.5px] uppercase ${
                            enq.status === 'Resolved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' : 'bg-amber-50 text-amber-800 border border-amber-150'
                          }`}>
                            {enq.status}
                          </span>
                        </div>
                        <p className="text-zinc-650 leading-relaxed italic">"{enq.message}"</p>
                        <span className="block text-[10px] text-zinc-400 font-mono font-bold">Filed date: {enq.date} • Liaison: ICT Admin Nairobi</span>
                      </div>
                    ))}
                  </div>
                </fieldset>
              )}

              {/* Submit Ticket */}
              {activeSubTab === 'submit-ticket' && (
                <div className="max-w-xl mx-auto">
                  <fieldset className="border border-zinc-300 p-6 rounded-md text-left bg-[#FCFCFC]">
                    <legend className="text-xs font-black text-dark bg-white px-2">Lodge Helpdesk Enquiry</legend>
                    <form onSubmit={handleEnquirySubmit} className="space-y-4 text-xs font-sans">
                      <div className="space-y-1">
                        <label className="font-bold text-zinc-702 block">Subject category of enquiry:</label>
                        <select
                          required
                          value={enquirySubject}
                          onChange={(e) => setEnquirySubject(e.target.value)}
                          className="w-full border border-zinc-300 p-2 bg-white font-bold rounded focus:border-[#526E90] outline-none"
                        >
                          <option value="">Select enquiry subject</option>
                          <option value="Fees">Fees</option>
                          <option value="Accommodation">Accommodation</option>
                          <option value="IT Support">IT Support</option>
                          <option value="Admissions">Admissions</option>
                          <option value="Exams and Results">Exams and Results</option>
                          <option value="Learning Materials">Learning Materials</option>
                          <option value="Clinical Rotations">Clinical Rotations</option>
                          <option value="Student Records">Student Records</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-zinc-702 block">Factual message describing issue details:</label>
                        <textarea
                          required
                          rows={4}
                          value={enquiryMessage}
                          onChange={(e) => setEnquiryMessage(e.target.value)}
                          placeholder="e.g. Mpesa code was updated under the history logs but my balance still displays Kes 25,000 tuition due alert."
                          className="w-full border border-zinc-300 p-2 bg-white rounded focus:border-[#526E90] outline-none leading-relaxed"
                        />
                      </div>

                      <div>
                        <button
                          type="submit"
                          className="bg-[#2C3E50] hover:bg-zinc-800 text-white font-bold uppercase py-2 px-6 rounded shadow-xs"
                        >
                          Submit ticket to center
                        </button>
                      </div>
                    </form>
                  </fieldset>
                </div>
              )}

            </div>
          )}

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

      </div>

      {/* PAY INV MODAL WINDOWS BOTTOM SLIDEs */}
      {payModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-[#2C3E50]/65 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-[#BDC3C7] shadow-2xl w-full max-w-md p-6 font-sans text-xs text-left">
            <div className="border-b border-zinc-200 pb-3 mb-3 text-center">
              <span className="bg-zinc-150 text-zinc-6D0 font-mono text-[9px] font-bold px-2 py-0.5 rounded leading-none">Voucher: {selectedInvoice.invoiceNumber}</span>
              <h3 className="text-xl font-bold font-serif text-zinc-900 mt-2">Kes {selectedInvoice.amount.toLocaleString()}</h3>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest pt-1 leading-none font-bold">STK push wallet settle</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-zinc-502 block">Select Payment gateway route:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-zinc-300 p-2 font-bold rounded bg-[#F8F9FA] outline-none"
                >
                  <option>M-Pesa</option>
                  <option>Bank Wire Transfer</option>
                  <option>International Card</option>
                </select>
              </div>

              {paymentMethod === 'M-Pesa' && (
                <div className="space-y-1">
                  <label className="font-bold text-zinc-502 block">M-Pesa cellular mobile number:</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full border border-zinc-350 p-2 font-mono font-bold text-zinc-800 tracking-wider rounded outline-none bg-white font-bold"
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-5">
              <button
                onClick={() => setPayModalOpen(false)}
                className="flex-1 py-2 bg-zinc-200 hover:bg-zinc-300 rounded text-black font-bold uppercase transition"
              >
                Cancel
              </button>
              <button
                onClick={executePayment}
                disabled={paying}
                className="flex-1 py-2 bg-[#27AE60] hover:bg-[#219653] disabled:opacity-40 text-white rounded font-bold uppercase transition block"
              >
                {paying ? 'Processing Push...' : 'Initiate payment'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
