// ── Reservation Service API ──────────────────────────────────────────────────
// Wraps all calls to the reservation_service
// Uses authFetch for automatic JWT refresh on 401.
// In production, requests go through Vercel proxy (relative URLs).

import { authFetch } from '../auth/tokenManager';
import {
  Reservation,
  Schedule,
  CreateReservationPayload,
  CreateSchedulePayload,
  AppointmentRequestStatus,
} from '../types/reservation.types';

const BASE = import.meta.env.VITE_API_URL || '';

// ─── Reservations ─────────────────────────────────────────────────────────────

export const reservationApi = {
  /** Patient books a slot — backend auto-creates Daily.co room */
  create: async (payload: CreateReservationPayload): Promise<Reservation> => {
    const res = await authFetch(`${BASE}/reservation/create`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erreur lors de la réservation');
    }
    return res.json();
  },

  /** All active reservations for a doctor */
  getByDoctor: async (doctorId: string): Promise<Reservation[]> => {
    const res = await authFetch(`${BASE}/reservation/doctor/${doctorId}`);
    if (!res.ok) throw new Error('Erreur récupération des consultations médecin');
    return res.json();
  },

  /** All active reservations for a patient */
  getByPatient: async (patientId: string): Promise<Reservation[]> => {
    const res = await authFetch(`${BASE}/reservation/patient/${patientId}`);
    if (!res.ok) throw new Error('Erreur récupération des consultations patient');
    return res.json();
  },

  /** Cancel a reservation (also deletes Daily.co room) */
  cancel: async (reservationId: string): Promise<{ message: string }> => {
    const res = await authFetch(`${BASE}/reservation/cancel/${reservationId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Erreur annulation de la réservation');
    return res.json();
  },

  /** Get a specific reservation with meeting details */
  getById: async (reservationId: string): Promise<Reservation> => {
    const res = await authFetch(`${BASE}/reservation/${reservationId}`);
    if (!res.ok) throw new Error('Erreur récupération de la réservation');
    return res.json();
  },

  /** Request an appointment (patient sends request to doctor) */
  requestAppointment: async (payload: {
    doctorId: string;
    reason: string;
  }): Promise<Reservation> => {
    const res = await authFetch(`${BASE}/reservation/request`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erreur lors de la demande');
    }
    return res.json();
  },

  /** Get pending appointment requests for a doctor */
  getPendingRequests: async (doctorId: string): Promise<Reservation[]> => {
    const res = await authFetch(`${BASE}/reservation/pending/${doctorId}`);
    if (!res.ok) throw new Error('Erreur récupération des demandes');
    return res.json();
  },

  /** Doctor accepts an appointment request */
  acceptRequest: async (reservationId: string): Promise<Reservation> => {
    const res = await authFetch(`${BASE}/reservation/accept/${reservationId}`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erreur acceptation');
    }
    return res.json();
  },

  /** Doctor rejects an appointment request */
  rejectRequest: async (reservationId: string): Promise<{ message: string }> => {
    const res = await authFetch(`${BASE}/reservation/reject/${reservationId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Erreur refus de la demande');
    return res.json();
  },

  /** Doctor creates a meeting room and gets the URL */
  createMeeting: async (reservationId: string): Promise<{ meetingUrl: string; meetingRoomName: string }> => {
    const res = await authFetch(`${BASE}/reservation/create-meeting/${reservationId}`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erreur création du meeting');
    }
    return res.json();
  },
};

// ─── Schedules ────────────────────────────────────────────────────────────────

export const scheduleApi = {
  /** Get available time slots for a doctor */
  getAvailable: async (doctorId: string): Promise<Schedule[]> => {
    const res = await authFetch(`${BASE}/reservation/available/${doctorId}`);
    if (!res.ok) throw new Error('Erreur récupération des créneaux');
    return res.json();
  },

  /** Doctor creates a work schedule slot */
  create: async (payload: CreateSchedulePayload): Promise<Schedule> => {
    const res = await authFetch(`${BASE}/reservation/create-schedule`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erreur création du créneau');
    }
    return res.json();
  },
};