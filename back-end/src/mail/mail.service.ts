import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { User } from '../users/user.entity';
import { Participant } from 'src/participants/participant.entity';
import { Meeting } from 'src/meetings/meeting.entity';
import { ParticipantRole } from 'src/shared/enum/participant-role.enum';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmailConfirmation(user: User, url: string): Promise<boolean> {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'MeetBalls Email Confirmation',
      template: './index',
      context: {
        title: 'Email Confirmation',
        username: user.firstName,
        content: 'Please click below to confirm your email',
        action_url: url,
        action_text: 'Confirm email',
      },
    });

    return true;
  }

  async sendPasswordReset(user: User, url: string): Promise<boolean> {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'MeetBalls Password Reset',
      template: './index',
      context: {
        title: 'Password reset',
        username: user.firstName,
        content: 'Please click below to reset your password',
        action_url: url,
        action_text: 'Reset password',
      },
    });

    return true;
  }

  async sendMagicLink(
    participant: Participant,
    meeting: Meeting,
    host: { firstName: string; email: string },
    magicLink: string,
  ): Promise<boolean> {
    await this.mailerService.sendMail({
      to: participant.userEmail,
      subject: `Invitation to ${meeting.name}`,
      template: './invite',
      context: {
        title: 'Join MeetBalls Meeting',
        username: participant.userName,
        pre_meet_content: this.getCustomContent(
          host.firstName,
          participant.role,
          meeting.name,
        ),
        meeting_name: meeting.name,
        meeting_time: this.getFormattedDate(meeting.startedAt),
        meeting_description: meeting.description || 'No description provided',
        zoom_url: meeting.joinUrl,
        post_meet_content: `Please click the link below to join the MeetBalls meeting using your specialised meeting link.`,
        action_url: magicLink,
        action_text: 'Join Meeting',
        footer_note: `For any additional queries, do email the organiser at ${host.email}. `,
      },
    });

    return true;
  }

  private getCustomContent(
    hostName: string,
    role: ParticipantRole,
    meetingName: string,
  ) {
    if (role === ParticipantRole.CO_HOST) {
      return `${hostName} has invited you to join ${meetingName} as a co-host.`;
    } else {
      return `${hostName} has invited you to join ${meetingName} as a participant.`;
    }
  }

  private getFormattedDate(date: Date) {
    return date.toLocaleString('en-us', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short',
      timeZone: 'Asia/Singapore',
    });
  }
}
