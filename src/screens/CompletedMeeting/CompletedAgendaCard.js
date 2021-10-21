import PropTypes from 'prop-types';
import { Col, Card } from 'react-bootstrap';
import {
  getDateInfo,
  getFormattedDuration,
} from '../../common/CommonFunctions';
import {
  MaterialsSection,
  SpeakerSection,
} from '../../components/AgendaItemComponents';

export default function CompletedAgendaCard({ agendaItem }) {
  const duration = agendaItem.actualDuration;
  const expectedDuration = agendaItem.expectedDuration;

  const exceededDuration = duration > expectedDuration;
  const { startTime, endTime } = getDateInfo(agendaItem.startTime, duration);
  const durationStr = getFormattedDuration(duration);

  return (
    <Col className="Container__padding--vertical-small">
      <Card
        bg={exceededDuration ? 'danger' : null}
        text={exceededDuration ? 'light' : 'dark'}
      >
        <Card.Body>
          <Card.Title>{agendaItem.name}</Card.Title>
          <SpeakerSection item={agendaItem} />
          <Card.Text>{agendaItem.description}</Card.Text>
          <MaterialsSection
            item={agendaItem}
            variant={exceededDuration ? 'outline-danger' : 'primary'}
          />
        </Card.Body>
        <Card.Footer>
          <Card.Text>
            {startTime} - {endTime} ({durationStr})
          </Card.Text>
        </Card.Footer>
      </Card>
    </Col>
  );
}

CompletedAgendaCard.propTypes = {
  agendaItem: PropTypes.shape({
    meetingId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    actualDuration: PropTypes.number.isRequired,
    expectedDuration: PropTypes.number.isRequired,
  }).isRequired,
};
