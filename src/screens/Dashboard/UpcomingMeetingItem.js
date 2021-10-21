import { useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { getDateInfo, openLinkInNewTab } from '../../common/CommonFunctions';
import { useHistory } from 'react-router';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import server from '../../services/server';
import PropTypes from 'prop-types';
import { Trash, CameraVideo, Pen, Front } from 'react-bootstrap-icons';
import { FullLoadingIndicator } from '../../components/FullLoadingIndicator';
import { toast } from 'react-toastify';

export default function UpcomingMeetingItem({
  meeting,
  pullMeeting,
  setCloneMeeting,
  setShowOverlay,
}) {
  const dateInfo = getDateInfo(meeting.startedAt, meeting.duration);
  const history = useHistory();
  const [deleting, setDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  function editMeeting() {
    history.push(`/meeting/${meeting.id}`);
  }

  function startMeeting() {
    history.push(`/ongoing/${meeting.id}`);
  }

  function deleteMeeting() {
    if (deleting) return;
    setDeleting(true);
    return server
      .delete(`/meeting/${meeting.id}`)
      .then((_) => {
        pullMeeting();
        history.push('/home');
      })
      .catch(() => {
        toast.error('Failed to delete');
      })
      .finally(() => setDeleting(false));
  }

  function Details() {
    return (
      <div className="Card__dashboard-content">
        <Card.Title className="Text__elipsized--1-line">
          {meeting.name}
        </Card.Title>
        <div className="Buffer--10px" />
        <Card.Subtitle className="Text__elipsized--1-line">
          {dateInfo.date} {dateInfo.startTime}
        </Card.Subtitle>
        <div className="Buffer--20px" />
        <Card.Text className="Text__elipsized--5-lines">
          {meeting.description}
        </Card.Text>
      </div>
    );
  }

  function Toggles() {
    return (
      <Row>
        <Col onClick={startMeeting} className="Toggle__card">
          <CameraVideo />
          Start
        </Col>
        <Col onClick={editMeeting} className="Toggle__card">
          <Pen />
          Edit
        </Col>
        <Col
          onClick={() => {
            setCloneMeeting(meeting);
            setShowOverlay(true);
          }}
          className="Toggle__card"
        >
          <Front />
          Clone
        </Col>
        <Col
          onClick={() => setShowConfirmDelete(true)}
          className="Toggle__card"
        >
          <Trash />
          Delete
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
      <Card className="Card__dashboard">
        {deleting ? (
          <FullLoadingIndicator />
        ) : (
          <Card.Body>
            <Details />
            <div className="Line--horizontal" />
            <div className="Buffer--5px" />
            <Toggles />
          </Card.Body>
        )}
      </Card>
      <ConfirmDeleteModal
        showModal={showConfirmDelete}
        setShowModal={setShowConfirmDelete}
        meeting={meeting}
        deleteMeeting={deleteMeeting}
      />
    </Col>
  );
}

UpcomingMeetingItem.propTypes = {
  meeting: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    type: PropTypes.number.isRequired,
    joinUrl: PropTypes.string.isRequired,
    startedAt: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
  }).isRequired,
  pullMeeting: PropTypes.func.isRequired,
};
