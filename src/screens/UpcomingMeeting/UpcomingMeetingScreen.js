import { useState, useEffect, useContext } from 'react';
import { Button, Row, Col, Container, Nav, Spinner } from 'react-bootstrap';
import {
  agendaReviver,
  getFormattedDateTime,
} from '../../common/CommonFunctions';
import AgendaItemList from './Agenda/AgendaItemList';
import ParticipantItemList from './Participants/ParticipantItemList';
import SuggestionList from './Suggestions/SuggestionList';
import { blankMeeting } from '../../common/ObjectTemplates';
import EditMeetingOverlay from './EditMeetingOverlay';
import { useHistory, Redirect, useParams } from 'react-router';
import server from '../../services/server';
import { defaultHeaders } from '../../utils/axiosConfig';
import ConfirmInviteModel from './ConfirmInviteModel';
import { toast } from 'react-toastify';
import { extractError } from '../../utils/extractError';
import AddToggle from './AddToggle';

import RedirectionScreen, {
  BAD_MEETING_PERMS_MSG,
  MEETING_NOT_FOUND_ERR,
} from '../../components/RedirectionScreen';
import { UserContext } from '../../context/UserContext';
import BackgroundPattern from '../../assets/background_pattern2.jpg';
import { logEvent } from '@firebase/analytics';
import { googleAnalytics } from '../../services/firebase';
import { FullLoadingIndicator } from '../../components/FullLoadingIndicator';
import { useAddToCalendar } from '../../hooks/useAddToCalendar';
import { useRef } from 'react';
import CloneMeetingButton from '../../components/CloneMeetingButton';
import { useSocket } from '../../hooks/useSocket';

export default function UpcomingMeetingScreen() {
  const [meeting, setMeeting] = useState(blankMeeting);
  const [suggestions, setSuggestions] = useState([]);

  const [restrictDescription, setRestrictDescription] = useState(true);
  const [currentTab, setCurrentTab] = useState(Tabs.PARTICIPANTS);
  const [showEditMeeting, setShowEditMeeting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [isReordering, setReordering] = useState(false);
  const [inviteList, setInviteList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [validId, setValidId] = useState(true);
  const AddToCalendarComponent = useAddToCalendar(meeting);

  const history = useHistory();
  const user = useContext(UserContext);

  const { id } = useParams();
  const { socket, mergeSuggestions, mergeParticipants } = useSocket(id);
  const lock = useRef(false);

  const mounted = useRef(true);

  // lock the setmeeting
  useEffect(() => {
    lock.current = false;
    return () => (lock.current = true);
  }, [meeting]);

  useEffect(() => {
    mounted.current = true;
    populateMeetingInformation();

    return () => {
      mounted.current = false;
    };
  }, []);

  async function populateMeetingInformation() {
    try {
      await pullMeeting();
      logEvent(googleAnalytics, 'visit_upcoming_screen', { meeting: id });
      setValidId(true);
    } catch {
      setValidId(false);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  async function getSuggestions(meetingId) {
    try {
      const response = await server.get(`/suggestion/${meetingId}`, {
        ...defaultHeaders.headers,
        'X-Participant': sessionStorage.getItem(meetingId) || '',
      });
      if (response.status !== 200) return;
      const result = response.data;
      setSuggestions(result.filter((item) => !item?.accepted));
    } catch (err) {
      toast.error(extractError(err));
    }
  }

  useEffect(() => {
    if (!socket) return;

    socket.on('meetingUpdated', function (data) {
      const newMeeting = JSON.parse(data, agendaReviver);
      if (newMeeting.type !== 1) {
        history.replace('/ongoing/' + id);
      } else {
        setMeeting((meeting) => ({ ...meeting, ...newMeeting }));
      }
    });

    socket.on('agendaUpdated', function (_) {
      pullMeeting();
    });

    socket.on('suggestionUpdated', function (item) {
      const update = JSON.parse(item);
      setSuggestions((s) => mergeSuggestions(s, update));
    });

    socket.on('suggestionDeleted', function (suggestionId) {
      setSuggestions((s) => s.filter((x) => x.id !== suggestionId));
    });

    socket.on('participantDeleted', function (participantId) {
      setMeeting((meeting) => ({
        ...meeting,
        participants: meeting.participants.filter(
          (x) => x.id !== participantId,
        ),
      }));
    });

    socket.on('participantUpdated', (data) => {
      const update = JSON.parse(data);
      setMeeting((meeting) => ({
        ...meeting,
        participants: mergeParticipants(meeting.participants, update),
      }));
    });
  }, [socket]);

  async function pullMeeting() {
    const response = await server.get(`/meeting/${id}`, {
      headers: {
        ...defaultHeaders.headers,
        'X-Participant': sessionStorage.getItem(id) || '',
      },
    });
    if (response.status !== 200) return;
    const result = response.data;
    if (result?.agendaItems && result?.agendaItems.length > 1) {
      result?.agendaItems.sort((p1, p2) => {
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
    getSuggestions(result?.id);
    setMeeting(result);
  }

  function startZoom() {
    history.replace('/ongoing/' + id);
  }

  function Content() {
    switch (currentTab) {
      case Tabs.AGENDA:
        return (
          <>
            <AgendaItemList
              meeting={meeting}
              setMeeting={setMeeting}
              isReordering={isReordering}
              setReordering={setReordering}
              lock={lock}
            />
            <AddToggle
              currentTab={currentTab}
              meeting={meeting}
              setMeeting={setMeeting}
              isReordering={isReordering}
            />
          </>
        );
      case Tabs.SUGGESTIONS:
        return (
          <SuggestionList
            suggestions={suggestions}
            setSuggestions={setSuggestions}
            meeting={meeting}
            setMeeting={setMeeting}
            isReordering={isReordering}
          />
        );
      default:
        return (
          <>
            <ParticipantItemList meeting={meeting} setMeeting={setMeeting} />
            <AddToggle
              currentTab={currentTab}
              meeting={meeting}
              setMeeting={setMeeting}
              isReordering={isReordering}
            />
          </>
        );
    }
  }

  if (!loading && !validId)
    return <RedirectionScreen message={MEETING_NOT_FOUND_ERR} />;

  if (meeting.id !== '' && user?.uuid !== meeting.hostId)
    return <RedirectionScreen message={BAD_MEETING_PERMS_MSG} />;

  if (meeting.type !== undefined && meeting.type !== 1) {
    return <Redirect to={'/ongoing/' + id} />;
  }

  if (loading) return <FullLoadingIndicator />;

  return (
    <div
      className="Container__background-image"
      style={{
        backgroundImage: `url(${BackgroundPattern})`,
      }}
    >
      <div className="Buffer--50px" />
      <Container className="Container__foreground">
        <Row style={{ minHeight: 'calc(100vh - 56px - 100px)' }}>
          <Col
            lg={4}
            md={12}
            sm={12}
            className="Container__side"
            style={{
              paddingLeft: 30,
              paddingRight: 30,
            }}
          >
            <div className="Buffer--50px" />
            <p className="Text__header">{meeting.name}</p>
            <p className="Text__subheader">
              {getFormattedDateTime(meeting.startedAt)}
            </p>
            <div className="d-grid gap-2">
              <Button onClick={startZoom}>Start Zoom Meeting</Button>
              <AddToCalendarComponent />
              <Button
                variant="outline-primary"
                onClick={() => {
                  setInviteList(
                    meeting?.participants?.filter(
                      (x) => !x.invited && x.userEmail && x.role !== 2,
                    ),
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
              <Row>
                <Col className="d-grid gap-2" style={{ paddingRight: 5 }}>
                  <CloneMeetingButton id={meeting.id} name={meeting.name} />
                </Col>
                <Col className="d-grid gap-2" style={{ paddingLeft: 5 }}>
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowEditMeeting(true)}
                  >
                    Edit / Delete
                  </Button>
                </Col>
              </Row>
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
            <div className="Buffer--50px" />
          </Col>
          <Col lg={1} md={12} sm={12} />
          <Col lg={6} md={12} sm={12}>
            <div className="Buffer--50px" />
            <Nav
              variant="tabs"
              defaultActiveKey={Tabs.PARTICIPANTS}
              onSelect={(selectedKey) => setCurrentTab(selectedKey)}
              style={{ marginLeft: 20, marginRight: 20 }}
            >
              <Nav.Item>
                <Nav.Link eventKey={Tabs.PARTICIPANTS}>Participants</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey={Tabs.AGENDA}>Agenda</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey={Tabs.SUGGESTIONS}>
                  Suggestions ({suggestions?.length})
                </Nav.Link>
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
    </div>
  );
}

const Tabs = {
  AGENDA: 'agenda',
  PARTICIPANTS: 'participants',
  SUGGESTIONS: 'suggestions',
};
