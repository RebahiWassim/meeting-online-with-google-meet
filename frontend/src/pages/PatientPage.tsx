import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePatientMeetings } from '../hooks/useMeetings';
import MeetingList from '../components/MeetingList';
import { MeetingStatus } from '../types/meeting.types';

export default function PatientDashboard() {
  const { user } = useAuth();
  const { meetings, loading, error, acceptMeeting, rejectMeeting } =
    usePatientMeetings(user!.id);
  const [activeTab, setActiveTab] = useState<'pending' | 'upcoming' | 'history'>('pending');

  const pending  = meetings.filter(m => m.status === MeetingStatus.PENDING);
  const upcoming = meetings.filter(m => m.status === MeetingStatus.ACCEPTED);
  const history  = meetings.filter(m =>
    [MeetingStatus.REJECTED, MeetingStatus.CANCELLED, MeetingStatus.COMPLETED]
      .includes(m.status)
  );

  const tabs = [
    { key: 'pending',  label: `Invitations (${pending.length})` },
    { key: 'upcoming', label: `À venir (${upcoming.length})` },
    { key: 'history',  label: `Historique (${history.length})` },
  ] as const;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400">Chargement...</div>
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-center p-8">{error}</div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Bonjour {user?.firstName} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {pending.length > 0
            ? `Vous avez ${pending.length} invitation(s) en attente`
            : 'Aucune nouvelle invitation'
          }
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.key === 'pending' && pending.length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'pending' && (
        <MeetingList
          meetings={pending}
          role="PATIENT"
          onAccept={acceptMeeting}
          onReject={rejectMeeting}
          emptyMessage="Aucune invitation en attente"
        />
      )}
      {activeTab === 'upcoming' && (
        <MeetingList
          meetings={upcoming}
          role="PATIENT"
          emptyMessage="Aucune consultation à venir"
        />
      )}
      {activeTab === 'history' && (
        <MeetingList
          meetings={history}
          role="PATIENT"
          emptyMessage="Aucun historique"
        />
      )}
    </div>
  );
}