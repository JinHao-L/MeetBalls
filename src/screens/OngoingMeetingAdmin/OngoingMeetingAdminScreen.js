import { Container, Row, Col, Button, Nav, Card } from 'react-bootstrap';
import { useParams } from 'react-router';
import { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import {
  getFormattedDateTime,
  getFormattedTime,
  agendaReviver,
  openLinkInNewTab,
} from '../../common/CommonFunctions';
import AgendaList from './AgendaList';
import { blankMeeting } from '../../common/ObjectTemplates';
import ParticipantList from './ParticipantList';
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
import useSound from 'use-sound';
import Bell from '../../assets/Bell.mp3';
import BackgroundPattern from '../../assets/background_pattern2.jpg';
import FeedbackOverlay from './FeedbackOverlay';
import { logEvent } from '@firebase/analytics';
import { googleAnalytics } from '../../services/firebase';
import { clearMeetingsCache } from '../../utils/dashboardCache';
import { FullLoadingIndicator } from '../../components/FullLoadingIndicator';

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

  const { id } = useParams();
  const { socket } = useSocket(id);
  const user = useContext(UserContext);
  const isHost = useMemo(() => {
    return meeting?.hostId === user?.uuid;
  }, [meeting.hostId, user]);
  const [play] = useSound(Bell, { volume: 0.1 });

  useEffect(() => {
    pullMeeting();
    logEvent(googleAnalytics, 'visit_ongoing_screen', { meeting: id });
    setInterval(() => {
      setTime(new Date().getTime());
    }, 1000);
  }, []);

  useEffect(() => {
    if (validId && isHost && !once) {
      syncMeetingWithZoom(meeting)
        .then((newZoomUuid) => {
          if (newZoomUuid) {
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
    });
    socket.on('participantUpdated', function (data) {
      const update = JSON.parse(data);
      setMeeting((meeting) => ({
        ...meeting,
        participants: updateParticipants(meeting.participants, update),
      }));
    });
    socket.on('agendaUpdated', function (_) {
      pullMeeting();
    });
    socket.on('userConnected', function (_) {});
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
    const isLastItem = position + 1 >= agenda.length;
    const apiCall = isLastItem ? callEndMeeting : callNextMeeting;
    try {
      await apiCall(id);
      agenda[position].actualDuration = time - agenda[position].startTime;
      if (isLastItem) {
        clearMeetingsCache();
        setMeetingStatus(3);
        setShowFeedback(true);
        logEvent(googleAnalytics, 'end_meeting', { meetingId: id });
      }
      const newPosition = position + 1;
      setPosition(newPosition);
      if (newPosition < agenda.length) {
        agenda[newPosition].startTime = time;
      }
    } catch (err) {}
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
        variant="outline-primary"
        onClick={startZoom}
        disabled={meetingStatus === 3}
      >
        {hasLaunched ? 'Relaunch' : 'Launch'} Zoom
      </Button>
    );
  }, [meetingStatus, hasLaunched, meeting]);

  const ReturnToEditPageButton = useCallback(() => {
    if (user?.uuid !== meeting.hostId) return null;

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
            <div className="d-grid gap-2">
              <LaunchZoomButton />
              {meetingStatus === 1 ? <ReturnToEditPageButton /> : null}
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
              {isHost && !showError ? (
                <AgendaToggle
                  position={position}
                  agenda={meeting.agendaItems}
                  time={time}
                  id={meeting.id}
                  isHost={isHost}
                  startMeeting={startMeeting}
                  nextItem={nextItem}
                />
              ) : (
                <MeetingStatus
                  position={position}
                  agenda={meeting.agendaItems}
                />
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
            <div className="Container__padding--horizontal">
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
                  shouldShowButton={isHost}
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

function AgendaToggle({ position, time, agenda, id, startMeeting, nextItem }) {
  if (position < 0) {
    return (
      <Button onClick={() => startMeeting(time, agenda, id)}>
        Start Meeting
      </Button>
    );
  } else if (position < agenda.length) {
    const isLastItem = position === agenda.length - 1;
    const message = isLastItem ? 'Finish Meeting' : 'Next Item';
    return (
      <Button onClick={() => nextItem(time, agenda, id)}>{message}</Button>
    );
  } else {
    return (
      <Button href={`/completed/${id}`}>Meeting Ended - View Report</Button>
    );
  }
}

function MeetingStatus({ position, agenda }) {
  if (position < 0) {
    return <p className="Text__subheader">Meeting Not Started</p>;
  } else if (position < agenda.length) {
    return <p className="Text__subheader">Meeting Ongoing</p>;
  } else {
    return <p className="Text__subheader">Meeting Ended</p>;
  }
}

function initializeAgenda(time, agenda) {
  var lastTiming = time;
  for (let i = 0; i < agenda.length; i++) {
    agenda[i].actualDuration = agenda[i].expectedDuration;
    agenda[i].startTime = lastTiming;
    lastTiming += agenda[i].actualDuration;
  }
}

function updateDelay(agenda, time, position, play) {
  if (position < 0 || position >= agenda.length) return;
  const delay = Math.max(
    0,
    time - agenda[position].startTime - agenda[position].actualDuration,
  );
  if (
    agenda[position].actualDuration === agenda[position].expectedDuration &&
    delay > 0 &&
    delay < 1000
  ) {
    play();
  }
  agenda[position].actualDuration += delay;
  updateAgenda(agenda, position);
}

function updateAgenda(agenda, position) {
  for (let i = 0; i < agenda.length; i++) {
    agenda[i].isCurrent = i === position;
  }
  if (position >= agenda.length) return;
  var lastTiming = agenda[position].startTime;
  for (let i = position; i < agenda.length; i++) {
    agenda[i].startTime = lastTiming;
    lastTiming += agenda[i].actualDuration;
  }
}

function getCurrentPosition(meeting) {
  const agenda = meeting.agendaItems;
  for (let i = 0; i < agenda.length; i++) {
    if (agenda[i].isCurrent) {
      return i;
    }
  }
}

function getEndTime(time, agenda, position, meeting) {
  if (position < 0) {
    var duration = 0;
    agenda.forEach((item) => {
      duration += item.expectedDuration;
    });
    const supposedStartTime = new Date(meeting.startedAt).getTime();
    if (time > supposedStartTime) {
      return getFormattedTime(new Date(time + duration));
    } else {
      return getFormattedTime(new Date(supposedStartTime + duration));
    }
  } else {
    if (agenda.length === 0) return '';
    var lastAgendaItem = agenda[agenda.length - 1];
    return getFormattedTime(
      new Date(lastAgendaItem.startTime + lastAgendaItem.actualDuration),
    );
  }
}

function updateParticipants(participants, update) {
  let hasUpdate = false;
  participants = participants.map((ppl) => {
    if (ppl.userEmail === update.userEmail) {
      hasUpdate = true;
      return update;
    } else {
      return ppl;
    }
  });
  if (!hasUpdate) {
    const newList = [update, ...participants]
    return sortAndRemoveDupes(newList);
  } else {
    return participants.filter((x) => !x.isDuplicate);
  }
}

function sortAndRemoveDupes(participants) {
  function byArrivalThenName(p1, p2) {
    const p1Join = p1.timeJoined;
    const p2Join = p2.timeJoined;
    if (p1Join && !p2Join) return -1;
    else if (!p1Join && p2Join) return 1;
    else return (p1.userName).localeCompare(p2.userName);
  }

  return participants
      .filter((x) => !x.isDuplicate)
      .sort(byArrivalThenName);
}
