import { IsString, IsDateString, IsEmail } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  doctorId!: string;

  @IsString()
  patientId!: string;

  @IsEmail()
  patientEmail!: string;

  @IsEmail()
  doctorEmail!: string;

  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;
}