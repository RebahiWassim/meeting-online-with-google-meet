// ReservationCard.tsx - Adapté pour utiliser Reservation et Schedule
import { Reservation, Schedule, TYPE } from '../types/reservation.types';

interface Props {
  reservation: Reservation;
  role: 'DOCTOR' | 'PATIENT';
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
}

// Configuration des statuts de réservation
const statusConfig: Record<string, { label: string; style: string }> = {
  active: { label: 'Active', style: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Annulée', style: 'bg-red-100 text-red-800' },
  pending: { label: 'En attente', style: 'bg-yellow-100 text-yellow-800' },
};

// Configuration des types de consultation
const typeConfig: Record<TYPE, { label: string; icon: string }> = {
  ONLINE: { label: 'En ligne', icon: '💻' },
  ATTENDANCE: { label: 'Présentiel', icon: '🏥' },
};

// Formater le jour et l'heure à partir du Schedule
const formatReservationDateTime = (schedule: Schedule): string => {
  // Traduire les jours en français
  const daysFr: Record<string, string> = {
    'MONDAY': 'Lundi',
    'TUESDAY': 'Mardi',
    'WEDNESDAY': 'Mercredi',
    'THURSDAY': 'Jeudi',
    'FRIDAY': 'Vendredi',
    'SATURDAY': 'Samedi',
    'SUNDAY': 'Dimanche',
  };

  const dayFr = daysFr[schedule.dayOfWeek] || schedule.dayOfWeek;
  return `${dayFr} • ${schedule.startTime} - ${schedule.endTime}`;
};

export default function ReservationCard({
  reservation,
  role,
  onAccept,
  onReject,
  onCancel,
}: Props) {
  const { schedule, reservationStatus, reason, patientId, doctorId } = reservation;
  
  // Déterminer le statut affiché
  const status = reservationStatus ? 'active' : 'cancelled';
  const config = statusConfig[status];
  const type = typeConfig[schedule.appointmenttype];

  // Pour l'exemple, on utilise des IDs temporaires - à remplacer par les vrais noms
  const getPatientName = () => `Patient ${patientId.slice(0, 8)}`;
  const getDoctorName = () => `Dr. ${doctorId.slice(0, 8)}`;

  return (
    <div className="bg-white border rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-800">
            {type.icon} {type.label} - Consultation
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatReservationDateTime(schedule)}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.style}`}>
          {config.label}
        </span>
      </div>

      {reason && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 font-medium">Motif :</p>
          <p className="text-sm text-gray-700">{reason}</p>
        </div>
      )}

      <p className="text-xs text-gray-400 mb-3">
        {role === 'DOCTOR'
          ? `👤 Patient : ${getPatientName()}`
          : `👨‍⚕️ Médecin : ${getDoctorName()}`
        }
      </p>

      <div className="flex gap-2 flex-wrap">
        {role === 'PATIENT' && reservationStatus && (
          <>
            <button
              onClick={() => onAccept?.(reservation.id)}
              className="bg-green-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-green-600"
            >
              ✅ Accepter
            </button>
            <button
              onClick={() => onReject?.(reservation.id)}
              className="bg-red-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-600"
            >
              ❌ Refuser
            </button>
          </>
        )}

        {role === 'DOCTOR' && reservationStatus && (
          <button
            onClick={() => onCancel?.(reservation.id)}
            className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-300"
          >
            Annuler
          </button>
        )}

        {schedule.appointmenttype === TYPE.ONLINE && reservationStatus && (
          <button
            onClick={() => {
              // Logique pour rejoindre la visio
              console.log('Rejoindre la consultation en ligne');
            }}
            className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 flex items-center gap-1"
          >
            🎥 Rejoindre la consultation
          </button>
        )}
      </div>
    </div>
  );
}