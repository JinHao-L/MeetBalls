import { Participant } from 'src/participants/participant.entity';
import { IsDefined } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Meeting } from '../meetings/meeting.entity';

@Entity({ name: 'agendaItems' })
export class AgendaItem {
  @PrimaryColumn({ type: 'varchar' })
  meetingId: string;

  @ManyToOne(() => Meeting, (meeting) => meeting.agendaItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'meeting_id', referencedColumnName: 'id' })
  meeting?: Meeting;

  @PrimaryColumn({ type: 'int2' })
  position: number;

  @Column({ type: 'varchar' })
  @IsDefined()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  // To be updated when is_current updates from false to true
  @Column({ type: 'timestamptz', nullable: true })
  startTime?: Date;

  // To be updated when is_current updates from true to false
  @Column({ type: 'integer', nullable: true })
  actualDuration?: number;

  @Column({ type: 'integer' })
  @IsDefined()
  expectedDuration: number;

  @Column({ type: 'boolean', default: false })
  isCurrent?: boolean;

  @ManyToOne(() => Participant, {
    cascade: true,
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  speaker?: Participant;

  @Column({ type: 'varchar', nullable: true })
  speakerMaterials?: string;

  // TODO: Remove nullable: true after resetting database
  @Column({ type: 'boolean', default: true, nullable: true })
  accepted?: boolean;
}
