import { Meeting } from '../types/meeting.types';
import MeetingCard from './MeetingCard';

interface Props {
  meetings: Meeting[];
  role: 'DOCTOR' | 'PATIENT';
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  emptyMessage?: string;
}

export default function MeetingList({
  meetings, role, onAccept, onReject, onCancel,
  emptyMessage = 'Aucune consultation',
}: Props) {
  if (meetings.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-6">{emptyMessage}</p>
    );
  }

  return (
    <div>
      {meetings.map(meeting => (
        <MeetingCard
          key={meeting.id}
          meeting={meeting}
          role={role}
          onAccept={onAccept}
          onReject={onReject}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
}