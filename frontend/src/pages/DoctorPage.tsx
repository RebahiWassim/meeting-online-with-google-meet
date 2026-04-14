import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDoctorMeetings } from '../hooks/useMeetings';
import MeetingList from '../components/MeetingList';
import CreateMeetingForm from '../components/CreateMeetingForm';
import { MeetingStatus } from '../types/meeting.types';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { meetings, loading, error, cancelMeeting, refetch } =
    useDoctorMeetings(user!.id);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'pending' | 'history'>('upcoming');

  const pending  = meetings.filter(m => m.status === MeetingStatus.PENDING);
  const upcoming = meetings.filter(m => m.status === MeetingStatus.ACCEPTED);
  const history  = meetings.filter(m =>
    [MeetingStatus.CANCELLED, MeetingStatus.COMPLETED, MeetingStatus.REJECTED]
      .includes(m.status)
  );

  const tabs = [
    { key: 'upcoming', label: `À venir (${upcoming.length})` },
    { key: 'pending',  label: `En attente (${pending.length})` },
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Bonjour Dr. {user?.lastName} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {meetings.length} consultation(s) au total
          </p>
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
          onSuccess={() => { setShowForm(false); refetch(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

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
          </button>
        ))}
      </div>

      {activeTab === 'upcoming' && (
        <MeetingList
          meetings={upcoming}
          role="DOCTOR"
          onCancel={cancelMeeting}
          emptyMessage="Aucune consultation à venir"
        />
      )}
      {activeTab === 'pending' && (
        <MeetingList
          meetings={pending}
          role="DOCTOR"
          onCancel={cancelMeeting}
          emptyMessage="Aucune invitation en attente"
        />
      )}
      {activeTab === 'history' && (
        <MeetingList
          meetings={history}
          role="DOCTOR"
          emptyMessage="Aucun historique"
        />
      )}
    </div>
  );
}