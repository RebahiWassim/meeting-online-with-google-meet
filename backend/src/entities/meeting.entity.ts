import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MeetingStatus } from '../common/meeting-status.enum';

@Entity('meetings')
export class Meeting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  doctorId!: string;

  @Column()
  patientId!: string;

  @Column()
  doctorEmail!: string;

  @Column()
  patientEmail!: string;

  @Column()
  title!: string;

  @Column({ nullable: true, type: 'text' })
  description!: string;

  @Column()
  startTime!: Date;

  @Column()
  endTime!: Date;

  // Google Meet
  @Column({ nullable: true })
  meetLink!: string;        // ← meet.google.com/xxx

  @Column({ nullable: true })
  googleEventId!: string;   // ← ID événement Google Calendar

  @Column({
    type: 'enum',
    enum: MeetingStatus,
    default: MeetingStatus.PENDING,
  })
  status!: MeetingStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}