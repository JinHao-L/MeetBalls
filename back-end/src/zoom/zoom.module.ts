import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { ZoomService } from './zoom.service';
import { ZoomController } from './zoom.controller';
import { AppConfigModule } from '../config/config.module';
import { Meeting } from '../meetings/meeting.entity';
import { User } from '../users/user.entity';
import { Participant } from '../participants/participant.entity';
import { MeetingSocketModule } from '../meeting-socket/meeting-socket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Meeting, Participant]),
    MeetingSocketModule,
    HttpModule.register({
      baseURL: 'https://api.zoom.us/',
      timeout: 5000,
      maxRedirects: 5,
    }),
    AppConfigModule,
  ],
  controllers: [ZoomController],
  providers: [ZoomService],
  exports: [ZoomService],
})
export class ZoomModule {}
