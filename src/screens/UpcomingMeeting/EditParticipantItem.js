import { useState } from 'react';
import { Button, Col, Card, CloseButton, Form, Modal } from 'react-bootstrap';
import server from '../../services/server';
import { defaultHeaders } from '../../utils/axiosConfig';

export default function EditParticipantItem({
  setEditing,
  setMeeting,
  meeting,
  position,
  removeParticipant,
}) {
  const [showModal, setShowModal] = useState(false);
  const participant = meeting.participants[position];
  const [email, setEmail] = useState(participant.userEmail);
  const [username, setUsername] = useState(participant.userName);

  async function updateChanges() {
    if (email.length === 0) {
      setShowModal(true);
      return;
    }
    const oldEmail = meeting.participants[position].userEmail;
    await updateDatabase(meeting.id, email, username, oldEmail);
    meeting.participants[position].userName = username;
    meeting.participants[position].userEmail = email;
    setEditing(false);
  }

  function close() {
    const oldEmail = meeting.participants[position].userEmail;
    if (oldEmail === '') {
      const newMeeting = Object.assign({}, meeting);
      const newParticipants = newMeeting.participants;
      newParticipants.splice(position, 1);
      newMeeting.participants = newParticipants;
      setMeeting(newMeeting);
    } else if (oldEmail.length > 0) {
      setEditing(false);
    } else {
      removeParticipant(setMeeting, meeting, position);
    }
  }

  return (
    <Col className="Container__padding--vertical-small">
      <Card>
        <Card.Header>
          <div className="Container__row--space-between">
            <p className="Text__card-header">Editing Participant</p>
            <CloseButton onClick={close} />
          </div>
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
            <div className="Buffer--20px" />
            <div className="d-grid gap-2">
              <Button variant="primary" onClick={() => updateChanges()}>
                Confirm
              </Button>
            </div>
          </Form.Group>
        </Card.Body>
      </Card>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header>
          <Modal.Title>Confirm?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="Text__paragraph">
            You have not specified an email, so this participant will be deleted
            if you choose to close. Would you still like to close?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => removeParticipant(setMeeting, meeting, position)}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </Col>
  );
}

async function updateDatabase(meetingId, newEmail, newUsername, oldEmail) {
  if (oldEmail.length !== 0) {
    await server.delete('/participant', {
      data: {
        participants: [{ userEmail: oldEmail }],
        meetingId: meetingId,
      },
      ...defaultHeaders,
    });
  }
  await server.post(
    '/participant',
    {
      meetingId: meetingId,
      userEmail: newEmail,
      userName: newUsername,
    },
    defaultHeaders,
  );
}
