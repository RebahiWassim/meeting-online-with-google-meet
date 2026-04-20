import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../hooks/useMeetings';
import { Reservation } from '../types/reservation.types';
import { ChevronDown, Search, Plus } from 'lucide-react';

export default function PatientPage() {
  const { user, logout } = useAuth();
  const { reservations, loading, error, refresh } = useMeetings();

  const [activeTab, setActiveTab] = useState<'appointments' | 'doctors'>('appointments');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const activeReservations = reservations.filter((r : Reservation) => r.reservationStatus === true);

  const mockDoctors = [
    { id: '1', name: 'Dehmani Mohamed', specialty: 'Cardiologie', avatar: '👨‍⚕️' },
    { id: '2', name: 'Dr. Sarah Johnson', specialty: 'Neurologie', avatar: '👩‍⚕️' },
    { id: '3', name: 'Dr. Ahmed Hassan', specialty: 'Dermatologie', avatar: '👨‍⚕️' },
    { id: '4', name: 'Dr. Layla Mansour', specialty: 'Ophthalmologie', avatar: '👩‍⚕️' },
    { id: '5', name: 'Dr. Ibrahim Ali', specialty: 'Orthopédie', avatar: '👨‍⚕️' },
  ];

  const filteredDoctors = mockDoctors.filter((doc : { name: string }) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-2xl">⭐</span>
            <span className="text-lg font-semibold text-gray-900">platformName</span>
          </div>

          <nav className="space-y-2">
            {[
              { label: 'Overview', icon: '📊' },
              { label: 'Appointments', icon: '📅', active: true },
              { label: 'Analysis', icon: '📈' },
              { label: 'Schedule', icon: '🗓️' },
              { label: 'Consultation', icon: '💬' },
            ].map((item) => (
              <button
                key={item.label}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  item.active
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto pt-6 border-t border-gray-200 flex flex-col gap-3">
          <button
            onClick={logout}
            className="text-left px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
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
                {activeTab === 'appointments' ? 'Manage your appointments and availability' : 'Find and book appointments'}
              </p>
            </div>
            <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
              🔔
            </button>
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
                My Appointments ({activeReservations.length})
              </button>
              <button
                onClick={() => setActiveTab('doctors')}
                className={`py-4 px-2 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'doctors'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Available Doctors
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading appointments...</p>
                </div>
              ) : activeReservations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <p className="text-5xl mb-4">📋</p>
                  <p className="text-gray-500 mb-6">No active appointments yet</p>
                  <button
                    onClick={() => setActiveTab('doctors')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Browse Doctors
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeReservations.map((r) => (
                    <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              Active
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              Online
                            </span>
                          </div>
                          <p className="text-gray-900 font-semibold">{r.reason}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            {r.schedule?.dayOfWeek} • {r.schedule?.startTime} - {r.schedule?.endTime}
                          </p>
                        </div>
                        {r.meetingUrl && (
                          <a
                            href={r.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            Join Meeting
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Doctors Tab */}
          {activeTab === 'doctors' && (
            <div>
              <div className="mb-6 flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search doctors by name"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm">
                  Filter
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Doctor</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Specialty</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Appointment Type</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedDoctors.map((doctor) => (
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
                                🏥 In-person
                              </span>
                              <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                                📹 Video
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setActiveTab('appointments')}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-blue-50 text-blue-600 transition-colors"
                              title="Add Appointment"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm">
                  <button className="text-gray-600 hover:text-gray-900">← Previous</button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-lg transition-colors ${
                          currentPage === i + 1
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button className="text-gray-600 hover:text-gray-900">Next →</button>
                  <span className="text-gray-500 ml-auto">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}