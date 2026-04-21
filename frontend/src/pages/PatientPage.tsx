import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../hooks/useMeetings';
import { Reservation, TYPE } from '../types/reservation.types';
import {
  Video, Clock, Calendar, Search, LogOut, Users,
  Plus, Loader, CalendarCheck, ChevronRight, Stethoscope,
} from 'lucide-react';
import DoctorDetailsModal from '../components/DoctorDetailsModel';
import { reservationApi, doctorApi, Doctor } from '../api/reservation.api';

// ── Helper: countdown until meeting ─────────────────────────────────────────
function canJoinMeeting(reservation: Reservation): { canJoin: boolean; label: string } {
  if (!reservation.meetingUrl) return { canJoin: false, label: 'Pas de lien' };

  const now = new Date();
  const dayMap: Record<string, number> = {
    SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
    THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
  };

  const reservationDay = reservation.schedule?.dayOfWeek || reservation.reservationDay;
  const startTime = reservation.schedule?.startTime || reservation.reservationTime;
  const targetDay = dayMap[reservationDay] ?? -1;
  if (targetDay === -1) return { canJoin: false, label: 'Jour inconnu' };

  let daysUntil = targetDay - now.getDay();
  if (daysUntil < 0) daysUntil += 7;

  const [hours, minutes] = startTime.split(':').map(Number);
  const meetingDate = new Date(now);
  meetingDate.setDate(meetingDate.getDate() + daysUntil);
  meetingDate.setHours(hours, minutes, 0, 0);

  if (daysUntil === 0 && meetingDate.getTime() < now.getTime() - 3_600_000)
    meetingDate.setDate(meetingDate.getDate() + 7);

  const diffMin = (meetingDate.getTime() - now.getTime()) / 60_000;

  if (diffMin <= 10 && diffMin > -60) return { canJoin: true, label: 'Rejoindre' };
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

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Lundi', TUESDAY: 'Mardi', WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi', FRIDAY: 'Vendredi', SATURDAY: 'Samedi', SUNDAY: 'Dimanche',
};

// ── Doctor card component ────────────────────────────────────────────────────
function DoctorCard({
  doctor,
  onBook,
  requesting,
}: {
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
  requesting: boolean;
}) {
  const initials = `${doctor.firstName?.charAt(0) ?? ''}${doctor.lastName?.charAt(0) ?? ''}`.toUpperCase() || 'Dr';

  // Deterministic color based on first letter
  const colors = [
    'from-blue-400 to-blue-600',
    'from-violet-400 to-violet-600',
    'from-emerald-400 to-emerald-600',
    'from-rose-400 to-rose-600',
    'from-amber-400 to-amber-600',
    'from-cyan-400 to-cyan-600',
  ];
  const color = colors[(doctor.firstName?.charCodeAt(0) ?? 0) % colors.length];

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl px-6 py-5 flex items-center gap-5 hover:shadow-md hover:border-blue-100 transition-all duration-200">

      {/* Avatar */}
      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-sm`}>
        {initials}
      </div>

      {/* Identity */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">
          Dr. {doctor.firstName} {doctor.lastName}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Stethoscope className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <p className="text-sm text-blue-600 font-medium truncate">
            {doctor.specialty || 'Médecin généraliste'}
          </p>
        </div>
      </div>

      {/* Consultation type badges */}
      <div className="hidden md:flex items-center gap-2 flex-shrink-0">
        <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100 font-medium">
          🏥 Présentiel
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 font-medium">
          📹 Vidéo
        </span>
      </div>

      {/* CTA Button — primary action, clearly visible */}
      <div className="flex-shrink-0 ml-2">
        <button
          onClick={() => onBook(doctor)}
          disabled={requesting}
          className="
            inline-flex items-center gap-2
            bg-blue-600 hover:bg-blue-700 active:bg-blue-800
            disabled:bg-blue-300 disabled:cursor-not-allowed
            text-white px-5 py-2.5 rounded-xl
            text-sm font-semibold
            transition-colors shadow-sm
            group-hover:shadow-md
          "
        >
          {requesting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Envoi…
            </>
          ) : (
            <>
              <CalendarCheck className="w-4 h-4" />
              Prendre rendez-vous
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function PatientPage() {
  const { user, logout } = useAuth();
  const { reservations, loading, error, refresh } = useMeetings();

  const [activeTab, setActiveTab] = useState<'appointments' | 'doctors'>('appointments');

  // Doctor list state
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [requestingId, setRequestingId] = useState<string | null>(null);

  // Modal state
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Notification banner
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Fetch doctors when tab is opened ──────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'doctors') return;
    const fetch = async () => {
      setDoctorsLoading(true);
      setDoctorsError(null);
      try {
        const data = await doctorApi.getAll();
        setDoctors(data);
      } catch (err: any) {
        setDoctorsError('Impossible de charger la liste des médecins.');
      } finally {
        setDoctorsLoading(false);
      }
    };
    fetch();
  }, [activeTab]);

  // ── Auto-refresh every 30s for countdowns ─────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => refresh(), 30_000);
    return () => clearInterval(t);
  }, [refresh]);

  // ── Re-render every minute for countdown labels ───────────────────────────
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  // ── Open the appointment request modal ────────────────────────────────────
  const handleBookClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  // ── Called by the modal on form submit ────────────────────────────────────
  const handleRequestAppointment = async (reason: string) => {
    if (!selectedDoctor || !user) throw new Error('Données manquantes');
    setRequestingId(selectedDoctor.id);
    try {
      await reservationApi.requestAppointment({
        doctorId: selectedDoctor.id,
        reason,
      });
      refresh();
      setSuccessMsg(`Demande envoyée au Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName} !`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } finally {
      setRequestingId(null);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const activeReservations = reservations.filter((r: Reservation) => r.reservationStatus === true);

  const filteredDoctors = doctors.filter((d) =>
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.specialty ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 p-6 flex flex-col z-20">
        <div className="mb-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-2xl">⭐</span>
            <span className="text-lg font-bold text-gray-900">platformName</span>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {[
              { tab: 'appointments' as const, icon: <Video className="w-4 h-4" />, label: 'Mes Rendez-vous', badge: activeReservations.length },
              { tab: 'doctors' as const, icon: <Users className="w-4 h-4" />, label: 'Médecins' },
            ].map(({ tab, icon, label, badge }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-3 justify-between ${activeTab === tab
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <span className="flex items-center gap-3">{icon}{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-gray-100 space-y-2">
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
          <div className="px-4 py-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400">Connecté en tant que</p>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="ml-64 flex flex-col min-h-screen">

        {/* Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {activeTab === 'appointments'
                  ? 'Gérez vos rendez-vous et rejoignez vos consultations'
                  : 'Trouvez un médecin et demandez un rendez-vous'}
              </p>
            </div>

            {/* Quick action in header when on doctors tab */}
            {activeTab === 'doctors' && (
              <div className="text-xs text-gray-400 flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full">
                <CalendarCheck className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-blue-600 font-medium">Cliquez sur "Prendre rendez-vous" pour envoyer une demande</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="px-8 border-t border-gray-100">
            <div className="flex gap-6">
              {[
                { tab: 'appointments' as const, label: `Mes Rendez-vous (${activeReservations.length})` },
                { tab: 'doctors' as const, label: 'Médecins disponibles' },
              ].map(({ tab, label }) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 text-sm font-medium transition-colors ${activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Success notification */}
        {successMsg && (
          <div className="mx-8 mt-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm font-medium">
            <span className="text-lg">✅</span>
            {successMsg}
          </div>
        )}

        <main className="p-8 flex-1">

          {/* ══ APPOINTMENTS TAB ══════════════════════════════════════════ */}
          {activeTab === 'appointments' && (
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-400 text-sm">Chargement…</p>
                </div>
              ) : activeReservations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center max-w-md mx-auto">
                  <p className="text-5xl mb-4">📋</p>
                  <p className="font-semibold text-gray-700 mb-1">Aucun rendez-vous actif</p>
                  <p className="text-sm text-gray-400 mb-6">Prenez rendez-vous avec un médecin pour commencer.</p>
                  <button
                    onClick={() => setActiveTab('doctors')}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 text-sm font-semibold transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Trouver un médecin
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-w-3xl">
                  {activeReservations.map((r) => {
                    const { canJoin, label } = canJoinMeeting(r);
                    const day = r.schedule?.dayOfWeek || r.reservationDay;
                    const startTime = r.schedule?.startTime || r.reservationTime;
                    const endTime = r.schedule?.endTime || '';
                    const isOnline = r.schedule?.appointmenttype === TYPE.ONLINE || !!r.meetingUrl;

                    return (
                      <div
                        key={r.id}
                        className={`bg-white border rounded-2xl p-6 hover:shadow-md transition-all duration-200 border-l-4 ${isOnline ? 'border-l-blue-500 border-gray-100' : 'border-l-orange-400 border-gray-100'}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                              </span>
                              {isOnline ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                  <Video className="w-3 h-3" /> En ligne
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                                  🏥 Présentiel
                                </span>
                              )}
                            </div>

                            {/* Reason */}
                            <p className="font-semibold text-gray-900 text-base mb-2 leading-snug">
                              {r.reason || 'Consultation médicale'}
                            </p>

                            {/* Schedule */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-gray-300" />
                                {DAY_LABELS[day] || day}
                              </span>
                              {startTime && (
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4 text-gray-300" />
                                  {startTime}{endTime ? ` – ${endTime}` : ''}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Médecin : {r.doctorId.slice(0, 8)}…
                            </p>
                          </div>

                          {/* Join button */}
                          <div className="flex-shrink-0">
                            {r.meetingUrl ? (
                              canJoin ? (
                                <a
                                  href={r.meetingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                                >
                                  <Video className="w-4 h-4" />
                                  Rejoindre
                                </a>
                              ) : (
                                <button
                                  disabled
                                  title="La consultation n'a pas encore commencé"
                                  className="inline-flex items-center gap-2 bg-gray-100 text-gray-400 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed"
                                >
                                  <Clock className="w-4 h-4" />
                                  {label}
                                </button>
                              )
                            ) : (
                              <span className="text-xs text-gray-400 italic">En attente</span>
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

          {/* ══ DOCTORS TAB ═══════════════════════════════════════════════ */}
          {activeTab === 'doctors' && (
            <div className="max-w-4xl">

              {/* Explainer banner */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
                <CalendarCheck className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">Comment ça marche ?</p>
                  <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
                    Cliquez sur <strong>Prendre rendez-vous</strong> en face du médecin de votre choix.
                    Indiquez le motif de votre consultation. Le médecin reçoit votre demande, l'accepte
                    et crée le lien de la consultation vidéo — ou la refuse s'il n'est pas disponible.
                  </p>
                </div>
              </div>

              {/* Search bar */}
              <div className="relative mb-5">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou spécialité…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                />
              </div>

              {/* Doctor list */}
              {doctorsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-400 text-sm">Chargement des médecins…</p>
                </div>
              ) : doctorsError ? (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
                  ⚠️ {doctorsError}
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="font-semibold text-gray-700">Aucun médecin trouvé</p>
                  <p className="text-sm text-gray-400 mt-1">Essayez un autre nom ou une autre spécialité.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDoctors.map((doctor) => (
                    <DoctorCard
                      key={doctor.id}
                      doctor={doctor}
                      onBook={handleBookClick}
                      requesting={requestingId === doctor.id}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ── Appointment request modal ──────────────────────────────────── */}
      {selectedDoctor && (
        <DoctorDetailsModal
          doctor={selectedDoctor}
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedDoctor(null); }}
          onRequestAppointment={handleRequestAppointment}
        />
      )}
    </div>
  );
}