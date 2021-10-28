import { Col, Card } from 'react-bootstrap';
import { getFormattedDuration } from '../../../common/CommonFunctions';
import {
  MaterialsSection,
  SpeakerSection,
} from '../../../components/AgendaItemComponents';

export default function CurrentItem({ item, time, reference }) {
  const currentDuration = time - item.startTime;
  const timeRemaining = item.actualDuration - currentDuration;
  const exceeded = currentDuration - item.expectedDuration;
  let timeRemainingText =
    'Time Remaining: ' +
    getFormattedDuration(timeRemaining - (timeRemaining % 1000));

  if (exceeded > 0) {
    const exceededTime = getFormattedDuration(exceeded - (exceeded % 60000));
    timeRemainingText += ` ( Exceeded by ${exceededTime})`;
  }

  return (
    <Col className="Container__padding--vertical-small" ref={reference}>
      <Card bg={timeRemaining > 0 ? 'primary' : 'danger'} text="light">
        <Card.Body>
          <Card.Title>{item.name}</Card.Title>
          <SpeakerSection item={item} />
          <Card.Text>{item.description}</Card.Text>
          <MaterialsSection
            item={item}
            variant={timeRemaining > 0 ? 'secondary' : 'outline-danger'}
          />
        </Card.Body>
        <Card.Footer>
          <Card.Text>{timeRemainingText}</Card.Text>
        </Card.Footer>
      </Card>
    </Col>
  );
}
