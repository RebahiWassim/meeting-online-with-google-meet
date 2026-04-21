import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../hooks/useMeetings';
import { DAY, TYPE, CreateSchedulePayload, Reservation } from '../types/reservation.types';
import { X, Video, Clock, Calendar, Plus, LogOut, Users, CalendarDays } from 'lucide-react';

// ── Helper: check if "Join" button should be enabled ────────────────────────
// Enabled 10 minutes before the consultation start time
function canJoinMeeting(reservation: Reservation): { canJoin: boolean; label: string } {
  if (!reservation.meetingUrl) return { canJoin: false, label: 'Pas de lien' };
  if (!reservation.schedule && !reservation.reservationTime) return { canJoin: false, label: 'Horaire inconnu' };

  const now = new Date();
  const currentDay = now.getDay(); // 0=Sun, 1=Mon...

  const dayMap: Record<string, number> = {
    SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
    THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
  };

  const reservationDay = reservation.schedule?.dayOfWeek || reservation.reservationDay;
  const startTime = reservation.schedule?.startTime || reservation.reservationTime;

  const targetDay = dayMap[reservationDay] ?? -1;
  if (targetDay === -1) return { canJoin: false, label: 'Jour inconnu' };

  // Calculate next occurrence of this day
  let daysUntil = targetDay - currentDay;
  if (daysUntil < 0) daysUntil += 7;

  const [hours, minutes] = startTime.split(':').map(Number);
  const meetingDate = new Date(now);
  meetingDate.setDate(meetingDate.getDate() + daysUntil);
  meetingDate.setHours(hours, minutes, 0, 0);

  // If today is the right day but time already passed, it's next week
  if (daysUntil === 0 && meetingDate.getTime() < now.getTime() - 60 * 60 * 1000) {
    meetingDate.setDate(meetingDate.getDate() + 7);
  }

  const diffMs = meetingDate.getTime() - now.getTime();
  const diffMin = diffMs / (1000 * 60);

  // Enable 10 minutes before start
  if (diffMin <= 10 && diffMin > -60) {
    return { canJoin: true, label: 'Rejoindre' };
  }

  // Show countdown
  if (diffMin > 10) {
    if (diffMin < 60) return { canJoin: false, label: `Dans ${Math.ceil(diffMin)} min` };
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

// ── Day labels ──────────────────────────────────────────────────────────────
const dayLabels: Record<string, string> = {
  MONDAY: 'Lundi', TUESDAY: 'Mardi', WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi', FRIDAY: 'Vendredi', SATURDAY: 'Samedi', SUNDAY: 'Dimanche',
};

export default function DoctorPage() {
  const { user, logout } = useAuth();
  const { reservations, schedules, loading, error, refresh, createSchedule } = useMeetings();

  const [activeTab, setActiveTab] = useState<'consultations' | 'schedule'>('consultations');
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

  // Refresh every 30 seconds to update join button state
  useEffect(() => {
    const interval = setInterval(() => refresh(), 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Force re-render every minute for countdown labels
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setCreating(true);
    try {
      await createSchedule({ ...scheduleForm, doctorId: user!.id });
      setShowScheduleForm(false);
      refresh();
      setScheduleForm({
        doctorId: user?.id || '',
        dayOfWeek: DAY.MONDAY,
        startTime: '09:00',
        endTime: '10:00',
        appointmenttype: TYPE.ONLINE,
      });
    } catch (err: any) {
      setFormError(err.message || 'Error creating schedule');
    } finally {
      setCreating(false);
    }
  };

  const onlineReservations = reservations.filter((r: Reservation) => r.reservationStatus === true);

  const sidebarItems = [
    { label: 'Consultations', icon: <Video className="w-4 h-4" />, tab: 'consultations' as const },
    { label: 'Schedule', icon: <CalendarDays className="w-4 h-4" />, tab: 'schedule' as const },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-2xl">⭐</span>
            <span className="text-lg font-semibold text-gray-900">platformName</span>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.tab)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3 ${
                  activeTab === item.tab
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto pt-6 border-t border-gray-200 flex flex-col gap-3">
          <button
            onClick={logout}
            className="text-left px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
          <div className="px-4 py-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Logged in as</p>
            <p className="text-sm font-medium text-gray-900">Dr. {user?.lastName}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'consultations' ? 'Mes Consultations' : 'Mon Planning'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {activeTab === 'consultations'
                  ? 'Gérez vos rendez-vous et rejoignez vos consultations en ligne'
                  : 'Configurez vos créneaux de disponibilité'}
              </p>
            </div>
            {activeTab === 'schedule' && (
              <button
                onClick={() => setShowScheduleForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter un créneau
              </button>
            )}
          </div>
        </header>

        <main className="p-8">
          {loading && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3 animate-pulse">🏥</div>
              <p className="text-gray-500">Chargement...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-4 mb-6 text-sm">
              {error}
            </div>
          )}

          {/* ═══ CONSULTATIONS TAB ═══ */}
          {activeTab === 'consultations' && !loading && (
            <div>
              {onlineReservations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <p className="text-5xl mb-4">📋</p>
                  <p className="text-gray-500 mb-2">Aucune consultation active</p>
                  <p className="text-sm text-gray-400">Les rendez-vous réservés par vos patients apparaîtront ici.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {onlineReservations.map((r) => {
                    const { canJoin, label } = canJoinMeeting(r);
                    const day = r.schedule?.dayOfWeek || r.reservationDay;
                    const startTime = r.schedule?.startTime || r.reservationTime;
                    const endTime = r.schedule?.endTime || '';
                    const isOnline = r.schedule?.appointmenttype === TYPE.ONLINE || !!r.meetingUrl;

                    return (
                      <div
                        key={r.id}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                Active
                              </span>
                              {isOnline && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                                  <Video className="w-3 h-3" /> En ligne
                                </span>
                              )}
                            </div>
                            <p className="text-gray-900 font-semibold text-lg">{r.reason || 'Consultation'}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {dayLabels[day] || day}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {startTime}{endTime ? ` - ${endTime}` : ''}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Patient: {r.patientId.slice(0, 8)}...
                            </p>
                          </div>

                          {/* Join Button */}
                          <div className="ml-4 flex-shrink-0">
                            {r.meetingUrl ? (
                              canJoin ? (
                                <a
                                  href={r.meetingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
                                >
                                  <Video className="w-4 h-4" />
                                  Rejoindre
                                </a>
                              ) : (
                                <button
                                  disabled
                                  className="inline-flex items-center gap-2 bg-gray-100 text-gray-400 px-5 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed"
                                  title={`La consultation n'a pas encore commencé`}
                                >
                                  <Clock className="w-4 h-4" />
                                  {label}
                                </button>
                              )
                            ) : (
                              <span className="text-xs text-gray-400 italic">Pas de meeting</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ SCHEDULE TAB ═══ */}
          {activeTab === 'schedule' && !loading && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {schedules.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-5xl mb-4">🗓️</p>
                  <p className="text-gray-500 mb-2">Aucun créneau configuré</p>
                  <p className="text-sm text-gray-400 mb-6">Ajoutez vos créneaux de disponibilité pour que les patients puissent réserver.</p>
                  <button
                    onClick={() => setShowScheduleForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un créneau
                  </button>
                </div>
              ) : (
                <div>
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      <span>Jour</span>
                      <span>Horaire</span>
                      <span>Type</span>
                      <span>Statut</span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {schedules.map((s) => (
                      <div key={s.id} className="px-6 py-4 grid grid-cols-4 items-center hover:bg-gray-50 transition-colors">
                        <span className="text-sm font-medium text-gray-900">
                          {dayLabels[s.dayOfWeek] || s.dayOfWeek}
                        </span>
                        <span className="text-sm text-gray-600">
                          {s.startTime} - {s.endTime}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium inline-flex items-center gap-1 w-fit ${
                          s.appointmenttype === TYPE.ONLINE
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {s.appointmenttype === TYPE.ONLINE ? '📹 En ligne' : '🏥 Présentiel'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium w-fit ${
                          s.status
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {s.status ? 'Disponible' : 'Réservé'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Schedule Form Modal */}
          {showScheduleForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 max-w-md w-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Ajouter un créneau</h2>
                  <button
                    onClick={() => setShowScheduleForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {formError && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleCreateSchedule} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jour</label>
                    <select
                      value={scheduleForm.dayOfWeek}
                      onChange={(e) =>
                        setScheduleForm((f) => ({
                          ...f,
                          dayOfWeek: e.target.value as DAY,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.values(DAY).map((d) => (
                        <option key={d} value={d}>
                          {dayLabels[d] || d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Début</label>
                      <input
                        type="time"
                        value={scheduleForm.startTime}
                        onChange={(e) =>
                          setScheduleForm((f) => ({ ...f, startTime: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fin</label>
                      <input
                        type="time"
                        value={scheduleForm.endTime}
                        onChange={(e) =>
                          setScheduleForm((f) => ({ ...f, endTime: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={scheduleForm.appointmenttype}
                      onChange={(e) =>
                        setScheduleForm((f) => ({
                          ...f,
                          appointmenttype: e.target.value as TYPE,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={TYPE.ONLINE}>📹 En ligne</option>
                      <option value={TYPE.ATTENDANCE}>🏥 Présentiel</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                      {creating ? 'Création...' : 'Ajouter'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowScheduleForm(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}