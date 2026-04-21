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
