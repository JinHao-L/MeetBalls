import { useEffect, useState } from 'react';
import { Redirect, useParams } from 'react-router';
import { blankMeeting } from '../../common/ObjectTemplates';
import server from '../../services/server';
import AttendanceList from './AttendanceList';
import CompletedAgendaCard from './CompletedAgendaCard';
import { Col, Nav, Row, Button, Container } from 'react-bootstrap';
import { getDateInfo, getFormattedDate } from '../../common/CommonFunctions';
import Statistics from './Statistics';
import RedirectionScreen, {
  MEETING_NOT_FOUND_ERR,
} from '../../components/RedirectionScreen';
import BackgroundPattern from '../../assets/background_pattern2.jpg';
import { logEvent } from '@firebase/analytics';
import { googleAnalytics } from '../../services/firebase';
import { FullLoadingIndicator } from '../../components/FullLoadingIndicator';

export default function CompletedMeetingScreen() {
  const [meeting, setMeeting] = useState(blankMeeting);
  const [loading, setLoading] = useState(true);
  const [restrictDescription, setRestrictDescription] = useState(false);
  const [currentTab, setCurrentTab] = useState('statistics');
  const [validId, setValidId] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    return server
      .get(`/meeting/${id}`, {
        headers: {
          'X-Participant': sessionStorage.getItem(id) || '',
        },
      })
      .then((res) => {
        const participants = res.data?.participants
          ?.filter((x) => !x.isDuplicate)
          .sort((p1, p2) => {
            return p1.userName.localeCompare(p2.userName);
          });
        const agendaItems = res.data?.agendaItems?.sort((p1, p2) => {
          return p1.position - p2.position;
        });
        setMeeting({ ...res.data, participants, agendaItems });
        logEvent(googleAnalytics, 'visit_completed_screen', { meetingId: id });
        setValidId(true);
      })
      .catch((_) => setValidId(false))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && !validId)
    return <RedirectionScreen message={MEETING_NOT_FOUND_ERR} />;

  const type = meeting.type;
  if (!loading) {
    if (type === 0) {
      return <Redirect to={`/meeting/${id}`} />;
    } else if (type === 1 || type === 2) {
      return <Redirect to={`/ongoing/${id}`} />;
    }
  }

  function Content() {
    switch (currentTab) {
      case 'statistics': {
        return <Statistics meeting={meeting} />;
      }
      case 'agenda': {
        return meeting.agendaItems.map((item, idx) => (
          <CompletedAgendaCard agendaItem={item} key={idx} />
        ));
      }
      default: {
        return (
          <AttendanceList
            participants={meeting.participants}
            name={meeting.name}
          />
        );
      }
    }
  }

  function emailParticipants() {
    const participants = meeting.participants
      .filter((p) => p.role !== 2)
      .map((p) => p.userEmail)
      .join(',');
    const title = `Minutes to ${meeting.name}`;
    const body =
      'Dear all,\n\n' +
      'Please refer to the attachment for the minutes ' +
      `to our meeting on ${getFormattedDate(meeting.startedAt)}.\n\n` +
      'Thank you.';
    const encodedBody = encodeURI(body);
    const href = `mailto:${participants}?subject=${title}&body=${encodedBody}`;
    window.open(href);
  }

  const startTimeIso = meeting.startedAt;
  const { date, startTime, endTime } = getDateInfo(
    startTimeIso,
    meeting.agendaItems.reduce((prev, curr) => curr.actualDuration + prev, 0),
  );

  if (loading) {
    return <FullLoadingIndicator />;
  }

  return (
    <div
      style={{
        backgroundImage: `url(${BackgroundPattern})`,
      }}
      className="Container__background-image"
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
              {date}, {startTime} - {endTime}
            </p>
            <div className="d-grid gap-2">
              {/* <Button>Get Meeting Recording</Button> */}
              <Button variant="outline-primary" onClick={emailParticipants}>
                Email Participants
              </Button>
              <p className="Text__hint">
                Make sure you have enabled mail links in your browser
              </p>
            </div>
            <div className="Buffer--20px" />
            <div className="Container__row--space-between">
              <p className="Text__subsubheader">Description</p>
              <p
                className="Text__hint Clickable"
                onClick={() => setRestrictDescription(!restrictDescription)}
              >
                {restrictDescription ? 'Show More' : 'Show Less'}
              </p>
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
              defaultActiveKey="statistics"
              onSelect={(selectedKey) => setCurrentTab(selectedKey)}
              style={{ marginLeft: 20, marginRight: 20 }}
            >
              <Nav.Item>
                <Nav.Link eventKey="statistics">Statistics</Nav.Link>
              </Nav.Item>
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
    </div>
  );
}
