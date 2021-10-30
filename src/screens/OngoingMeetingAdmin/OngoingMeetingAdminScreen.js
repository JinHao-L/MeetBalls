import { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useParams } from 'react-router';
import {
  getFormattedDateTime,
  agendaReviver,
  openLinkInNewTab,
} from '../../common/CommonFunctions';
import { blankMeeting } from '../../common/ObjectTemplates';
import {
  getMeeting,
  callStartMeeting,
  callEndMeeting,
  callNextMeeting,
  syncMeetingWithZoom,
} from '../../services/meeting';
import { useSocket } from '../../hooks/useSocket';
import { UserContext } from '../../context/UserContext';
import RedirectionScreen, {
  MEETING_NOT_FOUND_ERR,
} from '../../components/RedirectionScreen';

import { logEvent } from '@firebase/analytics';
import { googleAnalytics } from '../../services/firebase';
import { clearMeetingsCache } from '../../utils/dashboardCache';
import { AddToCalendar } from '../../components/AddToCalendar';

import {
  initializeAgenda,
  updateDelay,
  getCurrentPosition,
  getEndTime,
  sortAndRemoveDupes,
} from './Agenda/AgendaLogic';
import AgendaList from './Agenda/AgendaList';
import ParticipantList from './Participants/ParticipantList';
import ControlToggle from './ControlToggle';
import { Container, Row, Col, Button, Nav, Card } from 'react-bootstrap';
import { FullLoadingIndicator } from '../../components/FullLoadingIndicator';
import FeedbackOverlay from './FeedbackOverlay';

import useSound from 'use-sound';
import Bell from '../../assets/Bell.mp3';
import BackgroundPattern from '../../assets/background_pattern2.jpg';
import server from '../../services/server';
import { defaultHeaders } from '../../utils/axiosConfig';

export default function OngoingMeetingAdminScreen() {
  const [position, setPosition] = useState(-1);
  const [meeting, setMeeting] = useState(blankMeeting);
  const [currentTab, setCurrentTab] = useState('agenda');
  const [time, setTime] = useState(new Date().getTime());
  const [showError, setShowError] = useState(false);
  const [hasLaunched, setHasLaunched] = useState(false);
  const [meetingStatus, setMeetingStatus] = useState(1);
  const [showFeedback, setShowFeedback] = useState(false);

  const [loading, setLoading] = useState(true);
  const [validId, setIsValidId] = useState(false);
  const [once, setOnce] = useState(false);
  const [loadingNextItem, setLoadingNextItem] = useState(false);

  const { id } = useParams();
  const { socket, mergeParticipants } = useSocket(id);
  const user = useContext(UserContext);
  const [joiner, setJoiner] = useState(null);
  const [loadingJoiner, setLoadingJoiner] = useState(true);
  const [play] = useSound(Bell, { volume: 0.1 });

  const isHost = useMemo(() => {
    if (loadingJoiner || joiner) return false;
    return meeting?.hostId === user?.uuid;
  }, [meeting.hostId, user, joiner]);
  const privileged = useMemo(() => {
    const isCohost = joiner && joiner?.role === 3;
    return isCohost || isHost; 
  }, [joiner, isHost]);

  // Populate meeting info
  useEffect(() => {
    pullMeeting();
    logEvent(googleAnalytics, 'visit_ongoing_screen', { meeting: id });
    setInterval(() => {
      setTime(new Date().getTime());
    }, 1000);
  }, []);

  // Retrieve joiner info
  useEffect(() => {
    const token = sessionStorage.getItem(id);
    if (!token) {
      setLoadingJoiner(false);
      return;
    }

    server
      .get(`/meeting/magic-link`, {
        headers: { ...defaultHeaders.headers, 'X-Participant': token },
      })
      .then((response) => {
        setJoiner(response.data.joiner);
      })
      .catch((_err) => console.log(_err))
      .finally(() => setLoadingJoiner(false));
  }, []);

  useEffect(() => {
    if (meeting?.hostId === user?.uuid) {
      const participantToken = sessionStorage.getItem(meeting.id);
      if (participantToken) {
        sessionStorage.removeItem(meeting.id);
        pullMeeting();
        setJoiner(null);
      }
    }
  }, [privileged]);

  useEffect(() => {
    if (validId && meeting?.hostId === user?.uuid && !once) {
      syncMeetingWithZoom(meeting)
        .then((newZoomUuid) => {
          if (newZoomUuid) {
            clearMeetingsCache();
            setMeeting((meeting) => ({ ...meeting, zoomUuid: newZoomUuid }));
          }
        })
        .catch((err) => {
          console.log('Failed to sync with zoom', err);
        });
      setOnce(true);
    }
  }, [validId]);

  useEffect(() => {
    if (!socket) return;

    socket.on('meetingUpdated', function (data) {
      const newMeeting = JSON.parse(data, agendaReviver);
      setMeeting((meeting) => updateMeeting({ ...meeting, ...newMeeting }));
      setMeetingStatus(newMeeting.type);
    });
    socket.on('agendaUpdated', function (_) {
      pullMeeting();
    });
    socket.on('participantUpdated', function (data) {
      const update = JSON.parse(data);
      setMeeting((meeting) => ({
        ...meeting,
        participants: sortAndRemoveDupes(
          mergeParticipants(meeting.participants, update),
        ),
      }));
    });
  }, [socket]);

  function startZoom() {
    if (!hasLaunched) setHasLaunched(true);
    openLinkInNewTab(meeting.joinUrl);
  }

  const updateMeeting = (meetingObj) => {
    const participants = meetingObj.participants;
    meetingObj.participants = sortAndRemoveDupes(participants);

    meetingObj.agendaItems = meetingObj.agendaItems.sort((p1, p2) => {
      return p1.position - p2.position;
    });
    setShowError(meetingObj.agendaItems.length === 0);
    syncMeeting(meetingObj);
    return meetingObj;
  };

  async function pullMeeting() {
    try {
      const res = await getMeeting(id);
      setMeeting(() => updateMeeting(res.data));
      setMeetingStatus(res.data.type);
      setIsValidId(true);
    } catch (err) {
      setIsValidId(false);
    } finally {
      setLoading(false);
    }
  }

  async function startMeeting(time, agenda, id) {
    if (agenda.length < 1) {
      return;
    }
    try {
      await callStartMeeting(id);
      clearMeetingsCache();
      logEvent(googleAnalytics, 'start_meeting', { meetingId: id });
      setMeetingStatus(2);
      setPosition(position + 1);
      initializeAgenda(time, agenda);
    } catch (err) {}
  }

  async function nextItem(time, agenda, id) {
    setLoadingNextItem(true);
    const isLastItem = position + 1 >= agenda.length;
    const apiCall = isLastItem ? callEndMeeting : callNextMeeting;
    try {
      await apiCall(id);
      agenda[position].actualDuration = time - agenda[position].startTime;
      if (isLastItem) {
        setMeetingStatus(3);
        setShowFeedback(true);
        logEvent(googleAnalytics, 'end_meeting', { meetingId: id });
      }
      clearMeetingsCache();
      const newPosition = position + 1;
      setPosition(newPosition);
      if (newPosition < agenda.length) {
        agenda[newPosition].startTime = time;
      }
    } catch (err) {
    } finally {
      setLoadingNextItem(false);
    }
  }

  function syncMeeting(meeting) {
    if (meeting.type === 1) {
      // waiting to start
      return;
    } else if (meeting.type === 2) {
      // started
      const pos = getCurrentPosition(meeting);
      setPosition(pos);
      const agenda = meeting.agendaItems;
      var lastTiming = agenda[pos].startTime;
      for (let i = pos; i < agenda.length; i++) {
        agenda[i].startTime = lastTiming;
        agenda[i].actualDuration = agenda[i].expectedDuration;
        lastTiming += agenda[i].actualDuration;
      }
      return;
    } else if (meeting.type === 3) {
      // meeting ended
      setPosition(meeting.agendaItems.length);
      return;
    }
  }

  const LaunchZoomButton = useCallback(() => {
    return (
      <Button
        variant="primary"
        onClick={startZoom}
        disabled={meetingStatus === 3}
      >
        {hasLaunched ? 'Relaunch' : 'Launch'} Zoom
      </Button>
    );
  }, [meetingStatus, hasLaunched, meeting]);

  const ReturnToEditPageButton = useCallback(() => {
    if (!isHost) return null;

    return (
      <Button variant="outline-primary" href={`/meeting/${id}`}>
        Back to Editing
      </Button>
    );
  }, [id, meeting]);

  if (!loading && !validId)
    return <RedirectionScreen message={MEETING_NOT_FOUND_ERR} />;

  if (loading) {
    return <FullLoadingIndicator />;
  }

  updateDelay(meeting.agendaItems, time, position, play);

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
            style={{ paddingLeft: 30, paddingRight: 30 }}
          >
            <div className="Buffer--50px" />
            <p className="Text__header">{meeting.name}</p>
            <p className="Text__subheader">
              {getFormattedDateTime(meeting.startedAt)}
            </p>
            <Card border="primary" bg="secondary">
              <Card.Body>
                <Card.Subtitle>Meeting ID</Card.Subtitle>
                <Card.Text>{meeting?.meetingId}</Card.Text>
                <Card.Subtitle>Password</Card.Subtitle>
                <Card.Text>{meeting?.meetingPassword}</Card.Text>
                <LaunchZoomButton />
              </Card.Body>
            </Card>
            <div className="Buffer--10px" />
            <div className="d-grid gap-2">
              {meetingStatus === 1 ? (
                <>
                  <AddToCalendar meeting={meeting} />
                  <ReturnToEditPageButton />
                </>
              ) : null}
            </div>
            <div className="Buffer--20px" />
            <div className="Line--horizontal" />
            <div className="Buffer--20px" />
            <p>
              {position < meeting.agendaItems.length
                ? 'Estimated End Time:'
                : 'Time Ended:'}
            </p>
            <p className="Text__header">
              {getEndTime(time, meeting.agendaItems, position, meeting)}
            </p>
            <div className="d-grid gap-2">
              {privileged &&
              (!joiner || position !== meeting?.agendaItems?.length) &&
              !showError ? (
                <ControlToggle
                  position={position}
                  agenda={meeting.agendaItems}
                  time={time}
                  id={meeting.id}
                  isHost={privileged}
                  startMeeting={startMeeting}
                  nextItem={nextItem}
                  loadingNextItem={loadingNextItem}
                />
              ) : (
                <p className="Text__subheader">
                  {meetingStatusText(position, meeting.agendaItems)}
                </p>
              )}
            </div>
            <div className="Buffer--20px" />
            <Card bg="primary" hidden={!showError || !user}>
              <Card.Header>No Agenda Found</Card.Header>
              <Card.Body>
                <Card.Text>
                  Please add an agenda item to the meeting first before
                  starting.
                </Card.Text>
              </Card.Body>
            </Card>
            <div className="Buffer--50px" />
          </Col>
          <Col lg={1} md={12} sm={12} />
          <Col lg={6} md={12} sm={12}>
            <div className="Buffer--50px" />
            <Nav
              variant="tabs"
              defaultActiveKey="agenda"
              onSelect={(selectedKey) => setCurrentTab(selectedKey)}
              style={{ marginLeft: 20, marginRight: 20 }}
            >
              <Nav.Item>
                <Nav.Link eventKey="agenda">Agenda</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="participants">Participants</Nav.Link>
              </Nav.Item>
            </Nav>
            <div className="Buffer--20px" />
            <div className="Container__padding--horizontal Container__scrollable-screen">
              {currentTab === 'agenda' ? (
                <AgendaList
                  time={time}
                  agenda={meeting.agendaItems}
                  position={position}
                />
              ) : (
                <ParticipantList
                  meeting={meeting}
                  setMeeting={setMeeting}
                  position={position}
                  shouldShowButton={privileged}
                />
              )}
            </div>
            <div className="Buffer--50px" />
          </Col>
        </Row>
      </Container>
      <div className="Buffer--50px" />
      <FeedbackOverlay
        setShowModal={setShowFeedback}
        showModal={showFeedback}
        meetingId={meeting.id}
      />
    </div>
  );
}

// Agenda

function meetingStatusText(position, agenda) {
  if (position < 0) {
    return 'Meeting Not Started';
  } else if (position < agenda.length) {
    return 'Meeting Ongoing';
  } else {
    return 'Meeting Ended';
  }
}
