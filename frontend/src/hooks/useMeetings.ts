import { useState, useEffect, useCallback } from 'react';
import { Meeting } from '../types/meeting.types';
import { meetingApi } from '../api/meeting.api';

export function useDoctorMeetings(doctorId: string) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setMeetings(await meetingApi.getDoctorMeetings(doctorId));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => { fetch(); }, [fetch]);

  const cancel = async (id: string, doctorId: string) => {
    const updated = await meetingApi.cancel(id, doctorId);
    setMeetings(prev => prev.map(m => m.id === id ? updated : m));
  };

  return { meetings, loading, error, cancel, refetch: fetch };
}

export function usePatientMeetings(patientId: string) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setMeetings(await meetingApi.getPatientMeetings(patientId));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { fetch(); }, [fetch]);

  const accept = async (id: string, patientId: string) => {
    const updated = await meetingApi.accept(id, patientId);
    setMeetings(prev => prev.map(m => m.id === id ? updated : m));
  };

  const reject = async (id: string, patientId: string) => {
    const updated = await meetingApi.reject(id, patientId);
    setMeetings(prev => prev.map(m => m.id === id ? updated : m));
  };

  return { meetings, loading, error, accept, reject, refetch: fetch };
}