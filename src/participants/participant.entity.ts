import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail } from 'class-validator';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Meeting } from '../meetings/meeting.entity';
import { ParticipantRole } from '../shared/enum/participant-role.enum';
import { AgendaItem } from '../agenda-items/agenda-item.entity';
import { Suggestion } from 'src/suggestions/suggestion.entity';

@Entity({ name: 'participants' })
@Index(['userEmail', 'meetingId'], { unique: true })
export class Participant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  meetingId: string;

  @Column({ type: 'varchar' })
  @IsEmail()
  @Expose({ groups: ['role:host'] })
  userEmail: string;

  @ApiHideProperty()
  @ManyToOne(() => Meeting, (meeting: Meeting) => meeting.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'meeting_id', referencedColumnName: 'id' })
  meeting: Meeting;

  @OneToMany(() => AgendaItem, (agenda: AgendaItem) => agenda.speaker)
  agenda: AgendaItem[];

  @Column({ type: 'varchar', nullable: true })
  userName?: string;

  @Column({ type: 'timestamptz', nullable: true })
  timeJoined?: Date;

  @Column({
    type: 'enum',
    enum: ParticipantRole,
    default: ParticipantRole.CONFERENCE_MEMBER,
  })
  role?: number;

  @Column({ type: 'boolean', default: false })
  isDuplicate: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  invited: boolean;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @Exclude()
  hashedMagicLinkToken: string;

  @OneToMany(
    () => Suggestion,
    (suggestion: Suggestion) => suggestion.participant,
  )
  suggestions: Suggestion[];
}
