import { defaultHeaders } from '../utils/axiosConfig';
import server from './server';

export const deleteAgendaItem = (meetingId, position) => {
  return server.delete(`agenda-item/${meetingId}/${position}`, {
    headers: {
      ...defaultHeaders.headers,
      'X-Participant': sessionStorage.getItem(meetingId) || '',
    },
  });
};

export const reorderPositions = (meetingId, agendaItems) => {
  const changes = [];
  agendaItems.forEach((item) => {
    changes.push({
      oldPosition: item.prevPosition,
      newPosition: item.position,
    });
    item.prevPosition = item.position;
  });
  const body = {
    positions: changes,
    meetingId,
  };
  return server.put(`agenda-item/positions`, body, {
    headers: {
      ...defaultHeaders.headers,
      'X-Participant': sessionStorage.getItem(meetingId) || '',
    },
  });
};

export const updateAgendaItem = ({
  meetingId,
  position,
  name,
  description,
  startTime,
  expectedDuration,
  isCurrent,
  actualDuration,
}) => {
  const body = {
    ...(name && { name }),
    ...(description && { description }),
    ...(startTime && { startTime }),
    ...(expectedDuration && { expectedDuration }),
    ...(actualDuration && { actualDuration }),
    ...(isCurrent && { isCurrent }),
  };
  return server.put(`agenda-item/${meetingId}/${position}`, body, {
    headers: {
      ...defaultHeaders.headers,
      'X-Participant': sessionStorage.getItem(meetingId) || '',
    },
  });
};
