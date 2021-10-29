import { Card, Col, Button } from 'react-bootstrap';
import { markParticipantAbsent } from '../../../services/participants';
import { toast } from 'react-toastify';
import { extractError } from '../../../utils/extractError';
import MarkDuplicateButton from './MarkDuplicateButton';

export default function PresentItem({
  meeting,
  setMeeting,
  position,
  showButton,
}) {
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

async function unmarkPresent(meeting, setMeeting, position) {
  try {
    await markParticipantAbsent(meeting.id, meeting.participants[position].id);
    meeting.participants[position].timeJoined = null;
    setMeeting(meeting);
  } catch (error) {
    toast.error(extractError(error));
  }
}
