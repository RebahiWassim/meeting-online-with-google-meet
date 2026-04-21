// ReservationCard.tsx — version améliorée
import { useState } from 'react';
import { Reservation, Schedule, TYPE, AppointmentRequestStatus } from '../types/reservation.types';

interface Props {
  reservation: Reservation;
  role: 'DOCTOR' | 'PATIENT';
  onCancel?: (id: string) => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCreateMeeting?: (id: string) => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Lundi',
  TUESDAY: 'Mardi',
  WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi',
  FRIDAY: 'Vendredi',
  SATURDAY: 'Samedi',
  SUNDAY: 'Dimanche',
};

function canJoinMeeting(reservation: Reservation): { canJoin: boolean; label: string; minutesLeft?: number } {
  if (!reservation.meetingUrl) return { canJoin: false, label: 'Pas de lien' };

  const now = new Date();
  const dayMap: Record<string, number> = {
    SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
    THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
  };

  const reservationDay = reservation.schedule?.dayOfWeek ?? reservation.reservationDay;
  const startTime = reservation.schedule?.startTime ?? reservation.reservationTime;
  if (!reservationDay || !startTime) return { canJoin: false, label: 'Horaire inconnu' };

  const targetDay = dayMap[reservationDay] ?? -1;
  if (targetDay === -1) return { canJoin: false, label: 'Jour inconnu' };

  let daysUntil = targetDay - now.getDay();
  if (daysUntil < 0) daysUntil += 7;

  const [hours, minutes] = startTime.split(':').map(Number);
  const meetingDate = new Date(now);
  meetingDate.setDate(meetingDate.getDate() + daysUntil);
  meetingDate.setHours(hours, minutes, 0, 0);

  if (daysUntil === 0 && meetingDate.getTime() < now.getTime() - 3600_000) {
    meetingDate.setDate(meetingDate.getDate() + 7);
  }

  const diffMin = (meetingDate.getTime() - now.getTime()) / 60_000;

  if (diffMin <= 10 && diffMin > -60) return { canJoin: true, label: 'Rejoindre', minutesLeft: Math.ceil(diffMin) };
  if (diffMin > 10) {
    if (diffMin < 60) return { canJoin: false, label: `Dans ${Math.ceil(diffMin)} min`, minutesLeft: Math.ceil(diffMin) };
    if (diffMin < 1440) {
      const h = Math.floor(diffMin / 60);
      const m = Math.ceil(diffMin % 60);
      return { canJoin: false, label: `Dans ${h}h${m > 0 ? m + 'min' : ''}` };
    }
    const d = Math.ceil(diffMin / 1440);
    return { canJoin: false, label: `Dans ${d} jour${d > 1 ? 's' : ''}` };
  }
  return { canJoin: false, label: 'Terminée' };
}

function formatSchedule(schedule?: Schedule, reservationDay?: string, reservationTime?: string): string {
  const day = schedule?.dayOfWeek ?? reservationDay ?? '';
  const start = schedule?.startTime ?? reservationTime ?? '';
  const end = schedule?.endTime ?? '';
  const dayFr = DAY_LABELS[day] ?? day;
  if (!dayFr && !start) return '—';
  return `${dayFr}${start ? ' · ' + start : ''}${end ? ' – ' + end : ''}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: TYPE }) {
  return type === TYPE.ONLINE ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
      </svg>
      En ligne
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
      </svg>
      Présentiel
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Annulée
    </span>
  );
}

function RequestStatusBadge({ status }: { status?: AppointmentRequestStatus }) {
  if (!status) return null;
  const map: Record<AppointmentRequestStatus, { label: string; cls: string }> = {
    [AppointmentRequestStatus.PENDING]: {
      label: 'En attente',
      cls: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    [AppointmentRequestStatus.ACCEPTED]: {
      label: 'Acceptée',
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    [AppointmentRequestStatus.REJECTED]: {
      label: 'Refusée',
      cls: 'bg-red-50 text-red-700 border-red-100',
    },
  };
  const { label, cls } = map[status];
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
      {label}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReservationCard({ reservation, role, onCancel, onAccept, onReject, onCreateMeeting }: Props) {
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { schedule, reservationStatus, reason, patientId, doctorId, meetingUrl, appointmentRequestStatus } = reservation;
  const appointmentType = schedule?.appointmenttype ?? TYPE.ATTENDANCE;
  const isOnline = appointmentType === TYPE.ONLINE;
  const { canJoin, label: joinLabel } = canJoinMeeting(reservation);
  const scheduleText = formatSchedule(schedule, reservation.reservationDay, reservation.reservationTime);

  const handleCreateMeeting = async () => {
    if (!onCreateMeeting) return;
    setCreatingMeeting(true);
    try { await onCreateMeeting(reservation.id); }
    finally { setCreatingMeeting(false); }
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    setCancelling(true);
    try { await onCancel(reservation.id); }
    finally { setCancelling(false); }
  };

  // Left accent color based on type
  const accentCls = isOnline ? 'border-l-blue-500' : 'border-l-orange-400';

  return (
    <div
      className={`
        group relative bg-white rounded-2xl border border-gray-100 border-l-4 ${accentCls}
        shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden
        ${!reservationStatus ? 'opacity-60' : ''}
      `}
    >
      {/* Card body */}
      <div className="p-5">
        {/* Top row: badges + time */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-1.5">
            <TypeBadge type={appointmentType} />
            <StatusBadge active={reservationStatus} />
            {appointmentRequestStatus && <RequestStatusBadge status={appointmentRequestStatus} />}
          </div>

          {/* Date/Time chip */}
          <div className="flex-shrink-0 flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 whitespace-nowrap">
            <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {scheduleText}
          </div>
        </div>

        {/* Reason */}
        <p className="text-gray-800 font-semibold text-base leading-snug mb-3 line-clamp-2">
          {reason || 'Consultation médicale'}
        </p>

        {/* People info */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <svg className="w-4 h-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          {role === 'DOCTOR' ? (
            <span>
              Patient :{' '}
              <span className="font-medium text-gray-600">
                {reservation.patientName ?? `${patientId.slice(0, 8)}…`}
              </span>
            </span>
          ) : (
            <span>
              Médecin :{' '}
              <span className="font-medium text-gray-600">
                Dr. {doctorId.slice(0, 8)}…
              </span>
            </span>
          )}
        </div>

        {/* Meeting URL info (if exists) */}
        {meetingUrl && reservationStatus && (
          <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-4 border border-blue-100">
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            <span className="font-medium">Lien de consultation disponible</span>
          </div>
        )}

        {/* Action buttons */}
        {reservationStatus && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-50">

            {/* ── PATIENT: Rejoindre le meeting ── */}
            {role === 'PATIENT' && meetingUrl && isOnline && (
              canJoin ? (
                <a
                  href={meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  Rejoindre la consultation
                </a>
              ) : (
                <button
                  disabled
                  title="La consultation n'a pas encore commencé"
                  className="inline-flex items-center gap-2 bg-gray-100 text-gray-400 px-4 py-2 rounded-xl text-sm font-semibold cursor-not-allowed"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {joinLabel}
                </button>
              )
            )}

            {/* ── DOCTOR: Voir le meeting / Créer le meeting ── */}
            {role === 'DOCTOR' && isOnline && (
              meetingUrl ? (
                canJoin ? (
                  <a
                    href={meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    Rejoindre
                  </a>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center gap-2 bg-gray-100 text-gray-400 px-4 py-2 rounded-xl text-sm font-semibold cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {joinLabel}
                  </button>
                )
              ) : onCreateMeeting ? (
                <button
                  onClick={handleCreateMeeting}
                  disabled={creatingMeeting}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60"
                >
                  {creatingMeeting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Création...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      Créer le meeting
                    </>
                  )}
                </button>
              ) : null
            )}

            {/* ── Accepter / Refuser (DOCTOR sur une demande) ── */}
            {role === 'DOCTOR' && onAccept && appointmentRequestStatus === AppointmentRequestStatus.PENDING && (
              <>
                <button
                  onClick={() => onAccept(reservation.id)}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Accepter
                </button>
                {onReject && (
                  <button
                    onClick={() => onReject(reservation.id)}
                    className="inline-flex items-center gap-1.5 bg-red-600 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Refuser
                  </button>
                )}
              </>
            )}

            {/* ── Annuler (toujours disponible pour le médecin sur consultation active) ── */}
            {role === 'DOCTOR' && onCancel && !onAccept && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="ml-auto inline-flex items-center gap-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Annulation…' : 'Annuler le rendez-vous'}
              </button>
            )}

            {/* ── Annuler (patient) ── */}
            {role === 'PATIENT' && onCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="ml-auto inline-flex items-center gap-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Annulation…' : 'Annuler'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}