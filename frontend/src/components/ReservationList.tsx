// Exemple d'utilisation dans un composant parent
import { useEffect, useState } from 'react';
import { reservationApi } from '../api/reservation.api';
import ReservationCard from './ReservationCard';
import { Reservation } from '../types/reservation.types';

export default function ReservationsList({ userId, role }: { userId: string; role: 'DOCTOR' | 'PATIENT' }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, [userId, role]);

  const loadReservations = async () => {
    try {
      let data;
      if (role === 'DOCTOR') {
        data = await reservationApi.getByDoctor(userId);
      } else {
        data = await reservationApi.getByPatient(userId);
      }
      setReservations(data);
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reservationId: string) => {
    try {
      await reservationApi.cancel(reservationId);
      await loadReservations(); // Recharger la liste
    } catch (error) {
      console.error('Erreur annulation:', error);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold mb-4">
        {role === 'DOCTOR' ? 'Mes consultations' : 'Mes rendez-vous'}
      </h2>
      {reservations.length === 0 ? (
        <p className="text-gray-500">Aucune réservation</p>
      ) : (
        reservations.map((reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            role={role}
            onCancel={handleCancel}
          />
        ))
      )}
    </div>
  );
}