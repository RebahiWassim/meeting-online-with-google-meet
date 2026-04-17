// ── PatientPage ───────────────────────────────────────────────────────────────
// Dashboard du patient :
//  - Voir ses réservations actives
//  - Réserver une nouvelle consultation en ligne
//  - Annuler une réservation
//  - Rejoindre une consultation Google Meet

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../hooks/useMeetings';
import CreateMeetingForm from '../components/CreateMeetingForm';
import { TYPE, Reservation } from '../types/reservation.types';

export default function PatientPage() {
  const { user, logout } = useAuth();
  const { reservations, loading, error, refresh, cancelReservation } = useMeetings();

  const [activeTab, setActiveTab] = useState<'reservations' | 'new'>('reservations');
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // ── Annuler une réservation ───────────────────────────────────────────────

  const handleCancel = async (reservationId: string) => {
    if (!confirm('Voulez-vous vraiment annuler cette consultation ?')) return;
    setCancelError(null);
    setCancelling(reservationId);
    try {
      await cancelReservation(reservationId);
    } catch (err: any) {
      setCancelError(err.message || 'Erreur lors de l\'annulation.');
    } finally {
      setCancelling(null);
    }
  };

  // ── Filtrer les réservations ONLINE actives ───────────────────────────────

  const activeReservations = reservations.filter(
    (r: Reservation) =>
      r.reservationStatus && r.schedule?.appointmenttype === TYPE.ONLINE
  );

  const pastReservations = reservations.filter(
    (r: Reservation) => !r.reservationStatus
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏥</span>
            <div>
              <h1 className="text-gray-900 font-semibold text-sm">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-gray-400 text-xs">Espace patient</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-gray-500 hover:text-red-600 text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:border-red-200 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* ── Stats rapides ── */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Consultations actives</p>
            <p className="text-2xl font-semibold text-blue-600">
              {activeReservations.length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Total consultations</p>
            <p className="text-2xl font-semibold text-gray-700">
              {reservations.length}
            </p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'reservations'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mes consultations
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'new'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            + Nouvelle réservation
          </button>
        </div>

        {/* ── Erreurs ── */}
        {(error || cancelError) && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-4 text-sm">
            {error || cancelError}
            {error && (
              <button onClick={refresh} className="ml-2 underline">
                Réessayer
              </button>
            )}
          </div>
        )}

        {/* ── Tab : Mes consultations ── */}
        {activeTab === 'reservations' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-800 font-semibold">Mes consultations</h2>
              <button
                onClick={refresh}
                disabled={loading}
                className="text-blue-600 text-sm hover:underline disabled:opacity-50"
              >
                {loading ? 'Actualisation…' : '↻ Actualiser'}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                Chargement…
              </div>
            ) : activeReservations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-gray-500 text-sm mb-3">
                  Aucune consultation active.
                </p>
                <button
                  onClick={() => setActiveTab('new')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                >
                  Réserver une consultation
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {activeReservations.map((r: Reservation) => (
                    <PatientReservationCard
                      key={r.id}
                      reservation={r}
                      cancelling={cancelling === r.id}
                      onCancel={() => handleCancel(r.id)}
                    />
                  ))}
                </div>

                {/* Consultations passées / annulées */}
                {pastReservations.length > 0 && (
                  <>
                    <h3 className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wide">
                      Historique
                    </h3>
                    <div className="space-y-2">
                      {pastReservations.map((r: Reservation) => (
                        <PatientReservationCard
                          key={r.id}
                          reservation={r}
                          cancelling={false}
                          onCancel={() => {}}
                          past
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </section>
        )}

        {/* ── Tab : Nouvelle réservation ── */}
        {activeTab === 'new' && (
          <CreateMeetingForm
            onSuccess={() => {
              refresh();
              setActiveTab('reservations');
            }}
          />
        )}
      </main>
    </div>
  );
}

// ── Carte réservation patient ─────────────────────────────────────────────────

function PatientReservationCard({
  reservation: r,
  cancelling,
  onCancel,
  past = false,
}: {
  reservation: Reservation;
  cancelling: boolean;
  onCancel: () => void;
  past?: boolean;
}) {
  return (
    <div
      className={`bg-white border rounded-xl p-4 flex items-start justify-between gap-4 ${
        past ? 'border-gray-100 opacity-70' : 'border-gray-200'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            En ligne
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              r.reservationStatus
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {r.reservationStatus ? 'Confirmée' : 'Annulée'}
          </span>
        </div>
        <p className="text-gray-800 text-sm font-medium truncate">
          Médecin : {r.doctorId}
        </p>
        <p className="text-gray-500 text-xs mt-0.5 truncate">
          Motif : {r.reason}
        </p>
        {r.schedule && (
          <p className="text-gray-400 text-xs mt-0.5 capitalize">
            {r.schedule.dayOfWeek.toLowerCase()} · {r.schedule.startTime} –{' '}
            {r.schedule.endTime}
          </p>
        )}
      </div>

      {!past && r.reservationStatus && (
        <div className="flex flex-col gap-2 shrink-0">
          <a
            href="#"
            className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 text-center whitespace-nowrap"
            title="Rejoindre via Google Meet"
          >
            Rejoindre
          </a>
          <button
            onClick={onCancel}
            disabled={cancelling}
            className="border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs hover:bg-red-50 disabled:opacity-50 whitespace-nowrap"
          >
            {cancelling ? '…' : 'Annuler'}
          </button>
        </div>
      )}
    </div>
  );
}