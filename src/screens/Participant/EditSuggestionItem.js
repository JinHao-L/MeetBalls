import {
  Col,
  Row,
  Button,
  Card,
  Form,
  Dropdown,
  DropdownButton,
} from 'react-bootstrap';
import { useState } from 'react';
import { getFormattedDuration } from '../../common/CommonFunctions';
import { toast } from 'react-toastify';
import server from '../../services/server';
import { extractError } from '../../utils/extractError';
import { defaultHeaders } from '../../utils/axiosConfig';
import SpeakerSelection from '../../components/SpeakerSelection';

export default function EditSuggestionItem({
  item,
  participants,
  suggestions,
  setSuggestions,
  setEditing,
}) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description);
  const [duration, setDuration] = useState(item.expectedDuration);
  const [speaker, setSpeaker] = useState(item.speaker || null);

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

  function close() {
    if (item.name === '') {
      const index = suggestions.indexOf(item);
      if (index >= 0) {
        const newSuggestions = Object.assign([], suggestions);
        newSuggestions.splice(index, 1);
        setSuggestions(newSuggestions);
      }
    } else {
      setEditing(false);
    }
  }

  async function updateChanges() {
    if (name.length === 0) {
      toast.error('Name must not be empty.');
      return;
    }
    const data = {
      meetingId: item.meetingId,
      name: name,
      description: description,
      expectedDuration: duration,
      speakerId: speaker?.id
    };
    if (item.name.length === 0) {
      try {
        const response = await server.post('/suggestion', data, {
          headers: {
            ...defaultHeaders.headers,
            'X-Participant': sessionStorage.getItem(item.meetingId) || '',
          },
        });
        if (response.status !== 201) {
          toast.error('Failed to Submit');
          return;
        }
        const result = response.data;
        suggestions.shift();
        const newSuggestions = [result, ...suggestions];
        setSuggestions(newSuggestions);
        setEditing(false);
      } catch (err) {
        toast.error(extractError(err));
      }
    } else {
      try {
        const response = await server.put('/suggestion/' + item.id, data, {
          headers: {
            ...defaultHeaders.headers,
            'X-Participant': sessionStorage.getItem(item.meetingId) || '',
          },
        });
        if (response.status !== 200) {
          toast.error('Failed to Submit');
          return;
        }
        item.name = name;
        item.description = description;
        item.expectedDuration = duration;
        item.speaker = speaker;
        setEditing(false);
      } catch (err) {
        toast.error(extractError(err));
      }
    }
  }

  return (
    <Col lg={12} md={12} sm={12} className="Container__padding--vertical-small">
      <Card border="primary">
        <Card.Header style={{ backgroundColor: '#8F6B58', color: 'white' }}>
          Editing Suggestion
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
            <SpeakerSelection
              candidates={participants}
              current={speaker}
              onSelect={setSpeaker}
              onClear={() => setSpeaker(null)}
            />
          </Form.Group>
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
              <Button variant="card-right-confirm" onClick={updateChanges}>
                Confirm
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
    </Col>
  );
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
