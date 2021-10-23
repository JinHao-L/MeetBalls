import server from '../services/server';
import { defaultHeaders } from './axiosConfig';

const UPCOMING = 'UpcomingMeetings';
const COMPLETED = 'CompletedMeetings';

const LIFESPAN = 15 * 60 * 1000;

function cacheUpcoming(data, type) {
  if (type !== UPCOMING && type !== COMPLETED) throw Error('Invalid type');

  const storageData = JSON.stringify(data);
  sessionStorage.setItem(type, storageData);

  setTimeout(clearMeetingsCache, LIFESPAN);
}

export async function pullMeetings() {
  const upcomingStr = sessionStorage.getItem(UPCOMING);
  const upcoming = upcomingStr
    ? JSON.parse(upcomingStr)
    : await pullUpcomingMeetings();

  const completedStr = sessionStorage.getItem(COMPLETED);
  const completed = completedStr
    ? JSON.parse(completedStr)
    : await pullPastMeetings();

  return { upcoming, completed };
}

export function clearMeetingsCache() {
  sessionStorage.removeItem(UPCOMING);
  sessionStorage.removeItem(COMPLETED);
}

async function pullUpcomingMeetings() {
  function sortMeetings(meetingA, meetingB) {
    const startA = meetingA.startedAt;
    const startB = meetingB.startedAt;
    if (startA > startB) return 1;
    else if (startA < startB) return -1;
    else return 0;
  }

  const response = await server.get('/meeting', {
    params: { type: 'upcoming' },
    ...defaultHeaders,
  });
  const meetings = response.data.sort(sortMeetings);
  cacheUpcoming(meetings, UPCOMING);
  return meetings;
}

async function pullPastMeetings() {
  function sortMeetings(meetingA, meetingB) {
    const startA = meetingA.startedAt;
    const startB = meetingB.startedAt;
    if (startA < startB) return 1;
    else if (startA > startB) return -1;
    else return 0;
  }

  const response = await server.get('/meeting', {
    params: { type: 'past' },
    ...defaultHeaders,
  });
  const meetings = response.data.sort(sortMeetings);
  cacheUpcoming(meetings, COMPLETED);
  return meetings;
}
