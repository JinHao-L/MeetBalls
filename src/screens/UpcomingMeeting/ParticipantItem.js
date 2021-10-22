import {
  Button,
  Row,
  Col,
  Card,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { useState } from 'react';
import EditParticipantItem from './EditParticipantItem';
import server from '../../services/server';
import { defaultHeaders } from '../../utils/axiosConfig';
import { toast } from 'react-toastify';
import { SmallLoadingIndicator } from '../../components/SmallLoadingIndicator';
import { extractError } from '../../utils/extractError';
import { Envelope } from 'react-bootstrap-icons';

export default function ParticipantItem({ setMeeting, meeting, position }) {
  const [removing, setRemoving] = useState(false);
  const [editing, setEditing] = useState(false);
  const participant = meeting.participants[position];

  if (!editing && participant?.userEmail?.length === 0) {
    setEditing(true);
  }

  async function removeParticipant() {
    try {
      setRemoving(true);
      const newMeeting = Object.assign({}, meeting);
      const newParticipants = Object.assign([], newMeeting.participants);
      const email = newParticipants[position].userEmail;
      const id = newParticipants[position].id;
      await removeFromDatabase(email, meeting.id);
      newParticipants.splice(position, 1);
      newMeeting.participants = newParticipants;
      setMeeting(newMeeting);
      syncAgenda(id);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setRemoving(false);
    }
  }

  function syncAgenda(prevParticipantId) {
    setMeeting((meeting) => ({
      ...meeting,
      agendaItems: meeting.agendaItems.map((item) => {
        if (item?.speaker?.id === prevParticipantId) {
          item.speaker = null;
        }
        return item;
      }),
    }));
  }

  function Buttons() {
    if (participant?.role === 2) return null;
    return (
      <Row>
        <Col style={{ paddingRight: 0 }}>
          <div className="d-grid gap-2">
            <Button variant="card-left-danger" onClick={removeParticipant}>
              Remove
            </Button>
          </div>
        </Col>
        <Col style={{ paddingLeft: 0 }}>
          <div className="d-grid gap-2">
            <Button variant="card-right" onClick={() => setEditing(true)}>
              Edit
            </Button>
          </div>
        </Col>
      </Row>
    );
  }

  if (editing) {
    // Editing
    return (
      <EditParticipantItem
        setEditing={setEditing}
        setMeeting={setMeeting}
        meeting={meeting}
        position={position}
      />
    );
  }
  // Not editing
  return (
    <Col className="Container__padding--vertical-small">
      {removing ? (
        <SmallLoadingIndicator />
      ) : (
        <Card>
          <Card.Header className="Container__row--space-between">
            {participant?.role === 2 ? 'Host' : 'Participant'}
            {participant?.role !== 2 && participant.invited ? (
              <OverlayTrigger placement="top" overlay={renderTooltip}>
                <Envelope size={20} />
              </OverlayTrigger>
            ) : null}
          </Card.Header>
          <Card.Body>
            <Card.Title>
              {participant?.userName != null && participant?.userName.length > 0
                ? participant?.userName
                : 'Guest'}
            </Card.Title>
            <Card.Text>{participant?.userEmail}</Card.Text>
          </Card.Body>
          <Buttons />
        </Card>
      )}
    </Col>
  );
}

async function removeFromDatabase(email, meetingId) {
  await server.delete('/participant', {
    ...defaultHeaders,
    data: {
      participants: [{ userEmail: email }],
      meetingId: meetingId,
    },
  });
}

const renderTooltip = (props) => (
  <Tooltip id="button-tooltip" {...props}>
    Invite Sent
  </Tooltip>
);
