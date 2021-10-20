import { useState, useEffect, useContext } from 'react';
import { Button, Row, Col, Container, Nav, Spinner } from 'react-bootstrap';
import { getFormattedDateTime } from '../../common/CommonFunctions';
import AgendaItemList from './AgendaItemList';
import ParticipantItemList from './ParticipantItemList';
import { PersonPlusFill, CalendarPlusFill } from 'react-bootstrap-icons';
import {
  blankAgenda,
  blankMeeting,
  blankParticipant,
} from '../../common/ObjectTemplates';
import EditMeetingOverlay from './EditMeetingOverlay';
import { useHistory, Redirect, useParams } from 'react-router';
import server from '../../services/server';
import { defaultHeaders } from '../../utils/axiosConfig';
import ConfirmInviteModel from './ConfirmInviteModel';

import RedirectionScreen, {
  BAD_MEETING_PERMS_MSG,
  MEETING_NOT_FOUND_ERR,
} from '../../components/RedirectionScreen';
import { UserContext } from '../../context/UserContext';
import BackgroundPattern from '../../assets/background_pattern2.jpg';

export default function UpcomingMeetingScreen() {
  const [meeting, setMeeting] = useState(blankMeeting);
  const [restrictDescription, setRestrictDescription] = useState(true);
  const [currentTab, setCurrentTab] = useState('participants');
  const [showEditMeeting, setShowEditMeeting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [isReordering, setReordering] = useState(false);
  const [inviteList, setInviteList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [validId, setValidId] = useState(true);

  const history = useHistory();
  const user = useContext(UserContext);

  const { id } = useParams();

  useEffect(() => {
    return pullMeeting()
      .then(() => setValidId(true))
      .catch((_) => setValidId(false))
      .finally(() => setLoading(false));
  }, []);

  async function pullMeeting() {
    const response = await server.get(`/meeting/${id}`, defaultHeaders);
    if (response.status !== 200) return;
    const result = response.data;
    if (result.agendaItems && result.agendaItems.length > 1) {
      result.agendaItems.sort((p1, p2) => {
        return p1.position - p2.position;
      });
      result.agendaItems.forEach((item) => {
        item.prevPosition = item.position;
      });
    }
    if (result.participants && result.participants.length > 1) {
      result.participants = result.participants
        .filter((x) => !x.isDuplicate)
        .sort((p1, p2) => {
          return p1.userName.localeCompare(p2.userName);
        });
    }
    setMeeting(result);
  }

  function startZoom() {
    history.replace('/ongoing/' + id);
  }

  function Content() {
    if (currentTab === 'agenda') {
      return (
        <AgendaItemList
          meeting={meeting}
          setMeeting={setMeeting}
          isReordering={isReordering}
          setReordering={setReordering}
        />
      );
    } else {
      return <ParticipantItemList meeting={meeting} setMeeting={setMeeting} />;
    }
  }

  function AddToggle() {
    if (currentTab === 'participants') {
      return (
        <div
          className="Fab"
          onClick={() => addParticipant(meeting, setMeeting)}
        >
          <PersonPlusFill size={25} color="white" />
        </div>
      );
    }
    return (
      <div className="Fab" onClick={() => addAgenda(meeting, setMeeting)}>
        <CalendarPlusFill size={22} color="white" />
      </div>
    );
  }

  if (!loading && !validId)
    return <RedirectionScreen message={MEETING_NOT_FOUND_ERR} />;

  if (meeting.id !== '' && user?.uuid !== meeting.hostId)
    return <RedirectionScreen message={BAD_MEETING_PERMS_MSG} />;

  if (meeting.type !== undefined && meeting.type !== 1) {
    return <Redirect to={'/ongoing/' + id} />;
  }

  return (
    <div
      className="Container__background-image"
      style={{
        backgroundImage: `url(${BackgroundPattern})`,
      }}
    >
      <div className="Buffer--50px" />
      <Container className="Container__padding--vertical Container__foreground">
        <div className="Buffer--50px" />

        <Row>
          <Col lg={1} md={12} sm={12} />
          <Col
            lg={4}
            md={12}
            sm={12}
            style={{ paddingLeft: 30, paddingRight: 30 }}
          >
            <p className="Text__header">{meeting.name}</p>
            <p className="Text__subheader">
              {getFormattedDateTime(meeting.startedAt)}
            </p>
            <div className="d-grid gap-2">
              <Button onClick={startZoom}>Start Zoom Meeting</Button>
              <Button
                variant="outline-primary"
                onClick={() => {
                  setInviteList(
                    meeting?.participants?.filter((x) => !x.invited),
                  );
                  setShowInviteModal(true);
                }}
                disabled={inviteLoading}
              >
                Email participants{' '}
                {inviteLoading && (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                )}
              </Button>
              <Button
                variant="outline-primary"
                onClick={() => setShowEditMeeting(true)}
              >
                Edit / Delete Meeting
              </Button>
            </div>
            <div className="Buffer--20px" />
            <div className="Container__row--space-between">
              <p className="Text__subsubheader">Description</p>
              <div
                className="Text__hint Clickable"
                onClick={() => setRestrictDescription(!restrictDescription)}
              >
                {restrictDescription ? 'Show More' : 'Show Less'}
              </div>
            </div>
            <div className="Buffer--10px" />
            <p
              className={
                'Text__paragraph' +
                (restrictDescription ? ' Text__elipsized--5-lines' : '')
              }
            >
              {meeting.description}
            </p>
            <div className="Buffer--20px" />
          </Col>
          <Col lg={6} md={12} sm={12}>
            <Nav
              variant="tabs"
              defaultActiveKey="participants"
              onSelect={(selectedKey) => setCurrentTab(selectedKey)}
              style={{ marginLeft: 20, marginRight: 20 }}
            >
              <Nav.Item>
                <Nav.Link eventKey="participants">Participants</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="agenda">Agenda</Nav.Link>
              </Nav.Item>
            </Nav>
            <div className="Buffer--20px" />
            <div className="Container__padding--horizontal">
              <Content />
            </div>
            <div className="Buffer--50px" />
          </Col>
        </Row>
      </Container>
      <div className="Buffer--50px" />
      <EditMeetingOverlay
        show={showEditMeeting}
        setShow={setShowEditMeeting}
        meeting={meeting}
        setMeeting={setMeeting}
      />
      <ConfirmInviteModel
        showModal={showInviteModal}
        setShowModal={setShowInviteModal}
        meeting={meeting}
        setMeeting={setMeeting}
        setInviteLoading={setInviteLoading}
        inviteList={inviteList}
        setInviteList={setInviteList}
      />
      <AddToggle />
    </div>
  );
}

function addParticipant(meeting, setMeeting) {
  if (meeting.participants.findIndex((item) => item.userEmail === '') >= 0)
    return;
  const newMeeting = Object.assign({}, meeting);
  const newParticipant = Object.assign({}, blankParticipant);
  newParticipant.meetingId = newMeeting.id;
  newMeeting.participants = [...newMeeting.participants, newParticipant];
  setMeeting(newMeeting);
}

async function addAgenda(meeting, setMeeting) {
  if (meeting.agendaItems.findIndex((item) => item.name === '') >= 0) return;
  const newMeeting = Object.assign({}, meeting);
  const newAgenda = Object.assign({}, blankAgenda);
  newAgenda.meetingId = newMeeting.id;
  const size = newMeeting.agendaItems.length;
  if (size > 0) {
    const lastItem = newMeeting.agendaItems[size - 1];
    newAgenda.position = lastItem.position + 1;
  } else {
    newAgenda.position = 0;
  }
  newAgenda.prevPosition = newAgenda.position;
  newMeeting.agendaItems = [...newMeeting.agendaItems, newAgenda];
  setMeeting(newMeeting);
}
