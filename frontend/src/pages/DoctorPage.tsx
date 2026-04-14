import { useState } from 'react';
import { useDoctorMeetings } from '../hooks/useMeetings';
import MeetingList from '../components/MeetingList';
import CreateMeetingForm from '../components/CreateMeetingForm';
import { MeetingStatus } from '../types/meeting.types';

interface Props {
  doctorId: string;
  doctorEmail: string;
  onBack: () => void;
}

export default function DoctorPage({ doctorId, doctorEmail, onBack }: Props) {
  const { meetings, loading, error, cancel, refetch } = useDoctorMeetings(doctorId);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<'upcoming' | 'pending' | 'history'>('upcoming');

  const pending  = meetings.filter(m => m.status === MeetingStatus.PENDING);
  const upcoming = meetings.filter(m => m.status === MeetingStatus.ACCEPTED);
  const history  = meetings.filter(m =>
    [MeetingStatus.CANCELLED, MeetingStatus.COMPLETED, MeetingStatus.REJECTED]
      .includes(m.status)
  );

  if (loading) return <div className="text-center p-8 text-gray-400">Chargement...</div>;
  if (error)   return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              👨‍⚕️ Dashboard Médecin
            </h1>
            <p className="text-xs text-gray-400">{doctorEmail}</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Nouvelle
        </button>
      </div>

      {showForm && (
        <CreateMeetingForm
          doctorId={doctorId}
          doctorEmail={doctorEmail}
          onSuccess={() => { setShowForm(false); refetch(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Tabs */}
      <div className="flex border-b mb-4">
        {[
          { key: 'upcoming', label: `À venir (${upcoming.length})` },
          { key: 'pending',  label: `En attente (${pending.length})` },
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
          </button>
        ))}
      </div>

      {tab === 'upcoming' && (
        <MeetingList
          meetings={upcoming}
          role="DOCTOR"
          doctorId={doctorId}
          onCancel={cancel}
          emptyMessage="Aucune consultation à venir"
        />
      )}
      {tab === 'pending' && (
        <MeetingList
          meetings={pending}
          role="DOCTOR"
          doctorId={doctorId}
          onCancel={cancel}
          emptyMessage="Aucune invitation en attente"
        />
      )}
      {tab === 'history' && (
        <MeetingList
          meetings={history}
          role="DOCTOR"
          emptyMessage="Aucun historique"
        />
      )}
    </div>
  );
}