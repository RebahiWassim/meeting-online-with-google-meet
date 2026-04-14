import { useState } from 'react';
import { Meeting, MeetingStatus } from '../types/meeting.types';

interface Props {
  meeting: Meeting;
  role: 'DOCTOR' | 'PATIENT';
  onAccept?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
}

const statusConfig: Record<MeetingStatus, { label: string; color: string; bg: string; dot: string }> = {
  PENDING:   { label: 'En attente',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  dot: '#f59e0b' },
  ACCEPTED:  { label: 'Accepté',     color: '#10b981', bg: 'rgba(16,185,129,0.1)',  dot: '#10b981' },
  REJECTED:  { label: 'Refusé',      color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   dot: '#ef4444' },
  CANCELLED: { label: 'Annulé',      color: '#64748b', bg: 'rgba(100,116,139,0.1)', dot: '#64748b' },
  COMPLETED: { label: 'Terminé',     color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)',  dot: '#0ea5e9' },
};

function InfoModal({ meeting, role, onClose }: {
  meeting: Meeting;
  role: 'DOCTOR' | 'PATIENT';
  onClose: () => void;
}) {
  const isDoctor = role === 'DOCTOR';
  const name = isDoctor ? meeting.patientEmail : meeting.doctorEmail;
  const id = isDoctor ? meeting.patientId : meeting.doctorId;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden animate-fade-up"
        style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          border: '1px solid rgba(14,165,233,0.2)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4" style={{
          background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(6,182,212,0.1))'
        }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm hover:bg-white hover:bg-opacity-10 transition-colors"
          >
            ✕
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'rgba(14,165,233,0.2)', border: '2px solid rgba(14,165,233,0.3)' }}>
              {isDoctor ? '👤' : '👨‍⚕️'}
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#0ea5e9' }}>
                {isDoctor ? 'PATIENT' : 'MÉDECIN'}
              </p>
              <h3 className="text-white font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>
                {name.split('@')[0]}
              </h3>
              <p className="text-sm" style={{ color: '#64748b' }}>{name}</p>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-xs mb-1" style={{ color: '#64748b' }}>ID</p>
              <p className="text-sm font-mono text-white truncate">{id}</p>
            </div>
            <div className="p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-xs mb-1" style={{ color: '#64748b' }}>STATUT</p>
              <p className="text-sm font-semibold" style={{ color: statusConfig[meeting.status].color }}>
                {statusConfig[meeting.status].label}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-xs mb-1" style={{ color: '#64748b' }}>CONSULTATION</p>
            <p className="text-sm font-semibold text-white">{meeting.title}</p>
            {meeting.description && (
              <p className="text-xs mt-1" style={{ color: '#64748b' }}>{meeting.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-xs mb-1" style={{ color: '#64748b' }}>DÉBUT</p>
              <p className="text-sm text-white">
                {new Date(meeting.startTime).toLocaleDateString('fr-FR')}
              </p>
              <p className="text-xs font-semibold" style={{ color: '#0ea5e9' }}>
                {new Date(meeting.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-xs mb-1" style={{ color: '#64748b' }}>FIN</p>
              <p className="text-sm text-white">
                {new Date(meeting.endTime).toLocaleDateString('fr-FR')}
              </p>
              <p className="text-xs font-semibold" style={{ color: '#0ea5e9' }}>
                {new Date(meeting.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Meet link */}
          {meeting.status === MeetingStatus.ACCEPTED && meeting.meetLink && (
            <a
              href={meeting.meetLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-sm text-white transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                boxShadow: '0 4px 20px rgba(14,165,233,0.4)'
              }}
            >
              <span>🎥</span>
              Rejoindre Google Meet
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MeetingCard({
  meeting, role, onAccept, onReject, onCancel,
}: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const config = statusConfig[meeting.status];
  const isDoctor = role === 'DOCTOR';

  return (
    <>
      {showInfo && (
        <InfoModal meeting={meeting} role={role} onClose={() => setShowInfo(false)} />
      )}

      <div
        className="rounded-2xl mb-3 overflow-hidden transition-all duration-300 cursor-pointer"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.2)'
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(14,165,233,0.3)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px rgba(14,165,233,0.1)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,255,255,0.08)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 16px rgba(0,0,0,0.2)';
        }}
      >
        {/* Left accent bar */}
        <div className="flex">
          <div className="w-1 flex-shrink-0 rounded-l-2xl" style={{ background: config.dot }} />

          <div className="flex-1 p-4">
            {/* Top row */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-white text-sm mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {meeting.title}
                </h3>
                <div className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <p className="text-xs" style={{ color: '#64748b' }}>
                    {new Date(meeting.startTime).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })} · {new Date(meeting.startTime).toLocaleTimeString('fr-FR', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: config.bg, color: config.color }}>
                  {config.label}
                </span>
              </div>
            </div>

            {/* Interlocutor */}
            <button
              onClick={() => setShowInfo(true)}
              className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl w-full text-left transition-colors hover:bg-white hover:bg-opacity-5"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={{ background: isDoctor ? 'rgba(16,185,129,0.2)' : 'rgba(14,165,233,0.2)' }}>
                {isDoctor ? '👤' : '👨‍⚕️'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs" style={{ color: '#64748b' }}>
                  {isDoctor ? 'Patient' : 'Médecin'}
                </p>
                <p className="text-sm text-white truncate font-medium">
                  {(isDoctor ? meeting.patientEmail : meeting.doctorEmail).split('@')[0]}
                </p>
              </div>
              <span className="text-xs" style={{ color: '#0ea5e9' }}>Voir infos →</span>
            </button>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              {role === 'PATIENT' && meeting.status === MeetingStatus.PENDING && (
                <>
                  <button
                    onClick={onAccept}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all duration-200"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    ✓ Accepter
                  </button>
                  <button
                    onClick={onReject}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all duration-200"
                    style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                  >
                    ✕ Refuser
                  </button>
                </>
              )}

              {role === 'DOCTOR' &&
                [MeetingStatus.PENDING, MeetingStatus.ACCEPTED].includes(meeting.status) && (
                <button
                  onClick={onCancel}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
                  style={{ background: 'rgba(100,116,139,0.2)', color: '#94a3b8' }}
                >
                  Annuler
                </button>
              )}

              {meeting.status === MeetingStatus.ACCEPTED && meeting.meetLink && (
                <a
                  href={meeting.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                    boxShadow: '0 2px 12px rgba(14,165,233,0.3)'
                  }}
                >
                  🎥 Rejoindre Meet
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
