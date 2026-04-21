import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../hooks/useMeetings';
import { Reservation, TYPE } from '../types/reservation.types';
import { Video, Clock, Calendar, Search, ChevronDown, LogOut, Users, Plus } from 'lucide-react';

// ── Helper: check if "Join" button should be enabled ────────────────────────
function canJoinMeeting(reservation: Reservation): { canJoin: boolean; label: string } {
  if (!reservation.meetingUrl) return { canJoin: false, label: 'Pas de lien' };
  if (!reservation.schedule && !reservation.reservationTime) return { canJoin: false, label: 'Horaire inconnu' };

  const now = new Date();
  const currentDay = now.getDay();

  const dayMap: Record<string, number> = {
    SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
    THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
  };

  const reservationDay = reservation.schedule?.dayOfWeek || reservation.reservationDay;
  const startTime = reservation.schedule?.startTime || reservation.reservationTime;

  const targetDay = dayMap[reservationDay] ?? -1;
  if (targetDay === -1) return { canJoin: false, label: 'Jour inconnu' };

  let daysUntil = targetDay - currentDay;
  if (daysUntil < 0) daysUntil += 7;

  const [hours, minutes] = startTime.split(':').map(Number);
  const meetingDate = new Date(now);
  meetingDate.setDate(meetingDate.getDate() + daysUntil);
  meetingDate.setHours(hours, minutes, 0, 0);

  if (daysUntil === 0 && meetingDate.getTime() < now.getTime() - 60 * 60 * 1000) {
    meetingDate.setDate(meetingDate.getDate() + 7);
  }

  const diffMs = meetingDate.getTime() - now.getTime();
  const diffMin = diffMs / (1000 * 60);

  if (diffMin <= 10 && diffMin > -60) {
    return { canJoin: true, label: 'Rejoindre' };
  }

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

const dayLabels: Record<string, string> = {
  MONDAY: 'Lundi', TUESDAY: 'Mardi', WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi', FRIDAY: 'Vendredi', SATURDAY: 'Samedi', SUNDAY: 'Dimanche',
};

export default function PatientPage() {
  const { user, logout } = useAuth();
  const { reservations, loading, error, refresh } = useMeetings();

  const [activeTab, setActiveTab] = useState<'appointments' | 'doctors'>('appointments');

  // Force re-render every minute for countdown
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  // Refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => refresh(), 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const activeReservations = reservations.filter((r: Reservation) => r.reservationStatus === true);

  const mockDoctors = [
    { id: '1', name: 'Dehmani Mohamed', specialty: 'Cardiologie', avatar: '👨‍⚕️' },
    { id: '2', name: 'Dr. Sarah Johnson', specialty: 'Neurologie', avatar: '👩‍⚕️' },
    { id: '3', name: 'Dr. Ahmed Hassan', specialty: 'Dermatologie', avatar: '👨‍⚕️' },
    { id: '4', name: 'Dr. Layla Mansour', specialty: 'Ophthalmologie', avatar: '👩‍⚕️' },
    { id: '5', name: 'Dr. Ibrahim Ali', specialty: 'Orthopédie', avatar: '👨‍⚕️' },
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const filteredDoctors = mockDoctors.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <button
              onClick={() => setActiveTab('appointments')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3 ${
                activeTab === 'appointments'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Video className="w-4 h-4" />
              Mes Rendez-vous
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3 ${
                activeTab === 'doctors'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" />
              Médecins
            </button>
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
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                {activeTab === 'appointments'
                  ? 'Gérez vos rendez-vous et rejoignez vos consultations'
                  : 'Trouvez et réservez un rendez-vous'}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-8 border-t border-gray-200">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-4 px-2 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'appointments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Mes Rendez-vous ({activeReservations.length})
              </button>
              <button
                onClick={() => setActiveTab('doctors')}
                className={`py-4 px-2 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'doctors'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Médecins disponibles
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          {/* ═══ APPOINTMENTS TAB ═══ */}
          {activeTab === 'appointments' && (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3 animate-pulse">🏥</div>
                  <p className="text-gray-500">Chargement...</p>
                </div>
              ) : activeReservations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <p className="text-5xl mb-4">📋</p>
                  <p className="text-gray-500 mb-6">Aucun rendez-vous actif</p>
                  <button
                    onClick={() => setActiveTab('doctors')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Chercher un médecin
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeReservations.map((r) => {
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
                              Médecin: {r.doctorId.slice(0, 8)}...
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
                                  title="La consultation n'a pas encore commencé"
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

          {/* ═══ DOCTORS TAB ═══ */}
          {activeTab === 'doctors' && (
            <div>
              <div className="mb-6 flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un médecin..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Médecin</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Spécialité</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredDoctors.map((doctor) => (
                        <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                                {doctor.avatar}
                              </div>
                              <span className="font-medium text-gray-900">{doctor.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{doctor.specialty}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                                🏥 Présentiel
                              </span>
                              <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                                📹 Vidéo
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}