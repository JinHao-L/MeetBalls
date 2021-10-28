import { Card, Col, Button } from 'react-bootstrap';
import { markParticipantPresent } from '../../../services/participants';
import { toast } from 'react-toastify';
import { extractError } from '../../../utils/extractError';
import MarkDuplicateButton from './MarkDuplicateButton';

export default function AwaitItem({
  meeting,
  setMeeting,
  position,
  showButton,
}) {
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
