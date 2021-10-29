import { useEffect, useMemo, useState } from 'react';
import makeUrls from '@culturehq/add-to-calendar/dist/makeUrls';

const Calendar = ({ children, filename = false, href }) => {
  return (
    <a
      download={filename}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

export const AddToCalendar = ({ meeting }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (open) {
      const onClose = (event) => {
        console.log(event)
        if (event.target?.id !== 'calendar-button') {
          setOpen(false);
        }
      };
      document.addEventListener('click', onClose);

      return () => document.removeEventListener('click', onClose);
    }

    return undefined;
  }, [open]);

  const urls = useMemo(() => {
    if (meeting.type !== 1) {
      return;
    }
    const token = sessionStorage.getItem(meeting.id);
    let endTimestamp = new Date(meeting.startedAt).getTime();
    meeting.agendaItems.forEach((agenda) => {
      endTimestamp += agenda.expectedDuration;
    });

    return makeUrls({
      name: meeting.name,
      details: meeting.description,
      location: token
        ? `https://meetballsapp.com/meeting?token=${token}`
        : `https://meetballsapp.com/ongoing/${meeting.id}`,
      startsAt: new Date(meeting.startedAt).toISOString(),
      endsAt: new Date(endTimestamp).toISOString(),
    });
  }, [meeting]);

  if (!urls) return;
  return (
    <div className="chq-atc">
      <button
        type="button"
        id="calendar-button"
        className="chq-atc--button"
        onClick={() => setOpen((current) => !current)}
      >
        <svg width="20px" height="20px" viewBox="0 0 1024 1024">
          <path d="M704 192v-64h-32v64h-320v-64h-32v64h-192v704h768v-704h-192z M864 864h-704v-480h704v480z M864 352h-704v-128h160v64h32v-64h320v64h32v-64h160v128z" />
        </svg>{' '}
        Add to Calendar
      </button>
      {open && (
        <div
          className="chq-atc--dropdown"
          role="presentation"
          id="calendar_dropdown"
        >
          <Calendar href={urls.google}>Google</Calendar>
          <Calendar href={urls.ics} filename={'meeting'}>
            Outlook (ics)
          </Calendar>
          <Calendar href={urls.outlook}>Outlook Web App</Calendar>
          <Calendar href={urls.yahoo}>Yahoo</Calendar>
        </div>
      )}
    </div>
  );
};
