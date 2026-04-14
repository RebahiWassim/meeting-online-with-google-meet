import { Meeting, CreateMeetingPayload } from '../types/meeting.types';

const BASE_URL = import.meta.env.VITE_API_URL;

export const meetingApi = {
  create: async (payload: CreateMeetingPayload): Promise<Meeting> => {
    const res = await fetch(`${BASE_URL}/meetings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Erreur création meeting');
    return res.json();
  },

  getDoctorMeetings: async (doctorId: string): Promise<Meeting[]> => {
    const res = await fetch(`${BASE_URL}/meetings/doctor/${doctorId}`);
    if (!res.ok) throw new Error('Erreur récupération meetings');
    return res.json();
  },

  getPatientMeetings: async (patientId: string): Promise<Meeting[]> => {
    const res = await fetch(`${BASE_URL}/meetings/patient/${patientId}`);
    if (!res.ok) throw new Error('Erreur récupération meetings');
    return res.json();
  },

  accept: async (meetingId: string, patientId: string): Promise<Meeting> => {
    const res = await fetch(`${BASE_URL}/meetings/${meetingId}/accept`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId }),
    });
    if (!res.ok) throw new Error('Erreur acceptation');
    return res.json();
  },

  reject: async (meetingId: string, patientId: string): Promise<Meeting> => {
    const res = await fetch(`${BASE_URL}/meetings/${meetingId}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId }),
    });
    if (!res.ok) throw new Error('Erreur refus');
    return res.json();
  },

  cancel: async (meetingId: string, doctorId: string): Promise<Meeting> => {
    const res = await fetch(`${BASE_URL}/meetings/${meetingId}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorId }),
    });
    if (!res.ok) throw new Error('Erreur annulation');
    return res.json();
  },
};