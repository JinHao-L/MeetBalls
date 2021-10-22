import { useEffect, useState } from 'react';
import { accessTokenKey, apiUrl } from '../common/CommonValues';
import { io } from 'socket.io-client';

export const useSocket = (meetingId) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (meetingId) {
      const accessToken = sessionStorage.getItem(accessTokenKey);
      const newSocket = io(`${apiUrl}/meeting`, {
        reconnectionDelayMax: 10000,
        auth: {
          token: accessToken,
          meetingId,
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

  return { socket };
};
