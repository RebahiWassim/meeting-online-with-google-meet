import { Meeting, CreateMeetingPayload } from '../types/meeting.types';

const BASE_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const meetingApi = {
  create: async (payload: CreateMeetingPayload): Promise<Meeting> => {
    const res = await fetch(`${BASE_URL}/meetings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Erreur création meeting');
    return res.json();
  },

  getDoctorMeetings: async (doctorId: string): Promise<Meeting[]> => {
    const res = await fetch(`${BASE_URL}/meetings/doctor/${doctorId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Erreur récupération meetings');
    return res.json();
  },

  getPatientMeetings: async (patientId: string): Promise<Meeting[]> => {
    const res = await fetch(`${BASE_URL}/meetings/patient/${patientId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Erreur récupération meetings');
    return res.json();
  },

  accept: async (meetingId: string): Promise<Meeting> => {
    const res = await fetch(`${BASE_URL}/meetings/${meetingId}/accept`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Erreur acceptation');
    return res.json();
  },

  reject: async (meetingId: string): Promise<Meeting> => {
    const res = await fetch(`${BASE_URL}/meetings/${meetingId}/reject`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Erreur refus');
    return res.json();
  },

  cancel: async (meetingId: string): Promise<Meeting> => {
    const res = await fetch(`${BASE_URL}/meetings/${meetingId}/cancel`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Erreur annulation');
    return res.json();
  },
};