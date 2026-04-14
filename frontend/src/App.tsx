import { useState } from 'react';
import DoctorPage from './pages/DoctorPage';
import PatientPage from './pages/PatientPage';

type View = 'home' | 'doctor' | 'patient';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [doctorId, setDoctorId] = useState('doctor-001');
  const [doctorEmail, setDoctorEmail] = useState('doctor@sahtek.com');
  const [patientId, setPatientId] = useState('patient-001');
  const [patientEmail, setPatientEmail] = useState('patient@sahtek.com');

  if (view === 'doctor') {
    return (
      <DoctorPage
        doctorId={doctorId}
        doctorEmail={doctorEmail}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'patient') {
    return (
      <PatientPage
        patientId={patientId}
        patientEmail={patientEmail}
        onBack={() => setView('home')}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0c2a4a 50%, #0f172a 100%)' }}>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
        {/* ECG decoration */}
        <svg className="absolute bottom-0 left-0 w-full opacity-5" viewBox="0 0 1200 200" preserveAspectRatio="none">
          <polyline
            points="0,100 100,100 150,20 200,180 250,100 300,100 350,60 380,140 410,100 500,100 550,100 600,30 640,170 680,100 800,100 850,50 880,150 910,100 1200,100"
            fill="none" stroke="#0ea5e9" strokeWidth="3"
          />
        </svg>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">

        {/* Logo */}
        <div className="text-center mb-12 animate-fade-up">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="28" fill="url(#logoGrad)" opacity="0.15" />
              <path d="M14 28 C14 20 20 14 28 14 C36 14 42 20 42 28"
                stroke="#0ea5e9" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M14 28 C14 36 20 42 28 42 C36 42 42 36 42 28"
                stroke="#0ea5e9" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <polyline points="16,28 22,28 26,18 30,38 34,28 40,28"
                stroke="#0ea5e9" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="56" y2="56">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
                Sahtek <span style={{ color: '#0ea5e9' }}>Online</span>
              </h1>
              <p className="text-xs tracking-widest uppercase" style={{ color: '#64748b' }}>
                Medical consultation platform
              </p>
            </div>
          </div>

          {/* ECG line */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, #0ea5e9)' }} />
            <svg width="80" height="20" viewBox="0 0 80 20">
              <polyline points="0,10 10,10 20,2 30,18 40,10 50,10 60,5 70,15 80,10"
                fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, #0ea5e9, transparent)' }} />
          </div>
        </div>

        {/* Card */}
        <div className="w-full max-w-md animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="rounded-3xl p-8 border" style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(14,165,233,0.2)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'
          }}>
            <p className="text-center text-sm mb-6" style={{ color: '#64748b' }}>
              Mode test — sélectionnez votre rôle
            </p>

            {/* Doctor config */}
            <div className="mb-4 p-4 rounded-2xl border" style={{
              background: 'rgba(14,165,233,0.06)',
              borderColor: 'rgba(14,165,233,0.2)'
            }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{ background: 'rgba(14,165,233,0.2)' }}>
                  👨‍⚕️
                </div>
                <span className="text-sm font-semibold" style={{ color: '#0ea5e9' }}>Médecin</span>
              </div>
              <input
                className="w-full rounded-xl px-3 py-2 text-sm mb-2 outline-none text-white"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}
                value={doctorId}
                onChange={e => setDoctorId(e.target.value)}
                placeholder="Doctor ID"
              />
              <input
                className="w-full rounded-xl px-3 py-2 text-sm outline-none text-white"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}
                value={doctorEmail}
                onChange={e => setDoctorEmail(e.target.value)}
                placeholder="Doctor Email"
              />
            </div>

            {/* Patient config */}
            <div className="mb-6 p-4 rounded-2xl border" style={{
              background: 'rgba(16,185,129,0.06)',
              borderColor: 'rgba(16,185,129,0.2)'
            }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{ background: 'rgba(16,185,129,0.2)' }}>
                  👤
                </div>
                <span className="text-sm font-semibold" style={{ color: '#10b981' }}>Patient</span>
              </div>
              <input
                className="w-full rounded-xl px-3 py-2 text-sm mb-2 outline-none text-white"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                placeholder="Patient ID"
              />
              <input
                className="w-full rounded-xl px-3 py-2 text-sm outline-none text-white"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}
                value={patientEmail}
                onChange={e => setPatientEmail(e.target.value)}
                placeholder="Patient Email"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setView('doctor')}
                className="py-3 rounded-2xl font-semibold text-sm transition-all duration-200 text-white"
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  boxShadow: '0 4px 20px rgba(14,165,233,0.4)'
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                👨‍⚕️ Médecin
              </button>
              <button
                onClick={() => setView('patient')}
                className="py-3 rounded-2xl font-semibold text-sm transition-all duration-200 text-white"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 4px 20px rgba(16,185,129,0.4)'
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                👤 Patient
              </button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-xs" style={{ color: '#334155' }}>
          © 2026 Sahtek Online · Medical consultation platform
        </p>
      </div>
    </div>
  );
}
