import { defaultHeaders } from '../utils/axiosConfig';
import server from './server';

export const deleteParticipants = (meetingId, userEmail) => {
  const body = {
    meetingId,
    participants: [
      {
        userEmail,
      },
    ],
  };
  return server.delete(`participant`, {
    headers: {
      ...defaultHeaders.headers,
      'X-Participant': sessionStorage.getItem(meetingId) || '',
    },
    data: body,
  });
};

export const createParticipant = (meetingId, userEmail, userName) => {
  const body = {
    meetingId,
    userEmail,
    userName,
  };
  return server.post(`participant`, body, {
    headers: {
      ...defaultHeaders.headers,
      'X-Participant': sessionStorage.getItem(meetingId) || '',
    },
  });
};

export const createParticipants = (participants) => {
  return server.post(
    '/participant/create-many',
    { participants },
    {
      headers: {
        ...defaultHeaders.headers,
        'X-Participant':
          participants?.length > 0
            ? sessionStorage.getItem(participants[0].meetingId)
            : '',
      },
    },
  );
};

export const markParticipantPresent = (meetingId, id) => {
  const body = {
    participantId: id,
  };
  return server.put(`participant/${meetingId}/present`, body, {
    headers: {
      ...defaultHeaders.headers,
      'X-Participant': sessionStorage.getItem(meetingId) || '',
    },
  });
};

export const markParticipantAbsent = (meetingId, id) => {
  const body = {
    participantId: id,
  };
  return server.put(`participant/${meetingId}/absent`, body, {
    headers: {
      ...defaultHeaders.headers,
      'X-Participant': sessionStorage.getItem(meetingId) || '',
    },
  });
};

export const markParticipantDuplicate = (meetingId, id) => {
  const body = {
    participantId: id,
  };
  return server.put(`participant/${meetingId}/duplicate`, body, {
    headers: {
      ...defaultHeaders.headers,
      'X-Participant': sessionStorage.getItem(meetingId) || '',
    },
  });
};
