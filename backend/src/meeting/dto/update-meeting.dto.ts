import { IsEnum } from 'class-validator';
import { MeetingStatus } from '../../common/meeting-status.enum';

export class UpdateMeetingDto {
  @IsEnum(MeetingStatus)
  status!: MeetingStatus;
}