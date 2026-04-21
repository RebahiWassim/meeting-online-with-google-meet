// ReservationList.tsx — version améliorée
import { useEffect, useState, useCallback } from 'react';
import { reservationApi } from '../api/reservation.api';
import ReservationCard from './ReservationCard';
import { Reservation, TYPE } from '../types/reservation.types';

interface Props {
  userId: string;
  role: 'DOCTOR' | 'PATIENT';
}

type FilterTab = 'all' | 'online' | 'inperson' | 'cancelled';

const TAB_LABELS: Record<FilterTab, string> = {
  all: 'Tous',
  online: 'En ligne',
  inperson: 'Présentiel',
  cancelled: 'Annulés',
};

export default function ReservationList({ userId, role }: Props) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');

  const load = useCallback(async () => {
    setError(null);
    try {
      const data =
        role === 'DOCTOR'
          ? await reservationApi.getByDoctor(userId)
          : await reservationApi.getByPatient(userId);
      setReservations(data);
    } catch (e: any) {
      setError(e.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [userId, role]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30s for countdown labels
  useEffect(() => {
    const t = setInterval(() => load(), 30_000);
    return () => clearInterval(t);
  }, [load]);

  const handleCancel = async (id: string) => {
    await reservationApi.cancel(id);
    load();
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = reservations.filter((r) => {
    if (filter === 'all') return r.reservationStatus;
    if (filter === 'cancelled') return !r.reservationStatus;
    if (filter === 'online') return r.reservationStatus && (r.schedule?.appointmenttype === TYPE.ONLINE || !!r.meetingUrl);
    if (filter === 'inperson') return r.reservationStatus && r.schedule?.appointmenttype === TYPE.ATTENDANCE && !r.meetingUrl;
    return true;
  });

  const counts: Record<FilterTab, number> = {
    all: reservations.filter((r) => r.reservationStatus).length,
    online: reservations.filter(
      (r) => r.reservationStatus && (r.schedule?.appointmenttype === TYPE.ONLINE || !!r.meetingUrl)
    ).length,
    inperson: reservations.filter(
      (r) => r.reservationStatus && r.schedule?.appointmenttype === TYPE.ATTENDANCE && !r.meetingUrl
    ).length,
    cancelled: reservations.filter((r) => !r.reservationStatus).length,
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {role === 'DOCTOR' ? 'Mes consultations' : 'Mes rendez-vous'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {counts.all} rendez-vous actif{counts.all !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => { setLoading(true); load(); }}
          className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
          title="Actualiser"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {(Object.keys(TAB_LABELS) as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`
              flex-1 min-w-max flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${filter === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            {TAB_LABELS[tab]}
            {counts[tab] > 0 && (
              <span className={`
                text-xs px-1.5 py-0.5 rounded-full font-semibold
                ${filter === tab ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}
              `}>
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Chargement de vos rendez-vous…</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">Erreur de chargement</p>
            <p className="text-red-500">{error}</p>
          </div>
          <button
            onClick={() => { setLoading(true); load(); }}
            className="ml-auto text-xs underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl">
            {filter === 'cancelled' ? '🗑️' : filter === 'online' ? '📹' : filter === 'inperson' ? '🏥' : '📋'}
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">
              {filter === 'cancelled' ? 'Aucun rendez-vous annulé' :
                filter === 'online' ? 'Aucune consultation en ligne' :
                  filter === 'inperson' ? 'Aucune consultation en présentiel' :
                    'Aucun rendez-vous actif'}
            </p>
            <p className="text-sm text-gray-400">
              {role === 'DOCTOR'
                ? 'Vos consultations réservées apparaîtront ici.'
                : 'Prenez rendez-vous avec un médecin pour commencer.'}
            </p>
          </div>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((r) => (
            <ReservationCard
              key={r.id}
              reservation={r}
              role={role}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}