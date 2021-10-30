import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import server from '../../../services/server';
import { defaultHeaders } from '../../../utils/axiosConfig';
import unmount from '../../../utils/unmount';
import AgendaItem from './AgendaItem';

export default function AgendaItemList({
  meeting,
  setMeeting,
  isReordering,
  setReordering,
  lock,
}) {
  const [isDeleting, setDeleting] = useState(false);
  const items = [];
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return unmount(mounted, 'AgendaItemList');
  }, []);

  if (isReordering) {
    items.push(
      <p className="Text__subsubheader" key={'Header'}>
        Drag and drop items to reorder them. Once you are done, press on the
        save icon below to save any changes that you have made.
      </p>,
    );
    items.push(<div className="Buffer--20px" key={'Buffer'} />);
  }

  function setDeleteCleanUp(deleting) {
    console.log(`AgendaItemList still mounted? ${mounted.current}`);
    if (mounted.current) setDeleting(deleting);
  }

  for (let i = 0; i < meeting.agendaItems.length; i++) {
    items.push(
      <AgendaItem
        key={'Item' + i}
        meeting={meeting}
        setMeeting={setMeeting}
        position={i}
        isReordering={isReordering}
        isDeleting={isDeleting}
        setDeleting={setDeleteCleanUp}
        lock={lock}
      />,
    );
  }
  return (
    <>
      <div className="d-grid gap-2">
        {isReordering ? (
          <Button
            variant="outline-primary"
            onClick={() => {
              if (lock.current) {
                return;
              }
              setReordering(false);
              updateDatabase(meeting.id, meeting.agendaItems);
            }}
          >
            Save
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => {
              if (lock.current) {
                return;
              }
              removeEmpty(meeting, setMeeting);
              setReordering(true);
            }}
          >
            Reorder
          </Button>
        )}
      </div>
      <div className="Buffer--20px" />
      <DragDropContext
        onDragEnd={(result) => onDragEnd(result, meeting, setMeeting)}
      >
        <Droppable droppableId="Agenda">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {items}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
}

function onDragEnd(result, meeting, setMeeting) {
  const { destination, source } = result;
  if (destination === null) return;

  const idMatch = destination.droppableId === source.droppableId;
  const idxMatch = destination.index === source.index;
  if (idMatch && idxMatch) return;

  const newMeeting = Object.assign({}, meeting);
  const newAgenda = Object.assign([], newMeeting.agendaItems);
  const item = newAgenda.splice(source.index, 1);
  newAgenda.splice(destination.index, 0, item[0]);
  newMeeting.agendaItems = newAgenda;
  for (let i = 0; i < newAgenda.length; i++) {
    newAgenda[i].position = i;
  }
  setMeeting(newMeeting);
}

function removeEmpty(meeting, setMeeting) {
  const agenda = meeting.agendaItems;
  if (agenda.length > 0 && agenda[agenda.length - 1]?.name?.length === 0) {
    const newMeeting = Object.assign({}, meeting);
    const newAgenda = Object.assign([], newMeeting.agendaItems);
    newAgenda.splice(agenda.length - 1, 1);
    newMeeting.agendaItems = newAgenda;
    setMeeting(newMeeting);
  }
}

async function updateDatabase(meetingId, agendaItems) {
  const changes = [];
  agendaItems.forEach((item) => {
    if (item.prevPosition === null) return;
    changes.push({
      oldPosition: item.prevPosition,
      newPosition: item.position,
    });
    item.prevPosition = item.position;
  });
  if (changes.length > 0) {
    await server.put(
      '/agenda-item/positions',
      {
        positions: changes,
        meetingId: meetingId,
      },
      {
        headers: {
          ...defaultHeaders.headers,
          'X-Participant': sessionStorage.getItem(meetingId) || '',
        },
      },
    );
  }
}
