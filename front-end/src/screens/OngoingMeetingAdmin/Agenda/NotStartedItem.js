import { Col, Card } from 'react-bootstrap';
import { getFormattedDuration } from '../../../common/CommonFunctions';
import {
  MaterialsSection,
  SpeakerSection,
} from '../../../components/AgendaItemComponents';

export default function NotStartedItem({ item }) {
  return (
    <Col className="Container__padding--vertical-small">
      <Card>
        <Card.Body>
          <Card.Title>{item.name}</Card.Title>
          <SpeakerSection item={item} />
          <div className="Buffer--10px" />
          <Card.Text>{item.description}</Card.Text>
          <MaterialsSection item={item} />
        </Card.Body>
        <Card.Footer>
          <Card.Text>
            Estimated Duration: {getFormattedDuration(item.expectedDuration)}
          </Card.Text>
        </Card.Footer>
      </Card>
    </Col>
  );
}
