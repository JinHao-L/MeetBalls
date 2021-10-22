import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import AgendaItem from './AgendaItem';
import { Button, Row, Col, ListGroup } from 'react-bootstrap';
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
  } else {
    items.push(
      <div className="d-grid gap-2" key={'Button'}>
        <p className="Text__subsubheader">
          Drag and drop items to reorder them. Once you are done, press on the
          save icon below to save any changes that you have made.
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
