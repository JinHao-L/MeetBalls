import server from '../services/server';
import { defaultHeaders } from './axiosConfig';

const MEETINGS = 'Meetings';
const TTL = 'TTL';
const REGEX_CHECK = new RegExp(`(${MEETINGS})`);

const LIFESPAN = 5 * 60 * 1000;

function cacheMeeting(data, page, limit) {
  const storageData = JSON.stringify(data);
  sessionStorage.setItem([MEETINGS, page, limit].join('_'), storageData);

  const date = new Date();
  const timestamp = date.getTime() + LIFESPAN;

  sessionStorage.setItem(TTL, timestamp);
}

export async function pullMeetings(page, limit) {
  const validTTL = new Date(sessionStorage.getItem(TTL)) > Date.now();
  const meetingStr =
    validTTL && sessionStorage.getItem([MEETINGS, page, limit].join('_'));
  if (validTTL && meetingStr) {
    return JSON.parse(meetingStr);
  }

  const upcoming = await pullUpcomingMeetings(page, limit);

  const completedLimit = limit - upcoming.meta.itemCount;
  const skipAmount =
    upcoming.meta.itemCount === 0 && upcoming.meta.totalItems % limit > 0
      ? limit - (upcoming.meta.totalItems % limit)
      : 0;
  const completedPage = Math.max(page - upcoming.meta.totalPages, 1);

  const completed = await pullPastMeetings(completedPage, completedLimit, skipAmount);

  const totalUpcomingCount = upcoming.meta.totalItems;
  const totalCompletedCount = completed.meta.totalItems;
  const totalCount = totalCompletedCount + totalUpcomingCount;

  const output = {
    upcoming: upcoming.items,
    completed: completed.items,
    count: {
      upcoming: totalUpcomingCount,
      completed: totalCompletedCount,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
    },
  };
  cacheMeeting(output, page, limit);
  return output;
}

export function clearMeetingsCache() {
  Object.keys(sessionStorage)
    .filter((k) => REGEX_CHECK.test(k))
    .forEach((k) => sessionStorage.removeItem(k));
  sessionStorage.removeItem(TTL);
}

async function pullUpcomingMeetings(page, limit) {
  const response = await server.get('/meeting', {
    params: { type: 'upcoming', orderBy: 'asc', page, limit },
    ...defaultHeaders,
  });
  const paginatedMeetings = response.data;
  return paginatedMeetings;
}

async function pullPastMeetings(page, limit, skip) {
  const response = await server.get('/meeting', {
    params: { type: 'past', orderBy: 'desc', page, limit, skip },
    ...defaultHeaders,
  });
  const paginatedMeetings = response.data;
  return paginatedMeetings;
}
