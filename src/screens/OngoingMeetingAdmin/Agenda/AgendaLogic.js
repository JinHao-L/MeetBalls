import { getFormattedTime } from '../../../common/CommonFunctions';

export function initializeAgenda(time, agenda) {
  var lastTiming = time;
  for (let i = 0; i < agenda.length; i++) {
    agenda[i].actualDuration = agenda[i].expectedDuration;
    agenda[i].startTime = lastTiming;
    lastTiming += agenda[i].actualDuration;
  }
}

export function updateDelay(agenda, time, position, play) {
  if (position < 0 || position >= agenda.length) return;
  const delay = Math.max(
    0,
    time - agenda[position].startTime - agenda[position].actualDuration,
  );
  if (
    agenda[position].actualDuration === agenda[position].expectedDuration &&
    delay > 0 &&
    delay < 1000
  ) {
    play();
  }
  agenda[position].actualDuration += delay;
  updateAgenda(agenda, position);
}

function updateAgenda(agenda, position) {
  for (let i = 0; i < agenda.length; i++) {
    agenda[i].isCurrent = i === position;
  }
  if (position >= agenda.length) return;
  var lastTiming = agenda[position].startTime;
  for (let i = position; i < agenda.length; i++) {
    agenda[i].startTime = lastTiming;
    lastTiming += agenda[i].actualDuration;
  }
}

export function getCurrentPosition(meeting) {
  const agenda = meeting.agendaItems;
  for (let i = 0; i < agenda.length; i++) {
    if (agenda[i].isCurrent) {
      return i;
    }
  }
}

export function getEndTime(time, agenda, position, meeting) {
  if (position < 0) {
    var duration = 0;
    agenda.forEach((item) => {
      duration += item.expectedDuration;
    });
    const supposedStartTime = new Date(meeting.startedAt).getTime();
    if (time > supposedStartTime) {
      return getFormattedTime(new Date(time + duration));
    } else {
      return getFormattedTime(new Date(supposedStartTime + duration));
    }
  } else {
    if (agenda.length === 0) return '';
    var lastAgendaItem = agenda[agenda.length - 1];
    return getFormattedTime(
      new Date(lastAgendaItem.startTime + lastAgendaItem.actualDuration),
    );
  }
}

export function updateParticipants(participants, update) {
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
    const newList = [update, ...participants];
    return sortAndRemoveDupes(newList);
  } else {
    return participants.filter((x) => !x.isDuplicate);
  }
}

export function sortAndRemoveDupes(participants) {
  function byArrivalThenName(p1, p2) {
    const p1Join = p1.timeJoined;
    const p2Join = p2.timeJoined;
    if (p1Join && !p2Join) return -1;
    else if (!p1Join && p2Join) return 1;
    else return p1.userName.localeCompare(p2.userName);
  }

  return participants.filter((x) => !x.isDuplicate).sort(byArrivalThenName);
}
