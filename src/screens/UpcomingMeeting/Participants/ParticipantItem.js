import {
  Button,
  Row,
  Col,
  Card,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FaRegEnvelope } from 'react-icons/fa';
import server from '../../../services/server';
import { defaultHeaders } from '../../../utils/axiosConfig';
import { SmallLoadingIndicator } from '../../../components/SmallLoadingIndicator';
import { extractError } from '../../../utils/extractError';
import unmount from '../../../utils/unmount';
import EditParticipantItem from './EditParticipantItem';
import RoleBadge from '../../../components/RoleBadge';

export default function ParticipantItem({ setMeeting, meeting, position }) {
  const [removing, setRemoving] = useState(false);
  const [editing, setEditing] = useState(false);
  const participant = meeting.participants[position];
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return unmount(mounted, 'ParticipantItem');
  }, []);

  if (!editing && participant?.userEmail?.length === 0) {
    setEditing(true);
  }

  async function removeParticipant() {
    try {
      setRemoving(true);
      const newMeeting = Object.assign({}, meeting);
      const newParticipants = Object.assign([], newMeeting.participants);
      const id = newParticipants[position].id;
      await removeFromDatabase(id, meeting.id);
      newParticipants.splice(position, 1);
      newMeeting.participants = newParticipants;
      setMeeting(newMeeting);
      syncAgenda(id);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      console.log(`ParticipantItem still mounted? ${mounted.current}`);
      if (mounted.current) setRemoving(false);
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
        <Card>
          <div className="Buffer--50px" />
          <SmallLoadingIndicator />
          <div className="Buffer--50px" />
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <div className="Container__row--space-between">
              <Card.Title className="Text__elipsized--1-line">
                {participant?.userName != null &&
                participant?.userName.length > 0
                  ? participant?.userName
                  : 'Guest'}
              </Card.Title>
              {participant?.role !== 2 && participant.invited ? (
                <OverlayTrigger placement="top" overlay={renderTooltip}>
                  <div>
                    <FaRegEnvelope size={20} />
                  </div>
                </OverlayTrigger>
              ) : null}
            </div>
            <Card.Text className="Text__elipsized--1-line">
              {participant?.userEmail}
            </Card.Text>
            <RoleBadge role={participant?.role} />
          </Card.Body>
          <Buttons />
        </Card>
      )}
    </Col>
  );
}

async function removeFromDatabase(id, meetingId) {
  await server.delete('/participant', {
    headers: {
      ...defaultHeaders.headers,
      'X-Participant': sessionStorage.getItem(meetingId) || '',
    },
    data: {
      participants: [{ participantId: id }],
      meetingId: meetingId,
    },
  });
}

const renderTooltip = (props) => (
  <Tooltip id="button-tooltip" {...props}>
    Invite Sent
  </Tooltip>
);
