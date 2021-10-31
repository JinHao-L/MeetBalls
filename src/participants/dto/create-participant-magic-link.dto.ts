import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreateParticipantMagicLinkDto {
  @IsUUID()
  meetingId: string;

  @IsEmail()
  userEmail: string;
}

export class CreateParticipantsMagicLinkDto {
  @IsArray()
  @Type(() => CreateParticipantMagicLinkDto)
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ApiProperty({
    description: 'List of participants to create magic links',
    type: [CreateParticipantMagicLinkDto],
  })
  participants: CreateParticipantMagicLinkDto[];
}
