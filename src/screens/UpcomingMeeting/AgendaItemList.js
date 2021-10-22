import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import AgendaItem from './AgendaItem';
import { Button } from 'react-bootstrap';
import server from '../../services/server';
import { defaultHeaders } from '../../utils/axiosConfig';
import { useState } from 'react';

export default function AgendaItemList({
  meeting,
  setMeeting,
  isReordering,
  setReordering,
}) {
  const [isDeleting, setDeleting] = useState(false);
  const items = [];

  if (!isReordering) {
    items.push(
      <div className="d-grid gap-2" key={'Button'}>
        <Button
          variant="outline-primary"
          onClick={() => {
            removeEmpty(meeting, setMeeting);
            setReordering(true);
          }}
        >
          Enable Reordering
        </Button>
      </div>,
    );
  } else {
    items.push(
      <div className="d-grid gap-2" key={'Button'}>
        <Button
          variant="primary"
          onClick={() => {
            setReordering(false);
            updateDatabase(meeting.id, meeting.agendaItems);
          }}
        >
          Save Order
        </Button>
        <p className="Text__subsubheader">
          Drag and drop items to reorder them. Once you are done, press on the
          "Save Order" bottom above to save any changes.
        </p>
      </div>,
    );
  }

  items.push(<div className="Buffer--20px" key={'Buffer'} />);
  for (let i = 0; i < meeting.agendaItems.length; i++) {
    items.push(
      <AgendaItem
        key={'Item' + i}
        meeting={meeting}
        setMeeting={setMeeting}
        position={i}
        isReordering={isReordering}
        isDeleting={isDeleting}
        setDeleting={setDeleting}
      />,
    );
  }
  return (
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
  );
}

function onDragEnd(result, meeting, setMeeting) {
  const { destination, source } = result;
  if (destination === null) return;

  const idMatch = destination.droppableId === source.droppableId;
  const idxMatch = destination.index === source.index;
  if (idMatch && idxMatch) return;

  const newMeeting = Object.assign({}, meeting);
  const newAgenda = newMeeting.agendaItems;
  const item = newAgenda.splice(source.index, 1);
  newAgenda.splice(destination.index, 0, item[0]);
  for (let i = 0; i < newAgenda.length; i++) {
    newAgenda[i].position = i;
  }
  newMeeting.agendaItems = newAgenda;
  setMeeting(newMeeting);
}

async function updateDatabase(meetingId, agendaItems) {
  const changes = [];
  agendaItems.forEach((item) => {
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
      defaultHeaders,
    );
  }
}

function removeEmpty(meeting, setMeeting) {
  const agenda = meeting.agendaItems;
  if (agenda.length > 0 && agenda[agenda.length - 1]?.name?.length === 0) {
    const newMeeting = Object.assign({}, meeting);
    const newAgenda = newMeeting.agendaItems;
    newAgenda.splice(agenda.length - 1, 1);
    newMeeting.agendaItems = newAgenda;
    setMeeting(newMeeting);
  }
}
