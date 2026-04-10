import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { google } from 'googleapis';
import { Meeting } from '../entities/meeting.entity';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { MeetingStatus } from '../common/meeting-status.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MeetingService {
  private calendar;

  constructor(
    @InjectRepository(Meeting)
    private meetingRepository: Repository<Meeting>,
    private configService: ConfigService,
  ) {
    // Initialiser Google Calendar API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: this.configService.get<string>('GOOGLE_CLIENT_EMAIL'),
        private_key: this.configService
          .get<string>('GOOGLE_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  // Docteur crée le meeting
  async createMeeting(dto: CreateMeetingDto): Promise<Meeting> {
    // 1. Créer événement Google Calendar avec Meet
    const googleEvent = await this.calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: dto.title,
        description: dto.description,
        start: {
          dateTime: dto.startTime,
          timeZone: 'Africa/Algiers',
        },
        end: {
          dateTime: dto.endTime,
          timeZone: 'Africa/Algiers',
        },
        attendees: [
          { email: dto.doctorEmail },
          { email: dto.patientEmail },
        ],
        conferenceData: {
          createRequest: {
            requestId: `meeting-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    // 2. Extraire le lien Google Meet
    const meetLink =
      googleEvent.data.conferenceData?.entryPoints?.[0]?.uri ?? '';
    const googleEventId = googleEvent.data.id ?? '';

    // 3. Sauvegarder dans MySQL
    const meeting = this.meetingRepository.create({
      ...dto,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      meetLink,
      googleEventId,
      status: MeetingStatus.PENDING,
    });

    return this.meetingRepository.save(meeting);
  }

  // Patient accepte l'invitation
  async acceptMeeting(meetingId: string, patientId: string): Promise<Meeting> {
    const meeting = await this.findById(meetingId);

    if (meeting.patientId !== patientId) {
      throw new ForbiddenException('Non autorisé');
    }

    if (meeting.status !== MeetingStatus.PENDING) {
      throw new ForbiddenException('Meeting déjà traité');
    }

    meeting.status = MeetingStatus.ACCEPTED;
    return this.meetingRepository.save(meeting);
  }

  // Patient refuse l'invitation
  async rejectMeeting(meetingId: string, patientId: string): Promise<Meeting> {
    const meeting = await this.findById(meetingId);

    if (meeting.patientId !== patientId) {
      throw new ForbiddenException('Non autorisé');
    }

    // Annuler aussi sur Google Calendar
    await this.calendar.events.delete({
      calendarId: 'primary',
      eventId: meeting.googleEventId,
    });

    meeting.status = MeetingStatus.REJECTED;
    return this.meetingRepository.save(meeting);
  }

  // Annuler meeting (docteur)
  async cancelMeeting(meetingId: string, doctorId: string): Promise<Meeting> {
    const meeting = await this.findById(meetingId);

    if (meeting.doctorId !== doctorId) {
      throw new ForbiddenException('Non autorisé');
    }

    await this.calendar.events.delete({
      calendarId: 'primary',
      eventId: meeting.googleEventId,
    });

    meeting.status = MeetingStatus.CANCELLED;
    return this.meetingRepository.save(meeting);
  }

  async findById(id: string): Promise<Meeting> {
    const meeting = await this.meetingRepository.findOne({ where: { id } });
    if (!meeting) throw new NotFoundException('Meeting introuvable');
    return meeting;
  }

  async getDoctorMeetings(doctorId: string): Promise<Meeting[]> {
    return this.meetingRepository.find({
      where: { doctorId },
      order: { startTime: 'ASC' },
    });
  }

  async getPatientMeetings(patientId: string): Promise<Meeting[]> {
    return this.meetingRepository.find({
      where: { patientId },
      order: { startTime: 'ASC' },
    });
  }
}