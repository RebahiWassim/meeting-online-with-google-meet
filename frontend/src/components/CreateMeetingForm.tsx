// ── CreateMeetingForm ─────────────────────────────────────────────────────────
// Formulaire patient pour :
//   1. Saisir l'ID du médecin
//   2. Voir ses créneaux disponibles (type ONLINE)
//   3. Choisir un créneau et saisir la raison
//   4. Soumettre la réservation

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../hooks/useMeetings';
import { Schedule, TYPE } from '../types/reservation.types';

interface CreateMeetingFormProps {
  onSuccess?: () => void;
}

export default function CreateMeetingForm({ onSuccess }: CreateMeetingFormProps) {
  const { user } = useAuth();
  const { bookReservation, fetchAvailableSlots } = useMeetings();

  const [doctorId, setDoctorId] = useState('');
  const [slots, setSlots] = useState<Schedule[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Schedule | null>(null);
  const [reason, setReason] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ── Étape 1 : chercher les créneaux disponibles ───────────────────────────

  const handleSearchSlots = async () => {
    if (!doctorId.trim()) {
      setError('Veuillez saisir l\'ID du médecin.');
      return;
    }
    setError(null);
    setSlots([]);
    setSelectedSlot(null);
    setLoadingSlots(true);

    try {
      const available = await fetchAvailableSlots(doctorId.trim());
      // Filtrer uniquement les consultations ONLINE et disponibles
      const onlineSlots = available.filter(
        s => s.appointmenttype === TYPE.ONLINE && s.status
      );
      setSlots(onlineSlots);
      if (onlineSlots.length === 0) {
        setError('Aucun créneau en ligne disponible pour ce médecin.');
      }
    } catch {
      setError('Impossible de récupérer les créneaux. Vérifiez l\'ID du médecin.');
    } finally {
      setLoadingSlots(false);
    }
  };

  // ── Étape 2 : soumettre la réservation ────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !user) return;
    if (!reason.trim()) {
      setError('Veuillez indiquer la raison de la consultation.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await bookReservation({
        doctorId: doctorId.trim(),
        patientId: user.id,
        reservationDay: selectedSlot.dayOfWeek,
        reservationTime: selectedSlot.startTime,
        reason: reason.trim(),
      });
      setSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réservation.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setDoctorId('');
    setSlots([]);
    setSelectedSlot(null);
    setReason('');
    setError(null);
    setSuccess(false);
  };

  // ── Succès ────────────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="text-green-800 font-semibold mb-1">Réservation confirmée !</h3>
        <p className="text-green-600 text-sm mb-4">
          Votre consultation en ligne a été enregistrée avec succès.
        </p>
        <button
          onClick={handleReset}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          Nouvelle réservation
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-gray-800 font-semibold mb-4">
        Réserver une consultation en ligne
      </h3>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* ── Étape 1 : chercher le médecin ── */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          ID du médecin
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={doctorId}
            onChange={e => setDoctorId(e.target.value)}
            placeholder="Saisissez l'ID du médecin"
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleSearchSlots}
            disabled={loadingSlots}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 disabled:opacity-50 whitespace-nowrap"
          >
            {loadingSlots ? 'Recherche…' : 'Voir les créneaux'}
          </button>
        </div>
      </div>

      {/* ── Étape 2 : choisir un créneau ── */}
      {slots.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Créneaux disponibles ({slots.length})
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {slots.map(slot => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`text-left border rounded-lg p-3 text-sm transition-colors ${
                    selectedSlot?.id === slot.id
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-medium capitalize">
                    {slot.dayOfWeek.toLowerCase()}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {slot.startTime} – {slot.endTime}
                  </p>
                  <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    En ligne
                  </span>
                </button>
              ))}
            </div>
          </div>

          {selectedSlot && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Raison de la consultation
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
                rows={3}
                placeholder="Décrivez brièvement votre motif de consultation…"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          )}

          {selectedSlot && (
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {submitting ? 'Réservation en cours…' : 'Confirmer la réservation'}
            </button>
          )}
        </form>
      )}
    </div>
  );
}