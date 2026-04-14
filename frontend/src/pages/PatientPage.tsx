import { useState } from 'react';
import { usePatientMeetings } from '../hooks/useMeetings';
import MeetingList from '../components/MeetingList';
import { MeetingStatus } from '../types/meeting.types';

interface Props {
  patientId: string;
  patientEmail: string;
  onBack: () => void;
}

export default function PatientPage({ patientId, patientEmail, onBack }: Props) {
  const { meetings, loading, error, accept, reject } = usePatientMeetings(patientId);
  const [tab, setTab] = useState<'pending' | 'upcoming' | 'history'>('pending');

  const pending  = meetings.filter(m => m.status === MeetingStatus.PENDING);
  const upcoming = meetings.filter(m => m.status === MeetingStatus.ACCEPTED);
  const history  = meetings.filter(m =>
    [MeetingStatus.REJECTED, MeetingStatus.CANCELLED, MeetingStatus.COMPLETED]
      .includes(m.status)
  );

  if (loading) return <div className="text-center p-8 text-gray-400">Chargement...</div>;
  if (error)   return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-600 text-xl"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            👤 Dashboard Patient
          </h1>
          <p className="text-xs text-gray-400">{patientEmail}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        {[
          { key: 'pending',  label: `Invitations (${pending.length})` },
          { key: 'upcoming', label: `À venir (${upcoming.length})` },
          { key: 'history',  label: `Historique (${history.length})` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.label}
            {t.key === 'pending' && pending.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'pending' && (
        <MeetingList
          meetings={pending}
          role="PATIENT"
          patientId={patientId}
          onAccept={accept}
          onReject={reject}
          emptyMessage="Aucune invitation en attente"
        />
      )}
      {tab === 'upcoming' && (
        <MeetingList
          meetings={upcoming}
          role="PATIENT"
          emptyMessage="Aucune consultation à venir"
        />
      )}
      {tab === 'history' && (
        <MeetingList
          meetings={history}
          role="PATIENT"
          emptyMessage="Aucun historique"
        />
      )}
    </div>
  );
}