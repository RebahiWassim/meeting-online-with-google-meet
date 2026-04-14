import { useState } from 'react';
import { meetingApi } from '../api/meeting.api';
import { useAuth } from '../context/AuthContext';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateMeetingForm({ onSuccess, onCancel }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    patientEmail: '',
    patientId: '',
    title: 'Consultation médicale',
    description: '',
    startTime: '',
    endTime: '',
    meetLink: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (new Date(form.startTime) >= new Date(form.endTime)) {
      setError("L'heure de fin doit être après le début");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await meetingApi.create({
        doctorId: user.id,
        doctorEmail: user.email,
        patientId: form.patientId,
        patientEmail: form.patientEmail,
        title: form.title,
        description: form.description,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        meetLink: form.meetLink,
      });
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        Nouvelle consultation
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID du patient
          </label>
          <input
            name="patientId"
            value={form.patientId}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="UUID du patient"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email du patient
          </label>
          <input
            name="patientEmail"
            type="email"
            value={form.patientEmail}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="patient@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Motif de la consultation..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Début
            </label>
            <input
              name="startTime"
              type="datetime-local"
              value={form.startTime}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fin
            </label>
            <input
              name="endTime"
              type="datetime-local"
              value={form.endTime}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lien de réunion (Google Meet / Zoom)
          </label>
          <input
            name="meetLink"
            type="url"
            value={form.meetLink}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://meet.google.com/xxx-xxxx-xxx"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {loading ? 'Création...' : 'Créer la consultation'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 text-sm font-medium"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}