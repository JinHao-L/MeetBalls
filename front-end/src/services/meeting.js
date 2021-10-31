import server from './server';
import { agendaReviver } from '../common/CommonFunctions';
import { defaultHeaders } from '../utils/axiosConfig';

// id of meeting
export const getMeeting = async (meetingId) => {
  const res = await server.get(`meeting/${meetingId}`, {
    transformResponse: [],
    headers: {
      'X-Participant': sessionStorage.getItem(meetingId) || '',
    },
  });
  res.data = JSON.parse(res.data, agendaReviver);
  return res;
};

export const updateMeeting = (newMeeting) => {
  const { name, description, duration, enableTranscription } = newMeeting;
  const body = {
    ...(name && { name }),
    ...(description && { description }),
    ...(duration && { duration }),
    ...(enableTranscription && { enableTranscription }),
  };
  return server.put(`meeting/${newMeeting.id}`, body, {
    headers: {
      ...defaultHeaders.headers,
      'X-Participant': sessionStorage.getItem(newMeeting.id) || '',
    },
  });
};

export const syncMeetingWithZoom = async (meeting) => {
  const { id, meetingId, zoomUuid } = meeting;
  if (zoomUuid && meeting.type === 1) {
    const response = await server.post(`zoom/meetings/sync`, {
      id,
      meetingId,
      zoomUuid,
    });
    const updatedZoomUuid = response.data;
    meeting.zoomUuid = updatedZoomUuid;
    return updatedZoomUuid;
  }
  return false;
};

export const callStartMeeting = (id) => {
  return server.post(`meeting/start/${id}`, {}, {
    headers: {
      ...defaultHeaders.headers,
      'X-Participant': sessionStorage.getItem(id) || '',
    },
  });
};

export const callNextMeeting = (id) => {
  return server.post(`meeting/next/${id}`, {}, {
    headers: {
      ...defaultHeaders.headers,
      'X-Participant': sessionStorage.getItem(id) || '',
    },
  });
};

export const callEndMeeting = (id) => {
  return server.post(`meeting/end/${id}`, {}, {
    headers: {
      ...defaultHeaders.headers,
      'X-Participant': sessionStorage.getItem(id) || '',
    },
  });
};
