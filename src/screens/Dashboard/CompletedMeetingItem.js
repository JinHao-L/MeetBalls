import { Card, Col, Row } from 'react-bootstrap';
import { getDateInfo } from '../../common/CommonFunctions';
import { useHistory } from 'react-router';
import { FaEye, FaRegClone } from 'react-icons/fa';

export default function CompletedMeetingItem({
  meeting,
  setCloneMeeting,
  setShowOverlay,
}) {
  const dateInfo = getDateInfo(meeting.startedAt, meeting.duration);
  const history = useHistory();

  function viewMeeting() {
    history.push(`/completed/${meeting.id}`);
  }

  function Details() {
    return (
      <div className="Card__dashboard-content">
        <Card.Title className="Text__elipsized--1-line">
          {meeting.name}
        </Card.Title>
        <div className="Buffer--10px" />
        <Card.Subtitle className="Text__elipsized--1-line">
          ENDED - {dateInfo.date} {dateInfo.endTime}
        </Card.Subtitle>
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
        <Col onClick={viewMeeting} className="Toggle__card">
          <FaEye />
          View
        </Col>
        <Col
          onClick={() => {
            setCloneMeeting(meeting);
            setShowOverlay(true);
          }}
          className="Toggle__card"
        >
          <FaRegClone />
          Clone
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
      <Card style={{ backgroundColor: '#e5e5e5' }} className="Card__dashboard">
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
