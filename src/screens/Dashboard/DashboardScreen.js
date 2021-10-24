import {
  useEffect,
  useRef,
  useState,
  useContext,
} from 'react';
import { Container, Row, Image, Card, Col } from 'react-bootstrap';
import { CalendarPlusFill } from 'react-bootstrap-icons';
import UpcomingMeetingItem from './UpcomingMeetingItem';
import OngoingMeetingItem from './OngoingMeetingItem';
import AddMeetingOverlay from './AddMeetingOverlay';
import { FullLoadingIndicator } from '../../components/FullLoadingIndicator';
import CompletedMeetingItem from './CompletedMeetingItem';
import { toast } from 'react-toastify';
import { extractError } from '../../utils/extractError';
import { logEvent } from '@firebase/analytics';
import { googleAnalytics } from '../../services/firebase';
import { clearMeetingsCache, pullMeetings } from '../../utils/dashboardCache';
import { UserContext } from '../../context/UserContext';
import AppFooter from '../../components/AppFooter';

export default function DashboardScreen() {
  const [upcoming, setUpcoming] = useState([]);
  const [meetingHistory, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const [cloneMeeting, setCloneMeeting] = useState(null);
  const [banner, setBanner] = useState('');
  const user = useContext(UserContext);

  const mounted = useRef(true);

  useEffect(() => {
    logEvent(googleAnalytics, 'visit_dashboard');
    populateMeetings();

    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    setBanner(getBanner);
  }, []);

  function populateMeetings() {
    return pullMeetings()
      .then((meetings) => {
        if (!mounted.current) return;
        setUpcoming(meetings.upcoming);
        setHistory(meetings.completed);
      })
      .catch((e) => toast(extractError(e)))
      .finally(() => {
        if (!mounted.current) return;
        setLoading(false);
      });
  }

  function onUpdate() {
    clearMeetingsCache();
    return populateMeetings();
  }

  function checkIfExist(id) {
    for (let i = 0; i < upcoming.length; i++) {
      if (upcoming[i].zoomUuid === id) {
        return true;
      }
    }
    for (let i = 0; i < meetingHistory.length; i++) {
      if (meetingHistory[i].zoomUuid === id) {
        return true;
      }
    }
    return false;
  }

  const upcomingList = upcoming.map((meeting, idx) =>
    meeting.type === 1 ? (
      <UpcomingMeetingItem
        key={idx}
        meeting={meeting}
        onUpdate={onUpdate}
        setCloneMeeting={setCloneMeeting}
        setShowOverlay={setShowOverlay}
      />
    ) : (
      <OngoingMeetingItem key={idx} meeting={meeting} />
    ),
  );

  const historyList = meetingHistory.map((meeting, idx) => (
    <CompletedMeetingItem
      key={idx}
      meeting={meeting}
      setCloneMeeting={setCloneMeeting}
      setShowOverlay={setShowOverlay}
    />
  ));

  function CreateMeetingToggle() {
    return (
      <Col
        xl={4}
        lg={6}
        md={6}
        sm={12}
        className="Container__padding--vertical-medium"
      >
        <Card
          border="primary"
          className="Card__dashboard Container__center--vertical Clickable"
          onClick={() => {
            setCloneMeeting(null);
            setShowOverlay(true);
          }}
        >
          <CalendarPlusFill size={22} color="#8F6B58" />
          <div className="Buffer--10px" />
          <p className="Text__subsubheader" style={{ color: '#8F6B58' }}>
            Add Meeting
          </p>
        </Card>
      </Col>
    );
  }

  if (loading) {
    return <FullLoadingIndicator />;
  }

  return (
    <>
      <div className="Banner">
        <Image src={banner} fluid className="Image__banner" />
        <div className="Container__center--vertical Banner__content">
          <p
            className="Text__header Text__elipsized--2-lines"
            style={{ color: 'white' }}
          >
            Welcome back {user.firstName}!
          </p>
          <p className="Text__subsubheader" style={{ color: 'white' }}>
            You have {upcoming.length} upcoming meeting
            {upcoming.length > 1 ? 's' : null}.
          </p>
        </div>
      </div>

      <Container
        className="Container__padding--vertical"
        style={{ minHeight: 'calc(100vh - 56px - 121px - 300px)' }}
      >
        <Row>
          <CreateMeetingToggle />
          {upcomingList}
          {historyList}
        </Row>
        <div className="Buffer--50px" />
      </Container>
      <AddMeetingOverlay
        show={showOverlay}
        setShow={setShowOverlay}
        onUpdate={onUpdate}
        checkIfExist={checkIfExist}
        cloneMeeting={cloneMeeting}
      />
      <FeedbackToggle />
      <AppFooter />
    </>
  );
}

function getBanner() {
  const time = new Date().getHours();
  if (time < 6) {
    return '/assets/banner_night.jpg';
  } else if (time < 10) {
    return '/assets/banner_morning.jpg';
  } else if (time < 16) {
    return '/assets/banner_afternoon.jpg';
  } else if (time < 20) {
    return '/assets/banner_evening.jpg';
  } else {
    return '/assets/banner_night.jpg';
  }
}

function FeedbackToggle() {
  return (
    <a
      href="https://docs.google.com/forms/d/e/1FAIpQLSfN7K-1RdMzzlIf-9DtvKxhlqMpYkUGV_w3cYMofNsehDw_qA/viewform?usp=sf_link"
      target="_blank"
      rel="noreferrer"
    >
      <div className="Toggle__feedback">
        <p className="Text--rotated">Have Feedback?</p>
      </div>
    </a>
  );
}
