import { Col, Card } from 'react-bootstrap';
import { getFormattedDuration } from '../../../common/CommonFunctions';
import {
  MaterialsSection,
  SpeakerSection,
} from '../../../components/AgendaItemComponents';

export default function ActiveItem({ item, isPassed, isEnded }) {
  var opacity = 1;
  if (isPassed && !isEnded) opacity = 0.5;
  return (
    <Col className="Container__padding--vertical-small">
      <Card style={{ opacity: opacity }}>
        <Card.Body>
          <Card.Title>{item.name}</Card.Title>
          <SpeakerSection item={item} />
          <Card.Text>{item.description}</Card.Text>
          <MaterialsSection item={item} variant={'outline-primary'} />
        </Card.Body>
        <Card.Footer>
          <Card.Text>
            {isPassed ? null : 'Expected '}Duration:{' '}
            {getFormattedDuration(item.actualDuration)}
          </Card.Text>
        </Card.Footer>
      </Card>
    </Col>
  );
}
