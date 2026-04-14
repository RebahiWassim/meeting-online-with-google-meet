import { useState, useEffect, useCallback } from 'react';
import { Meeting } from '../types/meeting.types';
import { meetingApi } from '../api/meeting.api';

export function useDoctorMeetings(doctorId: string) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await meetingApi.getDoctorMeetings(doctorId);
      setMeetings(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  const cancelMeeting = async (meetingId: string) => {
    const updated = await meetingApi.cancel(meetingId);
    setMeetings(prev => prev.map(m => m.id === meetingId ? updated : m));
  };

  return { meetings, loading, error, cancelMeeting, refetch: fetchMeetings };
}

export function usePatientMeetings(patientId: string) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await meetingApi.getPatientMeetings(patientId);
      setMeetings(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  const acceptMeeting = async (meetingId: string) => {
    const updated = await meetingApi.accept(meetingId);
    setMeetings(prev => prev.map(m => m.id === meetingId ? updated : m));
  };

  const rejectMeeting = async (meetingId: string) => {
    const updated = await meetingApi.reject(meetingId);
    setMeetings(prev => prev.map(m => m.id === meetingId ? updated : m));
  };

  return {
    meetings, loading, error,
    acceptMeeting, rejectMeeting,
    refetch: fetchMeetings,
  };
}