import { useEffect, useState } from 'react';
import { Container, Row, Image } from 'react-bootstrap';
import { CalendarPlusFill } from 'react-bootstrap-icons';
import UpcomingMeetingItem from './UpcomingMeetingItem';
import OngoingMeetingItem from './OngoingMeetingItem';
import { defaultHeaders } from '../../utils/axiosConfig';
import AddMeetingOverlay from './AddMeetingOverlay';
import server from '../../services/server';
import { FullLoadingIndicator } from '../../components/FullLoadingIndicator';
import CompletedMeetingItem from './CompletedMeetingItem';
import { toast } from 'react-toastify';
import { extractError } from '../../utils/extractError';
import { logEvent } from '@firebase/analytics';
import { googleAnalytics } from '../../services/firebase';

export default function DashboardScreen() {
  const [upcoming, setUpcoming] = useState([]);
  const [meetingHistory, setHistory] = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [loadingPast, setLoadingPast] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const [cloneMeeting, setCloneMeeting] = useState(null);

  useEffect(() => {
    logEvent(googleAnalytics, 'visit_dashboard');
    getBanner();
    return pullMeetings();
  }, []);

  async function pullMeetings() {
    try {
      await pullPastMeetings();
      await pullUpcomingMeetings();
    } catch (err) {
      toast.error(extractError(err));
    }
  }

  async function pullUpcomingMeetings() {
    function sortMeetings(meetingA, meetingB) {
      const startA = meetingA.startedAt;
      const startB = meetingB.startedAt;
      if (startA > startB) return 1;
      else if (startA < startB) return -1;
      else return 0;
    }

    return server
      .get('/meeting', {
        params: { type: 'upcoming' },
        ...defaultHeaders,
      })
      .then((res) => {
        const meetings = res.data;
        const upcoming = meetings.sort(sortMeetings);
        setUpcoming(upcoming);
      })
      .catch(console.error)
      .finally(() => setLoadingUpcoming(false));
  }

  async function pullPastMeetings() {
    function sortMeetings(meetingA, meetingB) {
      const startA = meetingA.startedAt;
      const startB = meetingB.startedAt;
      if (startA < startB) return 1;
      else if (startA > startB) return -1;
      else return 0;
    }

    return server
      .get('/meeting', {
        params: { type: 'past' },
        ...defaultHeaders,
      })
      .then((res) => {
        const pastMeetings = res.data.sort(sortMeetings);
        setHistory(pastMeetings);
      })
      .catch((err) => {
        toast.error(extractError(err));
      })
      .finally(() => setLoadingPast(false));
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
        pullMeeting={pullMeetings}
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

  if (loadingUpcoming || loadingPast) {
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
        onUpdate={pullMeetings}
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
