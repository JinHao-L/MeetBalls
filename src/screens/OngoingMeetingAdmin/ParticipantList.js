import { Card, Col, Button, Row } from 'react-bootstrap';
import {
  markParticipantPresent,
  markParticipantAbsent,
  markParticipantDuplicate,
} from '../../services/participants';
import { toast } from 'react-toastify';
import { extractError } from '../../utils/extractError';
import { useMemo, useState } from 'react';
import ConfirmDupeModal from './ConfirmDupeModal';
import { Trash } from 'react-bootstrap-icons';

export default function ParticipantList({
  meeting,
  setMeeting,
  position,
  shouldShowButton,
}) {
  const participants = useMemo(() => {
    return meeting.participants;
  }, [meeting]);
  const ended = useMemo(
    () => position >= meeting.agendaItems.length,
    [position, meeting],
  );
  return (
    <Row>
      {participants.map((participant, i) => {
        if (participant.timeJoined != null) {
          return (
            <PresentItem
              meeting={meeting}
              setMeeting={setMeeting}
              position={i}
              showButton={!ended && shouldShowButton}
              key={'Participant' + i}
            />
          );
        } else {
          return (
            <AwaitItem
              meeting={meeting}
              setMeeting={setMeeting}
              position={i}
              showButton={!ended && shouldShowButton}
              key={'Participant' + i}
            />
          );
        }
      })}
    </Row>
  );
}

function AwaitItem({ meeting, setMeeting, position, showButton }) {
  const participant = meeting.participants[position];
  const displayName =
    participant.userName && participant.userName.length > 0
      ? participant.userName
      : 'Guest';
  return (
    <Col
      className="Container__padding--vertical-small"
      sm={12}
      md={6}
      lg={6}
      style={{ padding: 'auto' }}
    >
      <Card
        bg={showButton ? null : 'danger'}
        text={showButton ? 'dark' : 'light'}
        style={{ height: '100%' }}
      >
        <Card.Body>
          <Card.Title className="Text__elipsized--1-line">
            {displayName}
          </Card.Title>
          <Card.Text className="Text__elipsized--1-line">
            {participant.userEmail}
          </Card.Text>
        </Card.Body>
        {showButton && participant.role !== 2 && (
          <div className="Container__row--space-between">
            <div className="d-grid gap-2" style={{ width: '100%' }}>
              <Button
                variant="card-left"
                onClick={() => markPresent(meeting, setMeeting, position)}
              >
                Mark as Present
              </Button>
            </div>
            <MarkDuplicateButton
              setMeeting={setMeeting}
              meeting={meeting}
              position={position}
              variant="card-right-danger"
            />
          </div>
        )}
      </Card>
    </Col>
  );
}

function PresentItem({ meeting, setMeeting, position, showButton }) {
  const participant = meeting.participants[position];
  return (
    <Col
      className="Container__padding--vertical-small"
      style={{ padding: 'auto' }}
      sm={12}
      md={6}
      lg={6}
    >
      <Card bg="success" text="light" style={{ height: '100%' }}>
        <Card.Body>
          <Card.Title className="Text__elipsized--1-line">
            {participant.userName != null && participant.userName.length > 0
              ? participant.userName
              : 'Guest'}
          </Card.Title>

          <Card.Text className="Text__elipsized--1-line">
            {participant.userEmail}
          </Card.Text>
        </Card.Body>
        {showButton && participant.role !== 2 && (
          <div className="Container__row--space-between">
            <div className="d-grid gap-2" style={{ width: '100%' }}>
              <Button
                variant="card-left-light"
                onClick={() => unmarkPresent(meeting, setMeeting, position)}
              >
                Mark as Absent
              </Button>
            </div>
            <MarkDuplicateButton
              setMeeting={setMeeting}
              meeting={meeting}
              position={position}
              variant={'card-right-danger-light'}
            />
          </div>
        )}
      </Card>
    </Col>
  );
}

function MarkDuplicateButton({ meeting, setMeeting, position, variant }) {
  const participant = meeting.participants[position];
  const [showModal, setShowModal] = useState(false);
  const markDupe = () => markDuplicate(meeting, setMeeting, position);
  return (
    <>
      <Button
        variant={variant}
        onClick={() => setShowModal(true)}
        style={{ width: 50 }}
      >
        <Trash />
      </Button>
      <ConfirmDupeModal
        participant={participant}
        showModal={showModal}
        setShowModal={setShowModal}
        onMarkDuplicate={markDupe}
      />
    </>
  );
}

async function markPresent(meeting, setMeeting, position) {
  try {
    await markParticipantPresent(
      meeting.id,
      meeting.participants[position].userEmail,
    );
    meeting.participants[position].timeJoined = new Date().toISOString();
    setMeeting(meeting);
  } catch (error) {
    toast.error(extractError(error));
  }
}

async function unmarkPresent(meeting, setMeeting, position) {
  try {
    await markParticipantAbsent(
      meeting.id,
      meeting.participants[position].userEmail,
    );
    meeting.participants[position].timeJoined = null;
    setMeeting(meeting);
  } catch (error) {
    toast.error(extractError(error));
  }
}

async function markDuplicate(meeting, setMeeting, position) {
  try {
    await markParticipantDuplicate(
      meeting.id,
      meeting.participants[position].userEmail,
    );
    delete meeting.participants[position];
    setMeeting(meeting);
  } catch (error) {
    toast.error(extractError(error));
  }
}
