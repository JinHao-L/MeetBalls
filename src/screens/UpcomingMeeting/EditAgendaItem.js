import {
  Row,
  Col,
  Card,
  DropdownButton,
  Dropdown,
  Form,
  Button,
} from 'react-bootstrap';
import { useState } from 'react';
import { getFormattedDuration, isValidUrl } from '../../common/CommonFunctions';
import server from '../../services/server';
import { defaultHeaders } from '../../utils/axiosConfig';
import { toast } from 'react-toastify';
import { extractError } from '../../utils/extractError';
import { uploadFile } from '../../services/files';

export default function EditAgendaItem({
  setLoading,
  setEditing,
  meeting,
  position,
  setMeeting,
}) {
  const item = meeting.agendaItems[position];
  const [duration, setDuration] = useState(item.expectedDuration);
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description);
  const [speaker, setSpeaker] = useState(item.speaker || null);
  const [materials, setMaterials] = useState(item.speakerMaterials || '');
  const [file, setFile] = useState('');
  const [isUpload, setIsUpload] = useState(false);

  function DurationItems() {
    return durationMinutes.map((duration) => (
      <Dropdown.Item
        key={'Duration' + duration.mils}
        onClick={() => {
          setDuration(duration.mils);
        }}
      >
        {duration.display}
      </Dropdown.Item>
    ));
  }

  async function updateChanges() {
    if (name.length === 0) {
      toast.error('Name must not be empty.');
      return;
    }
    const linkSubmitted = materials !== '';
    let speakerMaterials = materials;
    if (speaker && isUpload && file) {
      try {
        const fileName = await uploadFile(file, meeting.id, speaker.id);
        setMaterials(fileName);
        speakerMaterials = fileName;
      } catch (err) {
        if (err.response?.status === 400) {
          toast.error(extractError(err) || 'Failed to upload file');
        } else {
          toast.error('Failed to upload file');
        }
        return;
      }
    } else if (
      speaker &&
      linkSubmitted &&
      !isValidUrl(materials) &&
      materials !== item.speakerMaterials
    ) {
      toast.error('Attempted to submit an invalid URL');
      setMaterials('');
      return;
    }

    try {
      setLoading(true);
      const actualPosition = meeting.agendaItems[position].position;
      await updateDatabase(
        meeting.agendaItems[position].name,
        meeting.id,
        actualPosition,
        name,
        duration,
        description,
        speaker,
        speakerMaterials,
      );
      meeting.agendaItems[position].name = name;
      meeting.agendaItems[position].expectedDuration = duration;
      meeting.agendaItems[position].description = description;
      if (speaker !== item.speaker)
        meeting.agendaItems[position].speaker = speaker;
      if (speakerMaterials !== item.speakerMaterials)
        meeting.agendaItems[position].speakerMaterials = speakerMaterials;
      setEditing(false);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  }

  function SpeakerItems() {
    const choices = meeting.participants.map((participant) => (
      <Dropdown.Item
        key={participant.userEmail}
        onClick={() => {
          setSpeaker(participant);
          if (!isValidUrl(materials)) {
            setMaterials('');
          }
        }}
      >
        {participant.userName}
      </Dropdown.Item>
    ));
    choices.push(
      <Dropdown.Item
        key="null choice"
        onClick={() => {
          setSpeaker(null);
          setMaterials('');
        }}
      >
        Remove speaker
      </Dropdown.Item>,
    );
    return choices;
  }

  function close() {
    const oldName = item.name;
    if (oldName === '') {
      const newMeeting = Object.assign({}, meeting);
      const newAgenda = newMeeting.agendaItems;
      newAgenda.splice(position, 1);
      newMeeting.agendaItems = newAgenda;
      setMeeting(newMeeting);
    } else {
      setEditing(false);
    }
  }

  return (
    <Col className="Container__padding--vertical-small">
      <Card border="primary">
        <Card.Header style={{ backgroundColor: '#8F6B58', color: 'white' }}>
          Editing Agenda Item
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
              variant="outline-primary"
              title={getFormattedDuration(duration)}
            >
              <DurationItems />
            </DropdownButton>
            <Form.Label column>Description</Form.Label>
            <Form.Control
              as="textarea"
              defaultValue={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <Form.Label column>Speaker (optional)</Form.Label>
            <DropdownButton
              variant="outline-primary"
              placeholder="Add presenter"
              title={speaker?.userName || '(No speaker assigned)'}
            >
              <SpeakerItems />
            </DropdownButton>
            <Form.Group as={Row} hidden={speaker === null}>
              <Form.Label column>Materials (optional)</Form.Label>
              <Form.Label
                column
                onClick={() => setIsUpload((prev) => !prev)}
                className="Clickable"
                disabled={speaker === null}
                variant="primary"
                style={{ textAlign: 'right', color: '#725546' }}
              >
                {isUpload ? 'Use url' : 'Upload local file'}
              </Form.Label>
            </Form.Group>
            <Form.Control
              type="file"
              disabled={speaker === null}
              hidden={speaker === null || !isUpload}
              onChange={(e) => setFile(e.target.files[0])}
            />
            <Form.Control
              value={materials}
              hidden={speaker === null || isUpload}
              placeholder="Add a URL to your presentation materials"
              disabled={speaker === null}
              onChange={(event) => setMaterials(event.target.value)}
            />
          </Form.Group>
          <div className="Buffer--10px" />
        </Card.Body>
        <Row>
          <Col style={{ paddingRight: 0 }}>
            <div className="d-grid gap-2">
              <Button variant="card-left-cancel" onClick={close}>
                Cancel
              </Button>
            </div>
          </Col>
          <Col style={{ paddingLeft: 0 }}>
            <div className="d-grid gap-2">
              <Button
                variant="card-right-confirm"
                onClick={() => updateChanges()}
              >
                Confirm
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
    </Col>
  );
}

async function updateDatabase(
  oldName,
  meetingId,
  position,
  name,
  duration,
  description,
  speaker,
  materials,
) {
  const data = {
    name: name,
    description: description,
    startTime: null,
    expectedDuration: duration,
    actualDuration: null,
    isCurrent: false,
    meetingId: meetingId,
    position: position,
  };
  if (speaker !== null) data.speakerId = speaker.id;
  if (materials !== '') data.speakerMaterials = materials;
  if (oldName.length === 0) {
    await server.post(`/agenda-item`, data, defaultHeaders);
  } else {
    await server.put(
      `/agenda-item/${meetingId}/${position}`,
      data,
      {
        headers: {
          ...defaultHeaders.headers,
          'X-Participant': sessionStorage.getItem(meetingId) || '',
        },
      },
    );
  }
}

const durationMinutes = [
  { mils: 300000, display: '5min' },
  { mils: 600000, display: '10min' },
  { mils: 900000, display: '15min' },
  { mils: 1200000, display: '20min' },
  { mils: 1500000, display: '25min' },
  { mils: 1800000, display: '30min' },
  { mils: 2100000, display: '35min' },
  { mils: 2400000, display: '40min' },
  { mils: 2700000, display: '45min' },
  { mils: 3000000, display: '50min' },
  { mils: 3300000, display: '55min' },
  { mils: 3600000, display: '1h' },
];
