import { useState } from 'react';
import DoctorPage from './pages/DoctorPage';
import PatientPage from './pages/PatientPage';

type View = 'home' | 'doctor' | 'patient';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [doctorId, setDoctorId]   = useState('doctor-001');
  const [doctorEmail, setDoctorEmail] = useState('doctor@test.com');
  const [patientId, setPatientId] = useState('patient-001');
  const [patientEmail, setPatientEmail] = useState('patient@test.com');

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

  // Home — choisir le rôle pour tester
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🏥</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-3">MedMeet</h1>
          <p className="text-gray-400 text-sm mt-1">Mode test — sans authentification</p>
        </div>

        {/* Config Doctor */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-700 mb-2">👨‍⚕️ Médecin</p>
          <input
            className="w-full border rounded px-3 py-1.5 text-sm mb-2"
            value={doctorId}
            onChange={e => setDoctorId(e.target.value)}
            placeholder="Doctor ID"
          />
          <input
            className="w-full border rounded px-3 py-1.5 text-sm"
            value={doctorEmail}
            onChange={e => setDoctorEmail(e.target.value)}
            placeholder="Doctor Email"
          />
        </div>

        {/* Config Patient */}
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <p className="text-sm font-medium text-green-700 mb-2">👤 Patient</p>
          <input
            className="w-full border rounded px-3 py-1.5 text-sm mb-2"
            value={patientId}
            onChange={e => setPatientId(e.target.value)}
            placeholder="Patient ID"
          />
          <input
            className="w-full border rounded px-3 py-1.5 text-sm"
            value={patientEmail}
            onChange={e => setPatientEmail(e.target.value)}
            placeholder="Patient Email"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setView('doctor')}
            className="bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            👨‍⚕️ Médecin
          </button>
          <button
            onClick={() => setView('patient')}
            className="bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
          >
            👤 Patient
          </button>
        </div>
      </div>
    </div>
  );
}