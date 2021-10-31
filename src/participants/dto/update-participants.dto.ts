import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsDefined,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ParticipantRole } from '../../shared/enum/participant-role.enum';

export class UpdateParticipantDto {
  @IsUUID()
  @IsDefined()
  meetingId: string;

  @IsUUID()
  @IsDefined()
  participantId: string;

  @IsOptional()
  @ApiProperty({
    enum: ParticipantRole,
    description: 'CONFERENCE_MEMBER=1, HOST=2, CO-HOST=3',
  })
  @IsEnum(ParticipantRole, {
    message:
      'Role should either be 1 for CONFERENCE_MEMBER, or 2 for HOST, or 3 for CO-HOST',
  })
  role?: ParticipantRole;

  @IsOptional()
  @IsString()
  userName?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  timeJoined?: Date;
}

export class UpdateParticipantsDto {
  @IsArray()
  @Type(() => UpdateParticipantDto)
  @ValidateNested({ each: true })
  @IsDefined()
  @ArrayMinSize(1) // If items are reordered, at least 2 items need to be swapped
  @ApiProperty({
    description: 'List participants to be updated',
    type: [UpdateParticipantDto],
  })
  participants: UpdateParticipantDto[];
}
