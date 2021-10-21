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

export default function ParticipantItem({
  setMeeting,
  meeting,
  position,
  hostEmail,
}) {
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
      const newParticipants = newMeeting.participants;
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

  function RemoveParticipantButton() {
    if (participant?.role === 2) return null;
    return (
      <Col>
        <div className="d-grid gap-2">
          <Button variant="danger" onClick={removeParticipant}>
            Remove
          </Button>
        </div>
      </Col>
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
            {participant.userEmail === hostEmail ? 'Host' : 'Participant'}
            {participant.userEmail !== hostEmail && participant.invited ? (
              <OverlayTrigger placement="top" overlay={renderTooltip}>
                <Envelope size={20} className="Clickable" />
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
            <Row>
              <RemoveParticipantButton />
              <Col>
                <div className="d-grid gap-2">
                  <Button variant="primary" onClick={() => setEditing(true)}>
                    Edit
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
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
