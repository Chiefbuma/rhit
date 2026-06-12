"use client";

import React, { useState, useEffect, useRef } from 'react';
import { getInitialState, saveStateToLocalStorage } from './mockData';
import { AdminPortal } from './components/AdminPortal';
import { StudentPortal } from './components/StudentPortal';
import { KeyRound } from 'lucide-react';

type PortalSession = {
  userId: string;
  username: string;
  name: string;
  role: 'admin' | 'student';
  studentId?: string;
};

type AppProps = {
  initialSession?: PortalSession;
};

export default function App({ initialSession }: AppProps) {
  // Primary persistent unified application state
  const [state, setState] = useState(() => getInitialState());
  const hydrated = useRef(false);

  useEffect(() => {
    let mounted = true;
    fetch('/api/portal/state')
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (!mounted || !payload?.state) return;
        setState(payload.state);
      })
      .catch(() => {
        // Keep the imported mock state available if the API is temporarily unavailable.
      })
      .finally(() => {
        hydrated.current = true;
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Save changes to localStorage and Postgres on every state delta
  useEffect(() => {
    saveStateToLocalStorage(state);
    if (!hydrated.current) return;
    const timeout = window.setTimeout(() => {
      fetch('/api/portal/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      }).catch(() => {
        // The UI remains usable; the next successful update will resync state.
      });
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [state]);

  // Current session tracking
  const [userSession, setUserSession] = useState<PortalSession | null>(initialSession ?? null);

  // Password reset stage
  const [forceResetUser, setForceResetUser] = useState<string | null>(null); // holds username during forced reset flow
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Login Form Variables
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Custom diagnostic toaster alert inside App entry
  const [diagToast, setDiagToast] = useState<string | null>(null);

  const triggerDiagToast = (msg: string) => {
    setDiagToast(msg);
    setTimeout(() => setDiagToast(null), 3000);
  };

  // Handle Standard login dispatch
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const account = state.users.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!account || account.passwordHash !== password) {
      setLoginError('Invalid registered username/registration code or credentials passkey.');
      return;
    }

    // Checking forced reset rules
    if (account.role === 'student' && account.forcePasswordReset) {
      setForceResetUser(account.username);
      return;
    }

    // Setup session
    setUserSession({
      userId: account.id,
      username: account.username,
      name: account.name,
      role: account.role,
      studentId: account.studentId
    });

    triggerDiagToast(`Welcome back, ${account.name}! Access granted.`);
  };

  // Execute password reset overrides
  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setLoginError('Password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLoginError('Confirmation password mismatch.');
      return;
    }

    // Update credentials
    setState(prev => {
      const updatedUsers = prev.users.map(u => {
        if (u.username === forceResetUser) {
          return {
            ...u,
            passwordHash: newPassword,
            forcePasswordReset: false
          };
        }
        return u;
      });
      return { ...prev, users: updatedUsers };
    });

    // Automatically complete login for student
    const verifiedAccount = state.users.find(u => u.username === forceResetUser)!;
    setUserSession({
      userId: verifiedAccount.id,
      username: verifiedAccount.username,
      name: verifiedAccount.name,
      role: verifiedAccount.role,
      studentId: verifiedAccount.studentId
    });

    setForceResetUser(null);
    setNewPassword('');
    setConfirmPassword('');
    triggerDiagToast('Credential password initial reset successful! Welcome to the student panel.');
  };

  // State Updates from children layers inside App

  const handleUpdateInvoiceStatus = (invId: string, status: 'pending' | 'paid' | 'overdue') => {
    setState(prev => ({
      ...prev,
      invoices: prev.invoices.map(inv => inv.id === invId ? { ...inv, status } : inv)
    }));
  };

  const handleAddPayment = (newPay: any) => {
    setState(prev => ({
      ...prev,
      payments: [...prev.payments, newPay]
    }));
  };

  const handleUpdateRoomStats = (roomNumber: string, updates: any) => {
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.roomNumber === roomNumber ? { ...r, ...updates } : r)
    }));
  };

  const handleAddHostelBooking = (newBkg: any) => {
    setState(prev => ({
      ...prev,
      hostelBookings: [...prev.hostelBookings, newBkg]
    }));
  };

  const handleUpdateHostelBooking = (bkgId: string, updates: any) => {
    setState(prev => ({
      ...prev,
      hostelBookings: prev.hostelBookings.map(b => b.id === bkgId ? { ...b, ...updates } : b)
    }));
  };

  const handleAddClearanceRequest = (studentId: string, name: string, reg: string) => {
    const request: any = {
      studentId,
      studentRegNumber: reg,
      studentName: name,
      libraryCleared: false,
      libraryComments: 'Review pending',
      financeCleared: false,
      financeComments: 'Review pending',
      academicCleared: true,
      academicComments: 'Credits checked',
      accommodationCleared: false,
      accommodationComments: 'Final checkout pending keys',
      overallStatus: 'pending'
    };
    setState(prev => ({
      ...prev,
      departmentClearances: [...prev.departmentClearances, request]
    }));
  };

  const handleApplyGraduation = (studentId: string) => {
    const studentObj = state.onboardings.find(o => o.id === studentId);
    if (!studentObj) return;

    // Default grad file
    const gradRecord: any = {
      studentId,
      studentRegNumber: studentObj.registrationNumber,
      studentName: studentObj.studentName,
      programCode: studentObj.programCode,
      gpa: 3.65,
      graduationClass: 'Second Class Upper',
      overallStatus: 'pending'
    };

    setState(prev => ({
      ...prev,
      graduations: [...prev.graduations, gradRecord]
    }));
  };

  // Safe file document completion Simulator
  const handleUploadStudentDoc = (studentId: string, type: 'id' | 'certs' | 'photo') => {
    setState(prev => {
      const updatedOnboards = prev.onboardings.map(o => {
        if (o.id === studentId) {
          const nextDocs = { ...o.documentStatus };
          if (type === 'id') nextDocs.idUploaded = true;
          if (type === 'certs') nextDocs.certificatesUploaded = true;
          if (type === 'photo') nextDocs.photoUploaded = true;
          
          return {
            ...o,
            documentStatus: nextDocs
          };
        }
        return o;
      });
      return { ...prev, onboardings: updatedOnboards };
    });
  };

  const handleLogout = () => {
    setUserSession(null);
    setForceResetUser(null);
    setUsername('');
    setPassword('');
    setLoginError('');
    fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
      window.location.href = '/login';
    });
  };

  // Render core routing
  if (userSession) {
    if (userSession.role === 'admin') {
      return (
        <AdminPortal 
          state={state} 
          setAppState={setState} 
        />
      );
    } else {
      return (
        <StudentPortal
          currentStudentId={userSession.studentId || ''}
          onboards={state.onboardings}
          programs={state.programs}
          classes={state.classes}
          lecturers={state.lecturers}
          modules={state.modules}
          invoices={state.invoices}
          payments={state.payments}
          rooms={state.rooms}
          hostelBookings={state.hostelBookings}
          exams={state.exams}
          examResults={state.examResults}
          clearances={state.departmentClearances}
          graduations={state.graduations}
          materials={state.learningMaterials}
          onUpdateInvoice={handleUpdateInvoiceStatus}
          onAddPayment={handleAddPayment}
          onUpdateRoom={handleUpdateRoomStats}
          onAddHostelBooking={handleAddHostelBooking}
          onUpdateHostelBooking={handleUpdateHostelBooking}
          onAddClearanceRequest={handleAddClearanceRequest}
          onApplyGraduation={handleApplyGraduation}
          onUploadStudentDocument={handleUploadStudentDoc}
          onLogout={handleLogout}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f8f0] flex flex-col justify-center items-center p-4 text-[#2C3E50] font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-8 text-center bg-[#182848] text-white relative overflow-hidden flex flex-col items-center">
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center font-black text-xl text-white shadow-lg mb-3">
            RH
          </div>
          <h2 className="text-lg font-bold tracking-tight">Radiant Hospital Training Institute</h2>
          <p className="text-slate-300 text-xs mt-1">Please sign in from the website login page.</p>
        </div>
        <div className="p-8">
          <a
            href="/login"
            className="w-full py-2.5 bg-[#182848] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex justify-center items-center space-x-2 shadow hover:shadow-md transition"
          >
            <KeyRound className="h-4 w-4" />
            <span>Go to Login</span>
          </a>
        </div>
      </div>
    </div>
  );

}
