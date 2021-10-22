export const blankMeeting = {
  name: '',
  description: '',
  createdAt: '',
  duration: 3600000,
  hostId: '',
  id: '',
  joinUrl: '',
  startedAt: '1999-06-24T22:00:00Z',
  endedAt: '',
  enableTranscription: false,
  transcription: null,
  videoUrl: '',
  agendaItems: [],
  participants: [],
  meetingId: '',
  type: 1,
};

export const blankParticipant = {
  meetingId: '',
  role: 1,
  userName: '',
  userEmail: '',
  timeJoined: null,
};

export const blankAgenda = {
  meetingId: '',
  position: -1,
  name: '',
  description: '',
  speaker: null,
  speakerMaterials: '',
  startTime: null,
  actualDuration: null,
  expectedDuration: 300000,
  isCurrent: false,
};
