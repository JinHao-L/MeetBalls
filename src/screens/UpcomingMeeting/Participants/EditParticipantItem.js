import { useEffect, useRef, useState } from 'react';
import { isNil } from 'lodash';
import { Button, Row, Col, Card, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import server from '../../../services/server';
import { defaultHeaders } from '../../../utils/axiosConfig';
import { extractError } from '../../../utils/extractError';
import { SmallLoadingIndicator } from '../../../components/SmallLoadingIndicator';
import unmount from '../../../utils/unmount';

export default function EditParticipantItem({
  setEditing,
  setMeeting,
  meeting,
  position,
}) {
  const participant = meeting.participants[position];
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(participant.userEmail);
  const [username, setUsername] = useState(participant.userName);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return unmount(mounted, 'EditParticipantItem');
  }, []);

  const checkForDuplicate = () => {
    return !isNil(
      meeting.participants.find(
        (participant) => participant.userEmail === email,
      ),
    );
  };

  function syncAgenda(prevParticipantId, newParticipant) {
    setMeeting((meeting) => ({
      ...meeting,
      agendaItems: meeting.agendaItems.map((item) => {
        if (item?.speaker?.id === prevParticipantId) {
          item.speaker =
            prevParticipantId === newParticipant.id ? newParticipant : null;
        }
        return item;
      }),
    }));
  }

  async function updateChanges() {
    if (email.length === 0) {
      toast.error('Email must not be empty.');
      return;
    }
    if (username.length === 0) {
      toast.error('Name must not be empty.');
      return;
    }

    if (participant.userName === username && participant.userEmail === email) {
      setEditing(false);
      return;
    }

    if (participant.userName === username && checkForDuplicate()) {
      toast.error(`Participant with email ${email} already exist`);
      return;
    }
    const oldEmail = meeting.participants[position].userEmail;
    const oldId = meeting.participants[position]?.id;
    try {
      setLoading(true);
      const newParticipant = await updateDatabase(
        meeting.id,
        email,
        username,
        oldEmail,
        oldId
      );
      meeting.participants[position] = newParticipant;
      syncAgenda(oldId, newParticipant);
      if (mounted.current) setEditing(false);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      console.log(`EditParticipantItem still mounted? ${mounted.current}`);
      if (mounted.current) setLoading(false);
    }
  }

  function close() {
    const oldEmail = meeting.participants[position].userEmail;
    if (oldEmail === '') {
      const newMeeting = Object.assign({}, meeting);
      const newParticipants = Object.assign([], newMeeting.participants);
      newParticipants.splice(position, 1);
      newMeeting.participants = newParticipants;
      setMeeting(newMeeting);
    } else {
      setEditing(false);
    }
  }

  return (
    <Col className="Container__padding--vertical-small">
      {loading ? (
        <Card>
          <div className="Buffer--50px" />
          <SmallLoadingIndicator />
          <div className="Buffer--50px" />
        </Card>
      ) : (
        <Card border="primary">
          <Card.Header style={{ backgroundColor: '#8F6B58', color: 'white' }}>
            Editing Participant
          </Card.Header>
          <Card.Body>
            <Form.Group>
              <Form.Label column>Name</Form.Label>
              <Form.Control
                defaultValue={username}
                onChange={(event) => setUsername(event.target.value)}
              />
              <Form.Label column>Email</Form.Label>
              <Form.Control
                defaultValue={email}
                onChange={(event) => setEmail(event.target.value)}
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
                <Button variant="card-right-confirm" onClick={updateChanges}>
                  Confirm
                </Button>
              </div>
            </Col>
          </Row>
        </Card>
      )}
    </Col>
  );
}

async function updateDatabase(meetingId, newEmail, newUsername, oldEmail, oldId) {
  if (oldEmail === newEmail.toLowerCase()) {
    const result = await server.put(
      '/participant',
      {
        meetingId: meetingId,
        participantId: oldId,
        userName: newUsername,
      },
      defaultHeaders,
    );
    return result.data;
  }

  if (oldEmail.length !== 0) {
    await server.delete('/participant', {
      data: {
        participants: [{ participantId: oldId }],
        meetingId: meetingId,
      },
      ...defaultHeaders,
    });
  }
  const result = await server.post(
    '/participant',
    {
      meetingId: meetingId,
      userEmail: newEmail.toLowerCase(),
      userName: newUsername,
    },
    defaultHeaders,
  );
  return result.data;
}
