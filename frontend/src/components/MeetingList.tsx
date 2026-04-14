import { Meeting } from '../types/meeting.types';
import MeetingCard from './MeetingCard';

interface Props {
  meetings: Meeting[];
  role: 'DOCTOR' | 'PATIENT';
  doctorId?: string;
  patientId?: string;
  onAccept?: (id: string, patientId: string) => void;
  onReject?: (id: string, patientId: string) => void;
  onCancel?: (id: string, doctorId: string) => void;
  emptyMessage?: string;
}

export default function MeetingList({
  meetings, role, doctorId, patientId,
  onAccept, onReject, onCancel,
  emptyMessage = 'Aucune consultation',
}: Props) {
  if (meetings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm" style={{ color: '#334155' }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {meetings.map(m => (
        <MeetingCard
          key={m.id}
          meeting={m}
          role={role}
          onAccept={onAccept && patientId
            ? () => onAccept(m.id, patientId)
            : undefined}
          onReject={onReject && patientId
            ? () => onReject(m.id, patientId)
            : undefined}
          onCancel={onCancel && doctorId
            ? () => onCancel(m.id, doctorId)
            : undefined}
        />
      ))}
    </div>
  );
}
