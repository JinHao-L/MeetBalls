import {
  Col,
  Card,
  DropdownButton,
  Dropdown,
  Form,
  CloseButton,
  Button,
} from 'react-bootstrap';
import { useState } from 'react';
import { getFormattedDuration } from '../../common/CommonFunctions';
import server from '../../services/server';
import { defaultHeaders } from '../../utils/axiosConfig';

export default function EditAgendaItem({
  setEditing,
  meeting,
  position,
}) {
  const item = meeting.agendaItems[position];
  const [duration, setDuration] = useState(item.expectedDuration);
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description);
  const [speaker, setSpeaker] = useState('');
  const [materials, setMaterials] = useState('');

  function DurationItems() {
    const items = [];
    durationMinutes.forEach((duration) =>
      items.push(
        <Dropdown.Item
          key={'Duration' + duration.mils}
          onClick={() => {
            setDuration(duration.mils);
          }}
        >
          {duration.display}
        </Dropdown.Item>,
      ),
    );
    return items;
  }

  async function updateChanges() {
    const actualPosition = meeting.agendaItems[position].position;
    await updateDatabase(
      meeting.id,
      actualPosition,
      name,
      duration,
      description,
      speaker,
      materials
    );
    meeting.agendaItems[position].name = name;
    meeting.agendaItems[position].expectedDuration = duration;
    meeting.agendaItems[position].description = description;
    meeting.agendaItems[position].speakerName = speaker;
    meeting.agendaItems[position].speakerMaterials = materials;
    setEditing(false);
  }

  return (
    <Col className="Container__padding--vertical-small">
      <Card>
        <Card.Header>
          <div className="Container__row--space-between">
            <p className="Text__card-header">Editing Agenda Item</p>
            <CloseButton onClick={() => setEditing(false)} />
          </div>
        </Card.Header>
        <Card.Body>
          <Form.Group>
            <Form.Label column>Name</Form.Label>
            <Form.Control
              defaultValue={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Form.Label column>Duration</Form.Label>
            <DropdownButton
              variant="outline-primary  "
              title={getFormattedDuration(duration)}
            >
              {DurationItems()}
            </DropdownButton>
            <Form.Label column>Description</Form.Label>
            <Form.Control
              as="textarea"
              defaultValue={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <div className="Buffer--20px" />
            <div className="d-grid gap-2">
              <Button variant="primary" onClick={() => updateChanges()}>
                Confirm
              </Button>
            </div>
          </Form.Group>
        </Card.Body>
      </Card>
    </Col>
  );
}

async function updateDatabase(
  meetingId,
  position,
  name,
  duration,
  description,
  speakerName,
  materials,
) {
  await server.put(
    `/agenda-item/${meetingId}/${position}`,
    {
      name: name,
      description: description,
      startTime: null,
      expectedDuration: duration,
      actualDuration: null,
      isCurrent: false,
      speakerName: speakerName,
      speakerMaterials: materials
    },
    defaultHeaders,
  );
}

const durationMinutes = [
  { mils: 300000, display: '5m' },
  { mils: 600000, display: '10m' },
  { mils: 900000, display: '15m' },
  { mils: 1200000, display: '20m' },
  { mils: 1500000, display: '25m' },
  { mils: 1800000, display: '30m' },
  { mils: 2100000, display: '35m' },
  { mils: 2400000, display: '40m' },
  { mils: 2700000, display: '45m' },
  { mils: 3000000, display: '50m' },
  { mils: 3300000, display: '55m' },
  { mils: 3600000, display: '1h 0m' },
];
