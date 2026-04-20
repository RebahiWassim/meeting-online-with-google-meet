// ── Enums matching the backend ──────────────────────────────────────────────

export enum DAY {
  SUNDAY    = 'SUNDAY',
  MONDAY    = 'MONDAY',
  TUESDAY   = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY  = 'THURSDAY',
  FRIDAY    = 'FRIDAY',
}

export enum TYPE {
  ONLINE     = 'ONLINE',
  ATTENDANCE = 'ATTENDANCE',
}

// ── Schedule (docschedule entity) ────────────────────────────────────────────

export interface Schedule {
  id: string;
  doctorId: string;
  dayOfWeek: DAY;
  startTime: string;   // e.g. "09:00"
  endTime: string;     // e.g. "10:00"
  appointmenttype: TYPE;
  status: boolean;     // true = available
}

// ── Reservation entity ───────────────────────────────────────────────────────

export interface Reservation {
  id: string;
  patientId: string;
  doctorId: string;
  reason: string;
  reservationStatus: boolean;
  schedule: Schedule;
  meetLink?: string;
  meetingUrl?: string;
}

// ── Auth payloads ─────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'DOCTOR' | 'PATIENT';
  createdAt?: string;
  doctor?: {
    speciality: string;
    establishment: string;
  };
  patient?: {
    dateOfBirth?: string;
    phoneNumber?: string;
    bloodType?: string;
    gender?: string;
  };
}

// ── Create payloads ───────────────────────────────────────────────────────────

export interface CreateReservationPayload {
  doctorId: string;
  patientId: string;
  reservationDay: DAY;
  reservationTime: string;
  reason: string;
}

export interface CreateSchedulePayload {
  doctorId: string;
  dayOfWeek: DAY;
  startTime: string;
  endTime: string;
  appointmenttype: TYPE;
}