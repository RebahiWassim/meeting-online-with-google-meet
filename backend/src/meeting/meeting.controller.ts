import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';

@Controller('meetings')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  // Docteur crée le meeting
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMeetingDto) {
    return this.meetingService.createMeeting(dto);
  }

  // Patient accepte
  @Patch(':id/accept')
  @UseGuards(AuthGuard('jwt'))
  async accept(@Param('id') id: string, @Req() req: any) {
    return this.meetingService.acceptMeeting(id, req.user.id);
  }

  // Patient refuse
  @Patch(':id/reject')
  @UseGuards(AuthGuard('jwt'))
  async reject(@Param('id') id: string, @Req() req: any) {
    return this.meetingService.rejectMeeting(id, req.user.id);
  }

  // Docteur annule
  @Patch(':id/cancel')
  @UseGuards(AuthGuard('jwt'))
  async cancel(@Param('id') id: string, @Req() req: any) {
    return this.meetingService.cancelMeeting(id, req.user.id);
  }

  // Meetings du docteur
  @Get('doctor/:doctorId')
  @UseGuards(AuthGuard('jwt'))
  async getDoctorMeetings(@Param('doctorId') doctorId: string) {
    return this.meetingService.getDoctorMeetings(doctorId);
  }

  // Meetings du patient
  @Get('patient/:patientId')
  @UseGuards(AuthGuard('jwt'))
  async getPatientMeetings(@Param('patientId') patientId: string) {
    return this.meetingService.getPatientMeetings(patientId);
  }

  // Détails d'un meeting
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string) {
    return this.meetingService.findById(id);
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}