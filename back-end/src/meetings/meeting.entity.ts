import { ApiHideProperty } from '@nestjs/swagger';
import { IsDefined, IsPositive, IsUrl } from 'class-validator';
import { Suggestion } from 'src/suggestions/suggestion.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AgendaItem } from '../agenda-items/agenda-item.entity';
import { Participant } from '../participants/participant.entity';
import { ZoomMeetingStatus } from '../shared/enum/zoom-meeting-status.enum';
import { User } from '../users/user.entity';

@Entity({ name: 'meetings' })
export class Meeting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  @IsDefined()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  // Should this be createdDate of the zoom link or meetballs link?
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'integer' })
  @IsPositive()
  duration: number;

  @Column({ type: 'uuid', nullable: true })
  hostId?: string;

  @ApiHideProperty()
  @ManyToOne(() => User, (user: User) => user.uuid, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'host_id', referencedColumnName: 'uuid' })
  host?: User;

  @Column({ type: 'varchar', unique: true, nullable: true })
  zoomUuid: string;

  @Column({ type: 'varchar' })
  meetingId: string;

  @Column({ type: 'varchar', nullable: true })
  meetingPassword?: string;

  @Column({ type: 'varchar' })
  @IsUrl()
  joinUrl: string;

  @Column({
    type: 'enum',
    enum: ZoomMeetingStatus,
    default: ZoomMeetingStatus.WAITING,
  })
  type: number;

  @Column({ type: 'timestamptz' })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endedAt?: Date;

  @Column({ type: 'boolean', default: false })
  enableTranscription: boolean;

  @Column({ type: 'varchar', nullable: true })
  transcription: string;

  @Column({ type: 'varchar', nullable: true })
  @IsUrl()
  videoUrl?: string;

  @OneToMany(() => AgendaItem, (agendaItem) => agendaItem.meeting, {
    cascade: true,
  })
  agendaItems?: AgendaItem[];

  @OneToMany(() => Participant, (participant) => participant.meeting, {
    cascade: true,
  })
  participants: Participant[];

  @OneToMany(() => Suggestion, (suggestion) => suggestion.meeting, {
    cascade: true,
  })
  suggestions: Suggestion[];
}
