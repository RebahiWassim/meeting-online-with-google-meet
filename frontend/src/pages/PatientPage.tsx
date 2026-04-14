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
    [MeetingStatus.REJECTED, MeetingStatus.CANCELLED, MeetingStatus.COMPLETED].includes(m.status)
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0f172a, #0c2a4a)' }}>
      <div className="text-center">
        <div className="flex items-center gap-1 justify-center mb-3">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="w-1.5 rounded-full animate-bounce"
              style={{ height: `${16 + i * 6}px`, background: '#10b981', animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        <p className="text-sm" style={{ color: '#64748b' }}>Chargement des consultations...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0f172a, #0c2a4a)' }}>
      <div className="text-center p-6">
        <p className="text-lg mb-2" style={{ color: '#ef4444' }}>⚠️ Erreur</p>
        <p className="text-sm" style={{ color: '#64748b' }}>{error}</p>
        <button onClick={onBack} className="mt-4 text-sm" style={{ color: '#0ea5e9' }}>← Retour</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #051a2e 60%, #0f172a 100%)' }}>

      {/* Header */}
      <div className="sticky top-0 z-10" style={{
        background: 'rgba(15,23,42,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(16,185,129,0.1)'
      }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-colors hover:bg-white hover:bg-opacity-10"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              ←
            </button>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#10b981' }}>
                  Patient
                </p>
              </div>
              <p className="text-white font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
                {patientEmail.split('@')[0]}
              </p>
            </div>
          </div>

          {pending.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#f59e0b' }} />
              <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>
                {pending.length} invitation{pending.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Invitations', value: pending.length, color: '#f59e0b', icon: '🔔' },
            { label: 'À venir', value: upcoming.length, color: '#10b981', icon: '📅' },
            { label: 'Historique', value: history.length, color: '#0ea5e9', icon: '📋' },
          ].map(stat => (
            <div key={stat.label}
              className="rounded-2xl p-3 text-center"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${stat.color}22`
              }}>
              <p className="text-lg mb-1">{stat.icon}</p>
              <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                {stat.value}
              </p>
              <p className="text-xs" style={{ color: stat.color }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          {[
            { key: 'pending',  label: 'Invitations', count: pending.length },
            { key: 'upcoming', label: 'À venir', count: upcoming.length },
            { key: 'history',  label: 'Historique', count: history.length },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: tab === t.key ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                color: tab === t.key ? 'white' : '#64748b',
                boxShadow: tab === t.key ? '0 2px 12px rgba(16,185,129,0.3)' : 'none'
              }}
            >
              {t.label}
              {t.count > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    background: tab === t.key ? 'rgba(255,255,255,0.25)' : 'rgba(16,185,129,0.2)',
                    color: tab === t.key ? 'white' : '#10b981'
                  }}>
                  {t.count}
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
    </div>
  );
}
