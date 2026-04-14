export enum MeetingStatus {
  PENDING   = 'PENDING',
  ACCEPTED  = 'ACCEPTED',
  REJECTED  = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface Meeting {
  id: string;
  doctorId: string;
  patientId: string;
  doctorEmail: string;
  patientEmail: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  meetLink: string;
  status: MeetingStatus;
  createdAt: string;
}

export interface CreateMeetingPayload {
  doctorId: string;
  doctorEmail: string;
  patientId: string;
  patientEmail: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  meetLink: string;
}
