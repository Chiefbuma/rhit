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
import { ConfirmationModal } from './ConfirmationModal';

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
  const student = onboards.find(s => s.id === currentStudentId);
  const program = programs.find(p => p.code === student?.programCode);
  
  // Derived lists
  const studentInvoices = invoices.filter(inv => inv.studentId === student?.id);
  const studentPayments = payments.filter(pay => pay.studentId === student?.id);
  const studentBookings = hostelBookings.filter(b => b.studentId === student?.id);
  const hasAllocatedAccommodation = studentBookings.some((booking) => ['active', 'approved'].includes(booking.status));
  const studentClearance = clearances.find(c => c.studentId === student?.id);
  const studentGraduation = graduations.find(g => g.studentId === student?.id);
  const studentModules = modules.filter(m => m.programCode === student?.programCode);
  const studentResults = examResults.filter(r => r.studentId === student?.id);
  const studentExams = exams.filter(e => e.className === student?.assignedClass);

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
  const [personalEmail, setPersonalEmail] = useState(student?.email || 'student@rhti.local');
  const [passwordState, setPasswordState] = useState('●●●●●●●●');

  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingRoom, setBookingRoom] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');

  // Enquiries thread state
  const [enquirySubject, setEnquirySubject] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquiryTickets, setEnquiryTickets] = useState<{id: string; subject: string; message: string; date: string; status: string}[]>([]);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const openConfirmationModal = (title: string, message: string, onConfirm: () => void) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => onConfirm);
    setIsConfirmModalOpen(true);
  };

  const handlePayInvoice = (invoice: Invoice) => {
    openConfirmationModal('Confirm Payment', `Are you sure you want to pay Kes ${invoice.amount.toLocaleString()} for invoice ${invoice.invoiceNumber}?`, () => {
        setSelectedInvoice(invoice);
        setPayModalOpen(true);
        setIsConfirmModalOpen(false);
    });
  };

  const executePayment = () => {
    if (!selectedInvoice || !student) return;
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
      showToast(`Payment of Kes ${payment.amountPaid.toLocaleString()} processed successfully!`);
    }, 1200);
  };

  const executeRoomBooking = (room: Room) => {
    if(!student) return;
    openConfirmationModal('Confirm Room Booking', `Are you sure you want to book room ${room.roomNumber}?`, () => {
        setSelectedRoom(room);
        setBookingRoom(true);
        setIsConfirmModalOpen(false);
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
        showToast(`Hostel Room ${newBooking.roomNumber} booked successfully!`, 'success');
        }, 1000);
    });
  };

  const handleClearanceApplication = () => {
    if (!student) return;
    openConfirmationModal('Confirm Clearance Application', 'Are you sure you want to apply for clearance?', () => {
        onAddClearanceRequest(student.id, student.studentName, student.registrationNumber);
        showToast('Clearance application submitted successfully.', 'success');
        setIsConfirmModalOpen(false);
    });
  };

  const handleGraduationApplication = () => {
    if (!student) return;
    openConfirmationModal('Confirm Graduation Application', 'Are you sure you want to apply for graduation?', () => {
        onApplyGraduation(student.id);
        showToast('Graduation application submitted successfully.', 'success');
        setIsConfirmModalOpen(false);
    });
  };

  const triggerDocUpload = (type: 'id' | 'certs' | 'photo') => {
    if (!student) return;
    onUploadStudentDocument(student.id, type);
    showToast(`${type === 'id' ? 'ID Card' : type === 'certs' ? 'Certificate' : 'Photo'} uploaded successfully.`, 'success');
  };

  const calculateGPA = () => {
    if (studentResults.length === 0) return 0;
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

  // Nav actions
  const selectMainTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'home') setActiveSubTab('profile');
    else if (tab === 'fees') setActiveSubTab('statement');
    else if (tab === 'timetable') setActiveSubTab('weekly');
    else if (tab === 'registration') setActiveSubTab('units');
    else if (tab === 'results') setActiveSubTab('grades');
    else if (tab === 'enquiries') setActiveSubTab('tickets');
  };

  // Profile Form updates
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    openConfirmationModal('Confirm Profile Update', 'Are you sure you want to update your profile?', () => {
        showToast('Profile updated successfully.');
        setIsConfirmModalOpen(false);
    });
  };

  // Enquiry submit
  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquirySubject || !enquiryMessage) return;
    openConfirmationModal('Confirm Enquiry Submission', 'Are you sure you want to submit this enquiry?', () => {
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
        showToast('Enquiry submitted successfully.', 'success');
        setIsConfirmModalOpen(false);
    });
  };

  if (!student) {
    return <div className="p-8 text-center">No student data found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8f8f0] text-[#2C3E50] font-sans antialiased p-2 md:p-6 select-none">
      
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#2C3E50] text-[#FFFFFF] px-6 py-3 border border-[#34495E] shadow-xl flex items-center space-x-3 text-xs font-bold rounded`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-[#2ECC71]" /> : <AlertCircle className="h-4 w-4 text-[#E74C3C]" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="school-portal-shell max-w-6xl mx-auto bg-white border border-[#BDC3C7] shadow-xl rounded-md overflow-hidden flex flex-col p-4 md:p-8 space-y-4">
        
        <div className="flex items-center justify-start border-b border-zinc-200 pb-3">
          <img 
            src="/logo/rhti-logo.png" 
            alt="Radiant Hospital Training Institute Logo" 
            className="h-14 object-contain"
          />
        </div>

        <div className="flex flex-wrap gap-0.5 mt-2 border-b border-[#7E8B92] pb-[1px]">
          {[
            { id: 'home', label: 'Home' },
            { id: 'fees', label: 'Fees' },
            { id: 'timetable', label: 'Timetables' },
            { id: 'registration', label: 'Module Registration' },
            { id: 'results', label: 'Results' },
            { id: 'bookroom', label: 'Book Room' },
            { id: 'enquiries', label: 'Enquiries' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => selectMainTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-bold uppercase transition-all whitespace-nowrap outline-none ${
                activeTab === tab.id 
                  ? 'bg-primary text-white border-t border-x border-primary rounded-t' 
                  : 'bg-dark/85 hover:bg-primary text-white rounded-t border-t border-x border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
          
          <button
            onClick={onLogout}
            className="ml-auto bg-[#E74C3C] hover:bg-[#C0392B] text-white px-2.5 py-1 rounded-t text-[10px] uppercase font-bold outline-none whitespace-nowrap"
          >
            Logout
          </button>
        </div>

        <div className="bg-gray-100 border-b border-gray-300 px-4 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-900 font-medium select-none shadow-sm rounded-b">
          {activeTab === 'home' && (
            <>
              <span className={`cursor-pointer ${activeSubTab === 'profile' ? 'font-bold text-dark underline' : 'hover:underline'}`} onClick={() => setActiveSubTab('profile')}>My Profile</span>
              <span className={`cursor-pointer ${activeSubTab === 'student-id' ? 'font-bold text-dark underline' : 'hover:underline'}`} onClick={() => setActiveSubTab('student-id')}>Student ID</span>
              <span className={`cursor-pointer ${activeSubTab === 'password' ? 'font-bold text-dark underline' : 'hover:underline'}`} onClick={() => setActiveSubTab('password')}>Change Password</span>
              <span className={`cursor-pointer ${activeSubTab === 'clearance' ? 'font-bold text-dark underline' : 'hover:underline'}`} onClick={() => setActiveSubTab('clearance')}>Clearance Status</span>
              <span className={`cursor-pointer ${activeSubTab === 'tracking' ? 'font-bold text-dark underline' : 'hover:underline'}`} onClick={() => setActiveSubTab('tracking')}>Academic Tracking</span>
            </>
          )}

          {activeTab === 'fees' && (
            <>
              <span className={`cursor-pointer ${activeSubTab === 'statement' ? 'font-bold text-dark underline' : 'hover:underline'}`} onClick={() => setActiveSubTab('statement')}>Fee Statement</span>
              <span className={`cursor-pointer ${activeSubTab === 'history' ? 'font-bold text-dark underline' : 'hover:underline'}`} onClick={() => setActiveSubTab('history')}>Payment History</span>
            </>
          )}

          {activeTab === 'timetable' && (
            <span className={`cursor-pointer ${activeSubTab === 'weekly' ? 'font-bold text-dark underline' : 'hover:underline'}`} onClick={() => setActiveSubTab('weekly')}>Weekly Class Timetable</span>
          )}

          {activeTab === 'registration' && (
             <>
              <span className={`cursor-pointer ${activeSubTab === 'units' ? 'font-bold text-dark underline' : 'hover:underline'}`} onClick={() => setActiveSubTab('units')}>Registered Units List</span>
              <span className={`cursor-pointer ${activeSubTab === 'materials' ? 'font-bold text-dark underline' : 'hover:underline'}`} onClick={() => setActiveSubTab('materials')}>Learning Resources</span>
            </>
          )}

          {activeTab === 'results' && (
            <>
              <span className={`cursor-pointer ${activeSubTab === 'grades' ? 'font-bold text-dark underline' : 'hover:underline'}`} onClick={() => setActiveSubTab('grades')}>Module Grade Sheet</span>
              <span className={`cursor-pointer ${activeSubTab === 'transcript' ? 'font-bold text-dark underline' : 'hover:underline'}`} onClick={() => setActiveSubTab('transcript')}>Certified Transcripts</span>
              <span className={`cursor-pointer ${activeSubTab === 'graduation' ? 'font-bold text-dark underline' : 'hover:underline'}`} onClick={() => setActiveSubTab('graduation')}>Graduation Status</span>
            </>
          )}

          {activeTab === 'enquiries' && (
            <>
              <span className={`cursor-pointer ${activeSubTab === 'tickets' ? 'font-bold text-dark underline' : 'hover:underline'}`} onClick={() => setActiveSubTab('tickets')}>Support Tickets</span>
              <span className={`cursor-pointer ${activeSubTab === 'submit-ticket' ? 'font-bold text-dark underline' : 'hover:underline'}`} onClick={() => setActiveSubTab('submit-ticket')}>Lodge New Enquiry</span>
            </>
          )}
        </div>

        <div className="bg-white p-2 md:p-6 border border-gray-200 rounded mt-2 min-h-[480px]">
          {activeTab === 'home' && (
            <div className="space-y-6">
              {activeSubTab === 'profile' && (
                <div className="max-w-2xl">
                  <fieldset className="border border-gray-300 p-5 rounded-md text-left bg-white">
                    <legend className="text-sm font-bold text-dark bg-white px-2 ml-4">Student Profile</legend>
                    <div className="flex flex-col sm:flex-row gap-6 p-4 items-center">
                      <div className="h-28 w-28 rounded-full border-4 border-gray-200 bg-gray-100 flex items-center justify-center shrink-0">
                        <UserIcon className="h-12 w-12 text-gray-400" />
                      </div>
                      <div className="grid grid-cols-1 gap-4 text-sm flex-1 w-full">
                        <div className="flex justify-between items-center gap-4 border-b border-gray-100 pb-3">
                          <label className="font-semibold text-gray-600">Student Name</label>
                          <span className="font-medium text-gray-800 text-right">{student.studentName}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4 border-b border-gray-100 pb-3">
                          <label className="font-semibold text-gray-600">Registration Number</label>
                          <span className="font-mono font-semibold text-primary text-right">{student.registrationNumber}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4 border-b border-gray-100 pb-3">
                          <label className="font-semibold text-gray-600">Program</label>
                          <span className="font-medium text-gray-800 text-right">{program?.name || student.programCode}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <label className="font-semibold text-gray-600">Email</label>
                          <span className="font-medium text-gray-800 text-right">{student.email}</span>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>
              )}

              {activeSubTab === 'student-id' && (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="border-4 border-double border-gray-300 p-4 rounded-lg bg-gray-50 shadow-lg">
                    <div className="w-[380px] bg-gradient-to-br from-blue-800 to-blue-900 text-white rounded-xl p-5 border-2 border-blue-700 space-y-5 shadow-2xl">
                      <div className="flex justify-between items-center border-b-2 border-blue-700/50 pb-3">
                        <div>
                          <h4 className="text-xs tracking-wider font-bold">RADIANT HOSPITAL TRAINING INSTITUTE</h4>
                          <span className="text-[9px] uppercase tracking-widest text-blue-200 block">Student Identification</span>
                        </div>
                        <span className="bg-white text-blue-900 text-xs font-bold px-3 py-1 rounded-full uppercase shadow-md">SMIS</span>
                      </div>

                      <div className="flex items-center space-x-5">
                        <div className="h-24 w-24 bg-blue-100/20 rounded-full border-4 border-blue-400 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                          <UserIcon className="h-12 w-12 text-white"/>
                        </div>
                        <div className="text-left select-none truncate">
                          <h3 className="font-bold text-lg tracking-wide leading-tight text-white truncate">{student.studentName}</h3>
                          <span className="block text-sm font-mono text-blue-200 mt-2">REG: {student.registrationNumber}</span>
                          <span className="block text-xs text-blue-300 mt-1 font-semibold">COHORT: {student.assignedCohort}</span>
                          <span className="inline-block mt-3 text-xs font-sans font-bold bg-green-500 text-white px-3 py-1 rounded-full uppercase shadow-lg">Active</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t-2 border-blue-700/50 flex justify-between items-center text-xs font-mono text-blue-200">
                        <div>
                          <span className="block text-[8px] text-blue-300/80">PROGRAM</span>
                          <span className="font-bold text-white uppercase text-sm">{program?.name || student.programCode}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[8px] text-blue-300/80">VALID UNTIL</span>
                          <span className="font-bold text-white uppercase text-sm">DEC 2027</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'password' && (
                <div className="max-w-lg mx-auto">
                  <form onSubmit={handleProfileUpdate} className="space-y-5 text-sm font-sans p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-4">
                      <label className="font-semibold text-gray-700 w-48 text-right">Registration Number</label>
                      <input type="text" readOnly value={student.registrationNumber} className="flex-1 border border-gray-300 p-2.5 bg-gray-100 font-mono text-gray-600 rounded-md outline-none" />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="font-semibold text-gray-700 w-48 text-right">Phone Number</label>
                      <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="flex-1 border border-gray-300 p-2.5 bg-white font-mono text-gray-800 rounded-md focus:border-blue-500 outline-none" />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="font-semibold text-gray-700 w-48 text-right">Email Address</label>
                      <input type="email" value={personalEmail} onChange={(e) => setPersonalEmail(e.target.value)} className="flex-1 border border-gray-300 p-2.5 bg-white font-mono text-gray-800 rounded-md focus:border-blue-500 outline-none" />
                    </div>
                    <div className="flex items-center gap-4">
                       <label className="font-semibold text-gray-700 w-48 text-right">New Password</label>
                      <input type="password" value={passwordState} onChange={(e) => setPasswordState(e.target.value)} className="flex-1 border border-gray-300 p-2.5 font-mono rounded-md focus:border-blue-500 outline-none" />
                    </div>
                    <div className="flex justify-end pt-4">
                      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase py-2.5 px-8 rounded-md shadow-md transition-transform transform hover:scale-105">Save Changes</button>
                    </div>
                  </form>
                </div>
              )}

              {activeSubTab === 'clearance' && (
                <div className="space-y-4">
                  <fieldset className="border border-gray-300 p-5 rounded-md text-left">
                    <legend className="text-sm font-bold text-dark bg-white px-2 ml-4">Administration Clearance</legend>
                    <p className="text-sm text-gray-600 mb-6">
                      Clearance from all departments is required for graduation.
                    </p>

                    <table className="w-full border-collapse text-sm font-sans">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="border-b-2 border-gray-300 p-3 text-left font-semibold text-gray-700">Department</th>
                          <th className="border-b-2 border-gray-300 p-3 text-left font-semibold text-gray-700">Comments</th>
                          <th className="border-b-2 border-gray-300 p-3 text-center font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="p-3 font-medium">Library</td>
                          <td className="p-3 italic text-gray-600">{studentClearance?.libraryComments || 'No outstanding issues.'}</td>
                          <td className="p-3 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${studentClearance?.libraryCleared ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {studentClearance?.libraryCleared ? 'CLEARED' : 'PENDING'}
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="p-3 font-medium">Finance</td>
                          <td className="p-3 italic text-gray-600">{studentClearance?.financeComments || 'All fees paid.'}</td>
                          <td className="p-3 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${studentClearance?.financeCleared ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {studentClearance?.financeCleared ? 'CLEARED' : 'PENDING'}
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="p-3 font-medium">Academics</td>
                          <td className="p-3 italic text-gray-600">{studentClearance?.academicComments || 'All academic requirements met.'}</td>
                          <td className="p-3 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${studentClearance?.academicCleared ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {studentClearance?.academicCleared ? 'CLEARED' : 'PENDING'}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Accommodation</td>
                          <td className="p-3 italic text-gray-600">{studentClearance?.accommodationComments || 'Room checkout confirmed.'}</td>
                          <td className="p-3 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${studentClearance?.accommodationCleared ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {studentClearance?.accommodationCleared ? 'CLEARED' : 'PENDING'}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="mt-6 pt-4 border-t border-gray-200 text-right">
                      {!studentClearance ? (
                        <button onClick={handleClearanceApplication} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-md text-sm uppercase shadow-md">Initiate Clearance</button>
                      ) : (
                        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 text-sm font-semibold rounded-md text-center">
                          Clearance Status: <span className="font-bold">{studentClearance.overallStatus.toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                  </fieldset>
                </div>
              )}

              {activeSubTab === 'tracking' && (
                <div className="space-y-4 text-left">
                  <fieldset className="border border-gray-300 p-5 rounded-md">
                    <legend className="text-sm font-bold text-dark bg-white px-2 ml-4">Academic Progress</legend>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm font-sans">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="p-3 text-left font-semibold text-gray-700">Module</th>
                            <th className="p-3 text-center font-semibold text-gray-700">CATs Score</th>
                            <th className="p-3 text-center font-semibold text-gray-700">Exam Score</th>
                            <th className="p-3 text-center font-semibold text-gray-700">Final Score</th>
                            <th className="p-3 text-center font-semibold text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {moduleResultRows.map((row) => (
                            <tr key={row.module.code} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="p-3 font-medium">{row.module.name}</td>
                              <td className="p-3 text-center font-mono">{row.hasResults ? `${row.catAverage.toFixed(1)}%` : '-'}</td>
                              <td className="p-3 text-center font-mono">{row.hasResults ? `${row.examPercent.toFixed(1)}%` : '-'}</td>
                              <td className="p-3 text-center font-mono font-bold text-blue-600">{row.hasResults ? `${row.finalScore}%` : '-'}</td>
                              <td className="p-3 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.hasResults ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {row.hasResults ? row.verdict : 'PENDING'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </fieldset>
                </div>
              )}
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="space-y-6">
              {activeSubTab === 'statement' && (
                <div className="space-y-6 text-left font-sans">
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                    Total Invoiced: <span className="font-bold">Kes {totalInvoiced.toLocaleString()}</span> | 
                    Total Paid: <span className="font-bold text-green-600">Kes {totalPaid.toLocaleString()}</span> | 
                    Balance: <span className="font-bold text-red-600">Kes {feeBalance.toLocaleString()}</span>
                  </div>
                  <fieldset className="border border-gray-300 p-5 rounded-md">
                    <legend className="text-sm font-bold text-dark bg-white px-2 ml-4">Fee Invoices</legend>
                    <div className="space-y-4">
                      {studentInvoices.map((inv) => (
                        <div key={inv.id} className="p-4 bg-white border border-gray-200 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sm">
                          <div>
                            <span className="font-mono text-xs text-blue-600 font-semibold">{inv.invoiceNumber}</span>
                            <p className="font-semibold text-gray-800">{inv.programCode} Program Fees</p>
                            <span className="text-xs text-gray-500">Due: {inv.dueDate}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <span className="font-bold text-lg text-gray-800">Kes {inv.amount.toLocaleString()}</span>
                              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{inv.status}</span>
                            </div>
                            {inv.status !== 'paid' && (
                              <button onClick={() => handlePayInvoice(inv)} className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase text-xs px-4 py-2 rounded-md transition shadow-md">Pay Now</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}

              {activeSubTab === 'history' && (
                <fieldset className="border border-gray-300 p-5 rounded-md text-left">
                  <legend className="text-sm font-bold text-dark bg-white px-2 ml-4">Payment History</legend>
                  <table className="w-full text-sm font-sans">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="p-3 text-left font-semibold text-gray-700">Receipt No.</th>
                        <th className="p-3 text-left font-semibold text-gray-700">Method</th>
                        <th className="p-3 text-left font-semibold text-gray-700">Date</th>
                        <th className="p-3 text-right font-semibold text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentPayments.map((p) => (
                        <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-3 font-mono font-medium text-gray-800">{p.receiptNumber}</td>
                          <td className="p-3 text-gray-700">{p.method}</td>
                          <td className="p-3 text-gray-700">{p.paymentDate}</td>
                          <td className="p-3 text-right font-mono font-bold text-green-600">Kes {p.amountPaid.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </fieldset>
              )}
            </div>
          )}

          {activeTab === 'timetable' && (
            <fieldset className="border border-gray-300 p-5 rounded-md text-left">
              <legend className="text-sm font-bold text-dark bg-white px-2 ml-4">Class Timetable</legend>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-3 text-left font-semibold text-gray-700">Class</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Module</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Days</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Time</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.filter(c => c.programCode === student.programCode).map((cls) => (
                      <tr key={cls.name} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 font-medium">{cls.name}</td>
                        <td className="p-3">{modules.find(m => m.code === cls.moduleCode)?.name || '-'}</td>
                        <td className="p-3">{cls.scheduleDays.join(', ')}</td>
                        <td className="p-3 font-mono">{cls.scheduleTime}</td>
                        <td className="p-3">{cls.roomNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </fieldset>
          )}

          {activeTab === 'registration' && (
            <div className="space-y-6">
              {activeSubTab === 'units' && (
                <fieldset className="border border-gray-300 p-5 rounded-md text-left">
                  <legend className="text-sm font-bold text-dark bg-white px-2 ml-4">Registered Units</legend>
                  <table className="w-full text-sm font-sans">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="p-3 text-left font-semibold text-gray-700">Module Code</th>
                        <th className="p-3 text-left font-semibold text-gray-700">Module Name</th>
                        <th className="p-3 text-center font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentModules.map((m) => (
                        <tr key={m.code} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-3 font-mono font-medium">{m.code}</td>
                          <td className="p-3">{m.name}</td>
                          <td className="p-3 text-center">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">ENROLLED</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </fieldset>
              )}

              {activeSubTab === 'materials' && (
                <fieldset className="border border-gray-300 p-5 rounded-md text-left">
                  <legend className="text-sm font-bold text-dark bg-white px-2 ml-4">Learning Resources</legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materials.map((mat) => (
                      <div key={mat.id} className="p-4 bg-white border border-gray-200 rounded-lg flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition-shadow">
                        <div>
                           <span className="inline-block bg-gray-200 text-gray-800 font-mono text-[10px] font-bold px-2 py-1 rounded-md uppercase">{mat.materialType}</span>
                          <h4 className="font-semibold text-gray-800 text-base mt-2">{mat.title}</h4>
                          <span className="text-xs text-gray-500 block mt-1">Uploaded by: {mat.uploadedBy}</span>
                        </div>
                        <div className="pt-3 border-t border-gray-100 text-right">
                          <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-md inline-flex items-center gap-2 transition-transform transform hover:scale-105">
                            <FileDown className="h-4 w-4" />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </fieldset>
              )}
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-6">
              {activeSubTab === 'grades' && (
                 <fieldset className="border border-gray-300 p-5 rounded-md text-left">
                  <legend className="text-sm font-bold text-dark bg-white px-2 ml-4">Exam Results</legend>
                  <table className="w-full text-sm font-sans">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="p-3 text-left font-semibold text-gray-700">Module</th>
                        <th className="p-3 text-center font-semibold text-gray-700">CAT Score</th>
                        <th className="p-3 text-center font-semibold text-gray-700">Exam Score</th>
                        <th className="p-3 text-center font-semibold text-gray-700">Final Score</th>
                        <th className="p-3 text-center font-semibold text-gray-700">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moduleResultRows.map((row) => (
                        <tr key={row.module.code} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-3 font-medium">{row.module.name}</td>
                          <td className="p-3 text-center font-mono">{row.hasResults ? `${row.catAverage.toFixed(1)}%` : '-'}</td>
                          <td className="p-3 text-center font-mono">{row.hasResults ? `${row.examPercent.toFixed(1)}%` : '-'}</td>
                          <td className="p-3 text-center font-mono font-bold text-blue-600">{row.hasResults ? `${row.finalScore}%` : '-'}</td>
                          <td className="p-3 text-center font-bold">{row.hasResults ? row.grade : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </fieldset>
              )}

              {activeSubTab === 'transcript' && (
                 <div className="max-w-md mx-auto text-center">
                   <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                     <h3 className="text-lg font-bold mb-4">Download Transcript</h3>
                     <p className="text-sm text-gray-600 mb-6">Generate a certified PDF of your academic transcript.</p>
                     <button onClick={() => showToast('Generating transcript...')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md text-sm uppercase shadow-lg transition-transform transform hover:scale-105">Generate PDF</button>
                   </div>
                </div>
              )}

              {activeSubTab === 'graduation' && (
                <div className="max-w-md mx-auto text-center">
                   <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                     <h3 className="text-lg font-bold mb-2">Graduation Status</h3>
                     {studentGraduation ? (
                       <div className="space-y-3">
                         <p className="text-sm text-gray-600">Status: <span className="font-bold text-blue-600">{studentGraduation.overallStatus}</span></p>
                         {studentGraduation.gpa > 0 && <p className="text-sm">GPA: <span className="font-bold">{studentGraduation.gpa.toFixed(2)}</span></p>}
                         {studentGraduation.graduationClass && <p className="text-sm">Class: <span className="font-bold">{studentGraduation.graduationClass}</span></p>}
                       </div>
                     ) : (
                       <p className="text-sm text-gray-600">Not yet applied for graduation.</p>
                     )}
                     {studentClearance?.overallStatus === 'cleared' && !studentGraduation && (
                       <button onClick={handleGraduationApplication} className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-md text-sm uppercase shadow-lg">Apply for Graduation</button>
                     )}
                   </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookroom' && (
            <fieldset className="border border-gray-300 p-5 rounded-md">
              <legend className="text-sm font-bold text-dark bg-white px-2 ml-4">Hostel Accommodation</legend>
              {hasAllocatedAccommodation ? (
                <div>
                  <p className="text-sm text-gray-600 mb-4">Your current room allocation:</p>
                  <table className="w-full text-sm font-sans">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="p-3 text-left font-semibold text-gray-700">Room</th>
                        <th className="p-3 text-center font-semibold text-gray-700">Status</th>
                        <th className="p-3 text-center font-semibold text-gray-700">Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentBookings.map((b) => (
                        <tr key={b.id} className="border-b border-gray-200">
                          <td className="p-3 font-medium">{b.roomNumber}</td>
                          <td className="p-3 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${b.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{b.status}</span>
                          </td>
                          <td className="p-3 text-center font-semibold text-green-600">{b.paymentStatus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">Available rooms for booking:</p>
                  <table className="w-full text-sm font-sans">
                     <thead className="bg-gray-200">
                      <tr>
                        <th className="p-3 text-left font-semibold text-gray-700">Room</th>
                        <th className="p-3 text-center font-semibold text-gray-700">Status</th>
                        <th className="p-3 text-right font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.filter(r => r.type === 'hostel' && r.status === 'available').map((room) => (
                        <tr key={room.roomNumber} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-3 font-medium">{room.roomNumber}</td>
                          <td className="p-3 text-center">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">Available</span>
                          </td>
                          <td className="p-3 text-right">
                            <button onClick={() => executeRoomBooking(room)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-md transition">Book Now</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </fieldset>
          )}

          {activeTab === 'enquiries' && (
            <div className="space-y-6">
              {activeSubTab === 'tickets' && (
                <fieldset className="border border-gray-300 p-5 rounded-md text-left">
                  <legend className="text-sm font-bold text-dark bg-white px-2 ml-4">Support Tickets</legend>
                  <div className="space-y-4">
                    {enquiryTickets.map((enq) => (
                      <div key={enq.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-blue-700 font-mono text-sm">{enq.id}: {enq.subject}</h4>
                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${enq.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{enq.status}</span>
                        </div>
                        <p className="text-sm text-gray-700 italic">"{enq.message}"</p>
                        <p className="text-xs text-gray-500 mt-2 font-mono">Date: {enq.date}</p>
                      </div>
                    ))}
                  </div>
                </fieldset>
              )}

              {activeSubTab === 'submit-ticket' && (
                <div className="max-w-lg mx-auto">
                  <form onSubmit={handleEnquirySubmit} className="space-y-5 text-sm font-sans p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-4">
                      <label className="font-semibold text-gray-700 w-32 text-right">Subject</label>
                      <select required value={enquirySubject} onChange={(e) => setEnquirySubject(e.target.value)} className="flex-1 border border-gray-300 p-2.5 bg-white rounded-md outline-none focus:border-blue-500">
                        <option value="">Select a category...</option>
                        <option>Fees</option>
                        <option>Accommodation</option>
                        <option>Exams</option>
                        <option>General</option>
                      </select>
                    </div>
                    <div className="flex items-start gap-4">
                      <label className="font-semibold text-gray-700 w-32 text-right pt-2.5">Message</label>
                      <textarea required rows={5} value={enquiryMessage} onChange={(e) => setEnquiryMessage(e.target.value)} className="flex-1 border border-gray-300 p-2.5 bg-white rounded-md outline-none focus:border-blue-500" placeholder="Describe your issue in detail..."></textarea>
                    </div>
                    <div className="flex justify-end pt-4">
                      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase py-2.5 px-8 rounded-md shadow-md">Submit</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
          © 2023 Radiant Hospital Training Institute. All Rights Reserved.
        </div>
      </div>

      {payModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 font-sans text-sm">
            <h3 className="text-xl font-bold text-center mb-2">Complete Payment</h3>
            <p className="text-center text-gray-600 mb-6">Pay <span className="font-bold">Kes {selectedInvoice.amount.toLocaleString()}</span> for invoice <span className="font-mono">{selectedInvoice.invoiceNumber}</span>.</p>
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full border border-gray-300 p-3 rounded-md bg-gray-50 outline-none">
                  <option>M-Pesa</option>
                  <option>Card</option>
                </select>
              </div>
              {paymentMethod === 'M-Pesa' && (
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Phone Number</label>
                  <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full border border-gray-300 p-3 rounded-md font-mono" />
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setPayModalOpen(false)} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-bold transition">Cancel</button>
              <button onClick={executePayment} disabled={paying} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-bold transition disabled:opacity-50">
                {paying ? 'Processing...' : 'Pay'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={isConfirmModalOpen} 
        onClose={() => setIsConfirmModalOpen(false)} 
        onConfirm={confirmAction!} 
        title={confirmTitle} 
        message={confirmMessage} 
      />

    </div>
  );
}
