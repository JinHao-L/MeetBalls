import { useEffect, useRef, useState } from 'react';
import { Container, Row, Image } from 'react-bootstrap';
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

export default function DashboardScreen() {
  const [upcoming, setUpcoming] = useState([]);
  const [meetingHistory, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const [cloneMeeting, setCloneMeeting] = useState(null);

  const mounted = useRef(true);

  useEffect(() => {
    logEvent(googleAnalytics, 'visit_dashboard');
    getBanner();
    populateMeetings();

    return () => {
      mounted.current = false;
    };
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

  if (loading) {
    return <FullLoadingIndicator />;
  }

  return (
    <>
      <div className="Banner">
        <Image src={getBanner().default} fluid className="Image__banner" />
        <div className="Container__center--vertical Banner__content">
          <p className="Text__header" style={{ color: 'white' }}>
            Welcome Back!
          </p>
          <p className="Text__subsubheader" style={{ color: 'white' }}>
            You have {upcoming.length} upcoming meeting
            {upcoming.length > 1 ? 's' : null}.
          </p>
        </div>
      </div>

      <Container className="Container__padding--vertical">
        <Row>
          {upcomingList}
          {historyList}
        </Row>
        <div className="Buffer--100px" />
      </Container>
      <AddMeetingOverlay
        show={showOverlay}
        setShow={setShowOverlay}
        onUpdate={onUpdate}
        checkIfExist={checkIfExist}
        cloneMeeting={cloneMeeting}
      />
      <div
        className="Fab"
        onClick={() => {
          setCloneMeeting(null);
          setShowOverlay(true);
        }}
      >
        <CalendarPlusFill size={22} color="white" />
      </div>
    </>
  );
}

function getBanner() {
  const time = new Date().getHours();
  if (time < 6) {
    return require('../../assets/banner_night.jpg');
  } else if (time < 10) {
    return require('../../assets/banner_morning.jpg');
  } else if (time < 16) {
    return require('../../assets/banner_afternoon.jpg');
  } else if (time < 20) {
    return require('../../assets/banner_evening.jpg');
  } else {
    return require('../../assets/banner_night.jpg');
  }
}
