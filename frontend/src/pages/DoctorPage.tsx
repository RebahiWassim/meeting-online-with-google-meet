// ── DoctorPage ────────────────────────────────────────────────────────────────
// Dashboard du médecin :
//  - Voir ses consultations en ligne réservées par des patients
//  - Créer/gérer ses créneaux de disponibilité
//  - Rejoindre une consultation Google Meet

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../hooks/useMeetings';
import {
  DAY,
  TYPE,
  CreateSchedulePayload,
  Reservation,
} from '../types/reservation.types';

export default function DoctorPage() {
  const { user, logout } = useAuth();
  const { reservations, schedules, loading, error, refresh, createSchedule } =
    useMeetings();

  const [activeTab, setActiveTab] = useState<'reservations' | 'schedule'>('reservations');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<CreateSchedulePayload>({
    doctorId: user?.id || '',
    dayOfWeek: DAY.MONDAY,
    startTime: '09:00',
    endTime: '10:00',
    appointmenttype: TYPE.ONLINE,
  });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // ── Créer un créneau ──────────────────────────────────────────────────────

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    setCreating(true);
    try {
      await createSchedule({ ...scheduleForm, doctorId: user!.id });
      setFormSuccess(true);
      setShowScheduleForm(false);
      refresh();
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de la création du créneau.');
    } finally {
      setCreating(false);
    }
  };

  // ── Réservations ONLINE uniquement ────────────────────────────────────────
  const onlineReservations = reservations.filter(
    (r: Reservation) => r.schedule?.appointmenttype === TYPE.ONLINE
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏥</span>
            <div>
              <h1 className="text-gray-900 font-semibold text-sm">
                Dr. {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-gray-400 text-xs">
                {user?.doctor?.speciality} · {user?.doctor?.establishment}
              </p>
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

      <main className="max-w-4xl mx-auto px-6 py-8">
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
            Consultations ({onlineReservations.length})
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'schedule'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mes créneaux ({schedules.length})
          </button>
        </div>

        {/* ── Erreur globale ── */}
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-4 text-sm">
            {error}
            <button onClick={refresh} className="ml-2 underline">
              Réessayer
            </button>
          </div>
        )}

        {/* ── Tab : Réservations ── */}
        {activeTab === 'reservations' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-800 font-semibold">
                Consultations en ligne
              </h2>
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
                Chargement des consultations…
              </div>
            ) : onlineReservations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-4xl mb-3">📅</p>
                <p className="text-gray-500 text-sm">
                  Aucune consultation en ligne pour le moment.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {onlineReservations.map((r: Reservation) => (
                  <ReservationCard key={r.id} reservation={r} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Tab : Créneaux ── */}
        {activeTab === 'schedule' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-800 font-semibold">Mes créneaux</h2>
              <button
                onClick={() => {
                  setShowScheduleForm(v => !v);
                  setFormError(null);
                  setFormSuccess(false);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                + Nouveau créneau
              </button>
            </div>

            {/* Formulaire création */}
            {showScheduleForm && (
              <form
                onSubmit={handleCreateSchedule}
                className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-4"
              >
                <h3 className="text-gray-800 font-medium text-sm">
                  Ajouter un créneau en ligne
                </h3>

                {formError && (
                  <p className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">
                    {formError}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Jour</label>
                    <select
                      value={scheduleForm.dayOfWeek}
                      onChange={e =>
                        setScheduleForm(f => ({
                          ...f,
                          dayOfWeek: e.target.value as DAY,
                        }))
                      }
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.values(DAY).map(d => (
                        <option key={d} value={d}>
                          {d.charAt(0) + d.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Type</label>
                    <select
                      value={scheduleForm.appointmenttype}
                      onChange={e =>
                        setScheduleForm(f => ({
                          ...f,
                          appointmenttype: e.target.value as TYPE,
                        }))
                      }
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={TYPE.ONLINE}>En ligne</option>
                      <option value={TYPE.ATTENDANCE}>Présentiel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Heure de début
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.startTime}
                      onChange={e =>
                        setScheduleForm(f => ({ ...f, startTime: e.target.value }))
                      }
                      required
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Heure de fin
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.endTime}
                      onChange={e =>
                        setScheduleForm(f => ({ ...f, endTime: e.target.value }))
                      }
                      required
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creating ? 'Enregistrement…' : 'Créer le créneau'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScheduleForm(false)}
                    className="text-gray-500 px-4 py-2 text-sm hover:underline"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}

            {formSuccess && (
              <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 mb-4 text-sm">
                Créneau créé avec succès.
              </div>
            )}

            {/* Liste des créneaux */}
            {loading ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                Chargement…
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-4xl mb-3">🗓</p>
                <p className="text-gray-500 text-sm">
                  Vous n'avez pas encore de créneaux.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {schedules.map(s => (
                  <div
                    key={s.id}
                    className={`bg-white border rounded-xl p-4 ${
                      s.status ? 'border-green-200' : 'border-gray-200 opacity-60'
                    }`}
                  >
                    <p className="font-medium text-gray-800 text-sm capitalize">
                      {s.dayOfWeek.toLowerCase()}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {s.startTime} – {s.endTime}
                    </p>
                    <div className="flex gap-1 mt-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          s.appointmenttype === TYPE.ONLINE
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {s.appointmenttype === TYPE.ONLINE ? 'En ligne' : 'Présentiel'}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          s.status
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {s.status ? 'Disponible' : 'Indisponible'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

// ── Carte réservation ─────────────────────────────────────────────────────────

function ReservationCard({ reservation: r }: { reservation: Reservation }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4">
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
          Patient : {r.patientId}
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

      {/* Bouton rejoindre la réunion Google Meet — le lien est géré par le backend */}
      <a
        href="#"
        className="shrink-0 bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-green-700 whitespace-nowrap"
        title="Rejoindre via Google Meet"
      >
        Rejoindre
      </a>
    </div>
  );
}