import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../hooks/useMeetings';
import { DAY, TYPE, CreateSchedulePayload, Reservation } from '../types/reservation.types';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

export default function DoctorPage() {
  const { user, logout } = useAuth();
  const { reservations, schedules, loading, error, refresh, createSchedule } = useMeetings();

  const [activeTab, setActiveTab] = useState<'schedule' | 'appointments'>('schedule');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [scheduleForm, setScheduleForm] = useState<CreateSchedulePayload>({
    doctorId: user?.id || '',
    dayOfWeek: DAY.MONDAY,
    startTime: '09:00',
    endTime: '10:00',
    appointmenttype: TYPE.ONLINE,
  });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-2xl">⭐</span>
            <span className="text-lg font-semibold text-gray-900">platformName</span>
          </div>

          <nav className="space-y-2">
            {[
              { label: 'Overview', icon: '📊' },
              { label: 'Appointments', icon: '📅' },
              { label: 'Analytics', icon: '📈' },
              { label: 'Schedule', icon: '🗓️', active: true },
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
              <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your appointments and availability</p>
            </div>
            <button
              onClick={() => setShowScheduleForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Set Availability
            </button>
          </div>
        </header>

        <main className="p-8">
          <div className="grid grid-cols-4 gap-8">
            {/* Left: Calendar */}
            <div className="col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">April 2025</h3>
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-7 gap-2 text-center mb-4">
                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                      <div key={day} className="text-xs font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <button
                        key={i}
                        className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                          i === 19
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-gray-700">Repeat Weekly Until Changed</span>
                  </label>
                </div>

                <button className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                  Save Availability
                </button>
              </div>
            </div>

            {/* Right: Time Schedule */}
            <div className="col-span-3">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Header: Days of week */}
                <div className="grid grid-cols-7 border-b border-gray-200">
                  {[
                    { day: 'Monday', date: 'Apr 20', hours: '3 available' },
                    { day: 'Tuesday', date: 'Apr 21', hours: '0 available' },
                    { day: 'Wednesday', date: 'Apr 22', hours: '1 available' },
                    { day: 'Thursday', date: 'Apr 23', hours: '2 available' },
                    { day: 'Friday', date: 'Apr 24', hours: '4 available' },
                    { day: 'Saturday', date: 'Apr 25', hours: '0 available' },
                    { day: 'Sunday', date: 'Apr 26', hours: '0 available' },
                  ].map((item) => (
                    <div
                      key={item.day}
                      className="p-4 border-r border-gray-200 last:border-r-0 flex flex-col items-start"
                    >
                      <label className="flex items-center gap-2 mb-3 w-full">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm font-medium text-gray-900">{item.day}</span>
                      </label>
                      <p className="text-xs text-gray-500">{item.date}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.hours}</p>
                    </div>
                  ))}
                </div>

                {/* Time slots */}
                <div className="p-6">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-4">
                      Start Time
                    </p>
                    {['08:00', '09:00', '10:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                      <div
                        key={time}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <span className="text-sm text-gray-600">{time}</span>
                        <div className="flex gap-1">
                          <button className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-blue-600">
                            ✎
                          </button>
                          <button className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-600">
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-6 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Time Slot
                  </button>
                </div>

                {/* Mark Unavailable Dates */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-xs text-gray-600 font-medium mb-3">Mark Unavailable Dates</p>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Form Modal */}
          {showScheduleForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 max-w-md w-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Add Time Slot</h2>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
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
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
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
                      <option value={TYPE.ONLINE}>Online</option>
                      <option value={TYPE.ATTENDANCE}>In-person</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                      {creating ? 'Creating...' : 'Add Slot'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowScheduleForm(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
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