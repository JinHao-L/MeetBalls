import server from './server';

export const getZoomMeetingList = () => {
  return server.get(`zoom/meetings`);
};

export const getZoomMeeting = (meetingId) => {
  return server.get(`zoom/meetings/${meetingId}`);
};

export const linkZoomMeeting = (meetingId, options) => {
  // Sample options -- all optional
  // const options = {
  //   enableTranscriptions: false,
  //   participants: [],
  //   agendaItems: []
  // }

  return server.post(`zoom/meetings/${meetingId}`);
};
