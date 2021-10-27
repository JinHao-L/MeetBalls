import { Card, Col, Row } from 'react-bootstrap';
import { useHistory } from 'react-router';
import { FaEye } from 'react-icons/fa';

export default function OngoingMeetingItem({ meeting }) {
  const history = useHistory();

  function Details() {
    return (
      <div className="Card__dashboard-content">
        <Card.Title className="Text__elipsized--1-line">
          {meeting.name}
        </Card.Title>
        <div className="Buffer--10px" />
        <Card.Subtitle>Ongoing</Card.Subtitle>
        <div className="Buffer--20px" />
        <Card.Text className="Text__elipsized--2-lines">
          {meeting.description}
        </Card.Text>
      </div>
    );
  }

  function Toggles() {
    return (
      <Row>
        <Col
          className="Toggle__card"
          onClick={() => history.push('/ongoing/' + meeting.id)}
        >
          <FaEye />
          View
        </Col>
      </Row>
    );
  }

  return (
    <Col
      xl={4}
      lg={6}
      md={6}
      sm={12}
      className="Container__padding--vertical-medium"
    >
      <Card className="Card__dashboard" bg="primary" text="white">
        <Card.Body>
          <Details />
          <div
            className="Line--horizontal"
            style={{ backgroundColor: '#c5c5c5' }}
          />
          <div className="Buffer--5px" />
          <Toggles />
        </Card.Body>
      </Card>
    </Col>
  );
}
