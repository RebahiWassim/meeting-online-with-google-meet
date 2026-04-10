// backend/src/meeting/meeting.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';
import { Meeting } from '../entities/meeting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Meeting])],
  controllers: [MeetingController],
  providers: [MeetingService],
  exports: [MeetingService],
})
export class MeetingModule {}