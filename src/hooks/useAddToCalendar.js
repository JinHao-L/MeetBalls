import { useCallback } from 'react';
import AddToCalendar from '@culturehq/add-to-calendar';

export const useAddToCalendar = (meeting) => {
  const component = useCallback(() => {
    if (meeting.type !== 1) {
      return;
    }
    const token = sessionStorage.getItem(meeting.id);
    let endTimestamp = new Date(meeting.startedAt).getTime();
    meeting.agendaItems.forEach((agenda) => {
      endTimestamp += agenda.expectedDuration;
    });

    return (
      <AddToCalendar
        event={{
          name: meeting.name,
          details: meeting.description,
          location: token
            ? `https://meetballsapp.com/meeting?token=${token}`
            : `https://meetballsapp.com/ongoing/${meeting.id}`,
          startsAt: new Date(meeting.startedAt).toISOString(),
          endsAt: new Date(endTimestamp).toISOString(),
        }}
        filename={'meeting'}
      >
        Add to Calendar
      </AddToCalendar>
    );
  }, [meeting?.id, meeting?.agendaItems?.length]);

  return component;
};
