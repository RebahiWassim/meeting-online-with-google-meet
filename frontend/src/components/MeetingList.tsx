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
      <p className="text-gray-400 text-sm text-center py-8">{emptyMessage}</p>
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