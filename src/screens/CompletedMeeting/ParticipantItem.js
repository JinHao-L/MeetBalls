import { Card, Col } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { getFormattedDateTime } from '../../common/CommonFunctions';

export const participantProp = PropTypes.shape({
  userEmail: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  timeJoined: PropTypes.string,
  role: PropTypes.number,
});

export default function ParticipantItem({ person }) {
  const displayName = person.userName;
  const joinedTime = person.timeJoined;
  const presence = joinedTime
    ? `Joined: ${getFormattedDateTime(joinedTime)}`
    : 'Absent';

  return (
    <Col className="Container__padding--vertical-small">
      <Card>
        <Card.Body>
          <Card.Title>{displayName}</Card.Title>
          <Card.Text>{person?.userEmail}</Card.Text>
        </Card.Body>
        <Card.Footer>
          <Card.Text>{presence}</Card.Text>
        </Card.Footer>
      </Card>
    </Col>
  );
}

ParticipantItem.propTypes = {
  person: participantProp,
};
