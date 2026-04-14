import { Meeting, MeetingStatus } from '../types/meeting.types';

interface Props {
  meeting: Meeting;
  role: 'DOCTOR' | 'PATIENT';
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
}

const statusConfig: Record<MeetingStatus, { label: string; style: string }> = {
  PENDING:   { label: 'En attente',  style: 'bg-yellow-100 text-yellow-800' },
  ACCEPTED:  { label: 'Accepté',     style: 'bg-green-100 text-green-800'  },
  REJECTED:  { label: 'Refusé',      style: 'bg-red-100 text-red-800'      },
  CANCELLED: { label: 'Annulé',      style: 'bg-gray-100 text-gray-600'    },
  COMPLETED: { label: 'Terminé',     style: 'bg-blue-100 text-blue-800'    },
};

export default function MeetingCard({
  meeting, role, onAccept, onReject, onCancel,
}: Props) {
  const config = statusConfig[meeting.status];

  return (
    <div className="bg-white border rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-800">{meeting.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(meeting.startTime).toLocaleString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.style}`}>
          {config.label}
        </span>
      </div>

      {meeting.description && (
        <p className="text-sm text-gray-500 mb-3">{meeting.description}</p>
      )}

      <p className="text-xs text-gray-400 mb-3">
        {role === 'DOCTOR'
          ? `👤 Patient : ${meeting.patientEmail}`
          : `👨‍⚕️ Médecin : ${meeting.doctorEmail}`
        }
      </p>

      <div className="flex gap-2 flex-wrap">
        {role === 'PATIENT' && meeting.status === MeetingStatus.PENDING && (
          <>
            <button
              onClick={() => onAccept?.(meeting.id)}
              className="bg-green-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-green-600"
            >
              ✅ Accepter
            </button>
            <button
              onClick={() => onReject?.(meeting.id)}
              className="bg-red-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-600"
            >
              ❌ Refuser
            </button>
          </>
        )}

        {role === 'DOCTOR' &&
          [MeetingStatus.PENDING, MeetingStatus.ACCEPTED].includes(meeting.status) && (
          <button
            onClick={() => onCancel?.(meeting.id)}
            className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-300"
          >
            Annuler
          </button>
        )}

        {meeting.status === MeetingStatus.ACCEPTED && meeting.meetLink && (
          
            href={meeting.meetLink}
            target="_blank"
            rel="noreferrer"
            className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 flex items-center gap-1"
          >
            🎥 Rejoindre Google Meet
          </a>
        )}
      </div>
    </div>
  );
}