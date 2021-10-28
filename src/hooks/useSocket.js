import { useEffect, useState } from 'react';
import { accessTokenKey, apiUrl } from '../common/CommonValues';
import { io } from 'socket.io-client';

export const useSocket = (meetingId) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (meetingId) {
      const accessToken = sessionStorage.getItem(accessTokenKey);
      const participantToken = sessionStorage.getItem(meetingId);
      const newSocket = io(`${apiUrl}/meeting`, {
        reconnectionDelayMax: 10000,
        auth: {
          token: accessToken,
          meetingId,
          participant: participantToken,
        },
      });
      newSocket.on('connect', function () {});
      newSocket.on('disconnect', function (_) {});
      setSocket(newSocket);

      return () => {
        if (socket) {
          socket.removeAllListeners();
          socket.disconnect();
        }
      };
    }
  }, [meetingId]);

  function mergeSuggestions(suggestions, update) {
    let hasUpdate = false;
    suggestions = suggestions.map((s) => {
      if (s.id === update.id) {
        hasUpdate = true;
        return update;
      } else {
        return s;
      }
    });
    if (!hasUpdate) {
      // is new suggestion (add to bottom)
      const newList = [...suggestions, update];
      return newList;
    } else {
      return suggestions;
    }
  }

  function mergeParticipants(participants, update) {
    let hasUpdate = false;
    participants = participants.map((ppl) => {
      if (ppl.id === update.id) {
        hasUpdate = true;
        return update;
      } else {
        return ppl;
      }
    });

    if (!hasUpdate) {
      const emptyIdx = participants.findIndex((item) => !item.id);
      if (emptyIdx === -1) {
        return [...participants, update];
      } else {
        participants.splice(emptyIdx, 0, update);
        return participants;
      }
    } else {
      return participants.filter((x) => !x.isDuplicate);
    }
  }

  return { socket, mergeSuggestions, mergeParticipants };
};
