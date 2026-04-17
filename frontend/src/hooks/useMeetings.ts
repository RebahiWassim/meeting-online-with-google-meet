// ── useMeetings ───────────────────────────────────────────────────────────────
// Hook unifié pour gérer :
//  - les réservations du médecin ou du patient (selon le rôle)
//  - les créneaux disponibles d'un médecin
//  - la création et l'annulation de réservations
//  - la création de créneaux (médecin uniquement)

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { reservationApi, scheduleApi } from '../api/reservation.api';
import {
  Reservation,
  Schedule,
  CreateReservationPayload,
  CreateSchedulePayload,
} from '../types/reservation.types';

// ─── Types de retour ──────────────────────────────────────────────────────────

interface UseMeetingsReturn {
  // Données
  reservations: Reservation[];
  schedules: Schedule[];
  loading: boolean;
  error: string | null;

  // Actions communes
  refresh: () => Promise<void>;

  // Actions patient
  bookReservation: (payload: CreateReservationPayload) => Promise<void>;
  cancelReservation: (reservationId: string) => Promise<void>;
  fetchAvailableSlots: (doctorId: string) => Promise<Schedule[]>;

  // Actions médecin
  createSchedule: (payload: CreateSchedulePayload) => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMeetings(): UseMeetingsReturn {
  const { user } = useAuth();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Charger les réservations selon le rôle ────────────────────────────────

  const loadReservations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      let data: Reservation[];
      if (user.role === 'DOCTOR') {
        data = await reservationApi.getByDoctor(user.id);
      } else {
        data = await reservationApi.getByPatient(user.id);
      }
      setReservations(data);

      // Si médecin, charger aussi ses créneaux
      if (user.role === 'DOCTOR') {
        const slots = await scheduleApi.getAvailable(user.id);
        setSchedules(slots);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Chargement initial
  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  // ── Patient : réserver un créneau ─────────────────────────────────────────

  const bookReservation = useCallback(
    async (payload: CreateReservationPayload) => {
      setError(null);
      try {
        const newReservation = await reservationApi.create(payload);
        setReservations(prev => [...prev, newReservation]);
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    []
  );

  // ── Annuler une réservation ───────────────────────────────────────────────

  const cancelReservation = useCallback(async (reservationId: string) => {
    setError(null);
    try {
      await reservationApi.cancel(reservationId);
      setReservations(prev => prev.filter(r => r.id !== reservationId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  // ── Patient : récupérer les créneaux disponibles d'un médecin ─────────────

  const fetchAvailableSlots = useCallback(async (doctorId: string): Promise<Schedule[]> => {
    try {
      const slots = await scheduleApi.getAvailable(doctorId);
      return slots;
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  }, []);

  // ── Médecin : créer un créneau ────────────────────────────────────────────

  const createSchedule = useCallback(async (payload: CreateSchedulePayload) => {
    setError(null);
    try {
      const newSchedule = await scheduleApi.create(payload);
      setSchedules(prev => [...prev, newSchedule]);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    reservations,
    schedules,
    loading,
    error,
    refresh: loadReservations,
    bookReservation,
    cancelReservation,
    fetchAvailableSlots,
    createSchedule,
  };
}