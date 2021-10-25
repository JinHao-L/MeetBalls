import server from '../services/server';
import { defaultHeaders } from './axiosConfig';

const UPCOMING = 'UpcomingMeetings';
const COMPLETED = 'CompletedMeetings';
const TTL = 'TTL';
const REGEX_CHECK = new RegExp(`(${UPCOMING}|${COMPLETED})`);

const LIFESPAN = 15 * 60 * 1000;

function cacheUpcoming(data, type, page, limit) {
  if (type !== UPCOMING && type !== COMPLETED) throw Error('Invalid type');

  const storageData = JSON.stringify({ items: data.items, meta: data.meta });
  sessionStorage.setItem(type + '_' + limit + '_' + page, storageData);

  const date = new Date();
  date.setMilliseconds(date.getMilliseconds() + LIFESPAN);

  sessionStorage.setItem(TTL, date.toISOString());
}

export async function pullMeetings(page, limit) {
  const validTTL = new Date(sessionStorage.getItem(TTL)) > Date.now();
  const upcomingStr =
    validTTL && sessionStorage.getItem(UPCOMING + '_' + limit + '_' + page);
  const upcoming = upcomingStr
    ? JSON.parse(upcomingStr)
    : await pullUpcomingMeetings(page, limit);

  const completedLimit = limit - upcoming.meta.itemCount;
  const completedStr =
    validTTL &&
    sessionStorage.getItem(COMPLETED + '_' + completedLimit + '_' + page);
  const completed = completedStr
    ? JSON.parse(completedStr)
    : await pullPastMeetings(page, completedLimit);

  const totalUpcomingCount = upcoming.meta.totalItems;
  const totalCompletedCount = completed.meta.totalItems;
  const totalCount = totalCompletedCount + totalUpcomingCount;

  return {
    upcoming: upcoming.items,
    completed: completed.items,
    count: {
      upcoming: totalUpcomingCount,
      completed: totalCompletedCount,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
    },
  };
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
  cacheUpcoming(paginatedMeetings, UPCOMING, page, limit);
  return paginatedMeetings;
}

async function pullPastMeetings(page, limit) {
  const response = await server.get('/meeting', {
    params: { type: 'past', orderBy: 'desc', page, limit },
    ...defaultHeaders,
  });
  const paginatedMeetings = response.data;
  cacheUpcoming(paginatedMeetings, COMPLETED, page, limit);
  return paginatedMeetings;
}
