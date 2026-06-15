import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Module, 
  Class, 
  Cohort, 
  Lecturer, 
  Exam, 
  ExamResult, 
  CourseFee, 
  Invoice, 
  Payment, 
  Room, 
  LearningMaterial, 
  MedicalAttachment, 
  DepartmentClearance, 
  Graduation,
  User
} from '../types';
import { DataTable, Column } from './DataTable';
import { Modal } from './Modal';
import { ConfirmationModal } from './ConfirmationModal';

type AdminTab = 'home' | 'registration' | 'academics' | 'finance' | 'students' | 'graduation' | 'resources' | 'grading' | 'users' | 'inquiries';

interface AdminPortalProps {
  onLogout?: () => void;
}

export function AdminPortal({ onLogout }: AdminPortalProps) {
  const [appState, setAppState] = useState<any>({
    users: [],
    programs: [],
    modules: [],
    cohorts: [],
    classes: [],
    lecturers: [],
    rooms: [],
    applicants: [],
    acceptances: [],
    onboardings: [],
    courseFees: [],
    invoices: [],
    payments: [],
    hostelBookings: [],
    studentAssignments: [],
    learningMaterials: [],
    medicalAttachments: [],
    exams: [],
    examResults: [],
    departmentClearances: [],
    graduations: [],
  });

  const [activeTab, setActiveTab] = useState<AdminTab>('home');
  const [subTabs, setSubTabs] = useState<Record<string, string>>({
    home: 'overview',
    registration: 'applications',
    academics: 'programs',
    finance: 'fees',
    students: 'id-management',
    graduation: 'clearance',
    resources: 'rooms'
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalType, setModalType] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');

  useEffect(() => {
    // TODO: Fetch initial data from the database
  }, []);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getSubTab = (tab: string) => subTabs[tab] || '';
  const setSubTab = (tab: string, val: string) => {
    setSubTabs(prev => ({ ...prev, [tab]: val }));
  };

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

  const openConfirmationModal = (title: string, message: string, onConfirm: () => void) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => onConfirm);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteRow = (listKey: string, idField: string, idValue: string, message: string) => {
    openConfirmationModal('Confirm Deletion', 'Are you sure you want to delete this record?', () => {
      // TODO: Add database delete logic
      triggerToast(message, 'success');
      setIsConfirmModalOpen(false);
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openConfirmationModal('Confirm Action', 'Are you sure you want to save these changes?', () => {
        // TODO: Add database create/update logic
        setIsModalOpen(false);
        setIsConfirmModalOpen(false);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans p-4 md:p-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-5 left-1/2 z-50 min-w-[300px] max-w-lg rounded-lg border-l-4 p-4 shadow-lg ${toast.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <div className="flex items-start">
              {toast.type === 'success' ? <CheckCircle2 className="h-6 w-6 text-green-600 mr-3" /> : <AlertCircle className="h-6 w-6 text-red-600 mr-3" />}
              <div className="flex-1">
                <p className={`font-bold text-sm ${toast.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{toast.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-screen-xl mx-auto bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <img src="/logo/rhti-logo.png" alt="RHTI Logo" className="h-12" />
          <button onClick={onLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold transition">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </header>

        <nav className="flex flex-wrap border-b border-gray-200 bg-gray-50">
          {[
            { id: 'home', label: 'Dashboard' },
            { id: 'registration', label: 'Registration' },
            { id: 'academics', label: 'Academics' },
            { id: 'finance', label: 'Finance' },
            { id: 'students', label: 'Students' },
            { id: 'graduation', label: 'Graduation' },
            { id: 'resources', label: 'Resources' },
            { id: 'users', label: 'Users' },
            { id: 'inquiries', label: 'Inquiries' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-4 py-3 text-sm font-semibold transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="bg-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-gray-700">
            {activeTab === 'home' && (
              <div className="flex flex-wrap gap-x-4">
                <span className={`cursor-pointer px-3 py-1 rounded-full ${getSubTab('home') === 'overview' ? 'bg-blue-100 text-blue-800 font-bold' : 'hover:bg-gray-200'}`} onClick={() => setSubTab('home', 'overview')}>Overview</span>
                <span className={`cursor-pointer px-3 py-1 rounded-full ${getSubTab('home') === 'applications' ? 'bg-blue-100 text-blue-800 font-bold' : 'hover:bg-gray-200'}`} onClick={() => setSubTab('home', 'applications')}>Applications</span>
                <span className={`cursor-pointer px-3 py-1 rounded-full ${getSubTab('home') === 'finance' ? 'bg-blue-100 text-blue-800 font-bold' : 'hover:bg-gray-200'}`} onClick={() => setSubTab('home', 'finance')}>Finance</span>
              </div>
            )}
             {activeTab === 'registration' && (
              <>
                <span className={`cursor-pointer ${getSubTab('registration') === 'applications' ? 'font-bold text-primary underline' : 'hover:underline'}`} onClick={() => setSubTab('registration', 'applications')}>Applications</span>
                <span className={`cursor-pointer ${getSubTab('registration') === 'acceptances' ? 'font-bold text-primary underline' : 'hover:underline'}`} onClick={() => setSubTab('registration', 'acceptances')}>Acceptances</span>
                <span className={`cursor-pointer ${getSubTab('registration') === 'onboardings' ? 'font-bold text-primary underline' : 'hover:underline'}`} onClick={() => setSubTab('registration', 'onboardings')}>Onboarding</span>
              </>
            )}
            {activeTab === 'academics' && (
              <>
                <span className={`cursor-pointer ${getSubTab('academics') === 'programs' ? 'font-bold text-primary underline' : 'hover:underline'}`} onClick={() => setSubTab('academics', 'programs')}>Programs</span>
                <span className={`cursor-pointer ${getSubTab('academics') === 'modules' ? 'font-bold text-primary underline' : 'hover:underline'}`} onClick={() => setSubTab('academics', 'modules')}>Modules</span>
                <span className={`cursor-pointer ${getSubTab('academics') === 'classes' ? 'font-bold text-primary underline' : 'hover:underline'}`} onClick={() => setSubTab('academics', 'classes')}>Timetables</span>
                <span className={`cursor-pointer ${getSubTab('academics') === 'cohorts' ? 'font-bold text-primary underline' : 'hover:underline'}`} onClick={() => setSubTab('academics', 'cohorts')}>Cohorts</span>
                <span className={`cursor-pointer ${getSubTab('academics') === 'lecturers' ? 'font-bold text-primary underline' : 'hover:underline'}`} onClick={() => setSubTab('academics', 'lecturers')}>Lecturers</span>
                <span className={`cursor-pointer ${getSubTab('academics') === 'exams' ? 'font-bold text-primary underline' : 'hover:underline'}`} onClick={() => setSubTab('academics', 'exams')}>Exams</span>
                <span className={`cursor-pointer ${getSubTab('academics') === 'results' ? 'font-bold text-primary underline' : 'hover:underline'}`} onClick={() => setSubTab('academics', 'results')}>Results</span>
              </>
            )}
             {activeTab === 'finance' && (
              <>
                <span className={`cursor-pointer ${getSubTab('finance') === 'fees' ? 'font-bold text-primary underline' : 'hover:underline'}`} onClick={() => setSubTab('finance', 'fees')}>Fee Structures</span>
                <span className={`cursor-pointer ${getSubTab('finance') === 'invoices' ? 'font-bold text-primary underline' : 'hover:underline'}`} onClick={() => setSubTab('finance', 'invoices')}>Invoices</span>
                <span className={`cursor-pointer ${getSubTab('finance') === 'payments' ? 'font-bold text-primary underline' : 'hover:underline'}`} onClick={() => setSubTab('finance', 'payments')}>Payments</span>
              </>
            )}
          </div>
        </div>

        <main className="p-6 space-y-6">
          {activeTab === 'home' && (
            <div>
              {getSubTab('home') === 'overview' &&
                <DataTable data={appState.programs} idKey="code" columns={[{ header: 'Program', accessor: (p) => p.name }, { header: 'Students', accessor: (p) => appState.onboardings.filter((s: Onboarding) => s.programCode === p.code).length }]} />
              }
              {getSubTab('home') === 'applications' &&
                <DataTable data={appState.applicants} idKey="id" columns={[{ header: 'Applicant', accessor: (a) => a.name }, { header: 'Program', accessor: (a) => a.programApplied }, { header: 'Status', accessor: (a) => a.status }]} />
              }
              {getSubTab('home') === 'finance' &&
                <DataTable data={appState.invoices} idKey="id" columns={[{ header: 'Student', accessor: (i) => i.studentName }, { header: 'Amount', accessor: (i) => i.amount }, { header: 'Status', accessor: (i) => i.status }]} />
              }
            </div>
          )}

          {activeTab === 'registration' && (
            <div className="space-y-6">
              {getSubTab('registration') === 'applications' && (
                <DataTable data={appState.applicants} idKey="id" columns={[{ header: 'Applicant', accessor: (a) => a.name }, { header: 'Program', accessor: (a) => a.programApplied }, { header: 'Status', accessor: (a) => a.status }]} />
              )}
              {getSubTab('registration') === 'acceptances' && (
                 <DataTable data={appState.acceptances} idKey="id" columns={[{ header: 'Applicant', accessor: (a) => a.applicantName }, { header: 'Program', accessor: (a) => a.programCode }, { header: 'Status', accessor: (a) => a.status }]} />
              )}
              {getSubTab('registration') === 'onboardings' && (
                <DataTable data={appState.onboardings} idKey="id" columns={[{ header: 'Student', accessor: (o) => o.studentName }, { header: 'Reg. No', accessor: (o) => o.registrationNumber }, { header: 'Program', accessor: (o) => o.programCode }]} />
              )}
            </div>
          )}

           {activeTab === 'academics' && (
            <div className="space-y-6">
              {getSubTab('academics') === 'programs' && (
                <DataTable data={appState.programs} idKey="code" columns={[{ header: 'Program', accessor: (p) => p.name }, { header: 'Code', accessor: (p) => p.code }]} />
              )}
               {getSubTab('academics') === 'modules' && (
                <DataTable data={appState.modules} idKey="code" columns={[{ header: 'Module', accessor: (m) => m.name }, { header: 'Program', accessor: (m) => m.programCode }]} />
              )}
            </div>
          )}

           {activeTab === 'finance' && (
            <div className="space-y-6">
              {getSubTab('finance') === 'fees' && (
                <DataTable data={appState.courseFees} idKey="id" columns={[{ header: 'Program', accessor: (cf) => cf.programCode }, { header: 'Amount', accessor: (cf) => cf.feeAmount }]} />
              )}
              {getSubTab('finance') === 'invoices' && (
                 <DataTable data={appState.invoices} idKey="id" columns={[{ header: 'Student', accessor: (i) => i.studentName }, { header: 'Amount', accessor: (i) => i.amount }, { header: 'Status', accessor: (i) => i.status }]} />
              )}
               {getSubTab('finance') === 'payments' && (
                <DataTable data={appState.payments} idKey="id" columns={[{ header: 'Student', accessor: (p) => p.studentRegNumber }, { header: 'Amount', accessor: (p) => p.amountPaid }, { header: 'Method', accessor: (p) => p.method }]} />
              )}
            </div>
          )}

        </main>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
          <form onSubmit={handleFormSubmit} className="space-y-4 p-4 bg-gray-50 rounded-b-lg">
             {(modalType === 'add_applicant' || modalType === 'edit_applicant') && (
              <div className="grid grid-cols-2 gap-4">
                <label className="font-semibold text-gray-700">Name</label>
                <input type="text" name="name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="p-2 border rounded" />
                 <label className="font-semibold text-gray-700">Program</label>
                <input type="text" name="programApplied" value={formData.programApplied || ''} onChange={(e) => setFormData({...formData, programApplied: e.target.value})} className="p-2 border rounded" />
              </div>
            )}
             {(modalType === 'add_program' || modalType === 'edit_program') && (
              <div className="grid grid-cols-2 gap-4">
                <label className="font-semibold text-gray-700">Name</label>
                <input type="text" name="name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="p-2 border rounded" />
                <label className="font-semibold text-gray-700">Code</label>
                <input type="text" name="code" value={formData.code || ''} onChange={(e) => setFormData({...formData, code: e.target.value})} className="p-2 border rounded" />
              </div>
            )}
            <div className="flex justify-end pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 mr-2 bg-gray-200 rounded-md">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
            </div>
          </form>
        </Modal>
        
        <ConfirmationModal 
            isOpen={isConfirmModalOpen} 
            onClose={() => setIsConfirmModalOpen(false)} 
            onConfirm={confirmAction!} 
            title={confirmTitle} 
            message={confirmMessage} 
        />

      </div>
    </div>
  );
}
