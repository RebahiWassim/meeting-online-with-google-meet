// services/reservation.service.ts
import { authFetch } from '../auth/tokenManager';

const RESERVATION_API_URL = import.meta.env.VITE_RESERVATION_URL || 'https://reservation-service-e30k.onrender.com';

export const reservationService = {
  // Pour la page docteur : récupérer ses consultations
  getDoctorAppointments: async (doctorId: string) => {
    return authFetch(`${RESERVATION_API_URL}/reservation/doctor/${doctorId}`);
  },
  
  // Pour la page patient : récupérer ses rendez-vous
  getPatientAppointments: async (patientId: string) => {
    return authFetch(`${RESERVATION_API_URL}/reservation/patient/${patientId}`);
  },
  
  // Créer une réservation
  createReservation: async (payload: any) => {
    return authFetch(`${RESERVATION_API_URL}/reservation/create`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};