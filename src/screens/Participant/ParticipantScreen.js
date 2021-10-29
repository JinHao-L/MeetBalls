import { useState, useEffect } from 'react';
import {
  agendaReviver,
  getFormattedDateTime,
} from '../../common/CommonFunctions';
import { blankMeeting, blankSuggestion } from '../../common/ObjectTemplates';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Redirect, useLocation, useParams, useHistory } from 'react-router';
import { useSocket } from '../../hooks/useSocket';
import BackgroundPattern from '../../assets/background_pattern2.jpg';
import server from '../../services/server';
import { defaultHeaders } from '../../utils/axiosConfig';
import UploadItem from './UploadItem';
import RedirectionScreen, {
  MEETING_NOT_FOUND_ERR,
} from '../../components/RedirectionScreen';
import { logEvent } from '@firebase/analytics';
import { googleAnalytics } from '../../services/firebase';
import SuggestionItem from './SuggestionItem';
import { FullLoadingIndicator } from '../../components/FullLoadingIndicator';
import { AddToCalendar } from '../../components/AddToCalendar';

const JOINER_KEY = 'joiner';
const NAME_KEY = 'name';

export default function ParticipantScreen() {
  const { id } = useParams();
  const { socket, mergeSuggestions, mergeParticipants } = useSocket(id);
  const [meeting, setMeeting] = useState(blankMeeting);
  const [validId, setValidId] = useState(true);
  const [loading, setLoading] = useState(true);
  const [restrictDescription, setRestrictDescription] = useState(true);
  const [agendaItems, setAgendaItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const joinerId = params.get(JOINER_KEY);
  const name = params.get(NAME_KEY);
  const history = useHistory();

  useEffect(() => {
    if (!joinerId) {
      setValidId(false);
      setLoading(false);
      return;
    }
    pullSuggestions();
    return pullMeeting()
      .then(() => {
        setValidId(true);
        logEvent(googleAnalytics, 'visit_participant_screen', {
          meetingId: id,
          participant: joinerId,
        });
      })
      .catch((_) => setValidId(false))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('meetingUpdated', function (data) {
      const newMeeting = JSON.parse(data, agendaReviver);
      if (newMeeting.status !== 1) {
        history.replace('/ongoing/' + id);
      } else {
        setMeeting((meeting) => ({ ...meeting, ...newMeeting }));
      }
    });

    socket.on('agendaUpdated', function (_) {
      pullAgenda();
    });

    socket.on('suggestionUpdated', function (item) {
      const update = JSON.parse(item);
      if (update.participantId === joinerId) {
        setSuggestions((s) => mergeSuggestions(s, update));
      }
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

    socket.on('participantUpdated', function (data) {
      const update = JSON.parse(data);
      setMeeting((meeting) => ({
        ...meeting,
        participants: mergeParticipants(meeting.participants, update),
      }));
    });
  }, [socket]);

  async function pullSuggestions() {
    const response = await server.get(`/suggestion/participant/${id}`, {
      headers: {
        ...defaultHeaders.headers,
        'X-Participant': sessionStorage.getItem(id) || '',
      },
    });
    if (response.status !== 200) return;
    const result = response.data;
    setSuggestions(result);
  }

  async function pullMeeting() {
    const response = await server.get(`/meeting/${id}`, {
      headers: {
        ...defaultHeaders.headers,
        'X-Participant': sessionStorage.getItem(id) || '',
      },
    });
    if (response.status !== 200) return;
    const result = response.data;
    setMeeting(result);
    obtainRelevantAgendaItems(result);
  }

  async function pullAgenda() {
    const response = await server.get(`/agenda-item/${id}`, {
      headers: {
        ...defaultHeaders.headers,
        'X-Participant': sessionStorage.getItem(id) || '',
      },
    });
    if (response.status !== 200) return;
    const result = response.data;
    obtainRelevantAgendaItems({ agendaItems: result });
  }

  async function obtainRelevantAgendaItems(loadedMeeting) {
    const items = [];
    loadedMeeting?.agendaItems?.forEach((item) => {
      if (item.speaker !== null && item.speaker?.id === joinerId) {
        items.push(item);
      }
    });
    setAgendaItems(items);
  }

  function UploadItems() {
    const items = [];
    agendaItems.forEach((item) => {
      items.push(
        <UploadItem
          agendaItem={item}
          speakerId={joinerId}
          key={item?.position}
        />,
      );
    });
    return items;
  }

  function SuggestionItems() {
    const items = [];
    for (let i = 0; i < suggestions.length; i++) {
      items.push(
        <SuggestionItem
          item={suggestions[i]}
          key={i}
          suggestions={suggestions}
          setSuggestions={setSuggestions}
        />,
      );
    }
    return items;
  }

  if (!loading && !validId)
    return <RedirectionScreen message={MEETING_NOT_FOUND_ERR} />;
  if (joinerId === meeting?.hostId) {
    return <Redirect to={'/meeting/' + id} />;
  }
  if (meeting.type !== undefined && meeting.type !== 1) {
    return <Redirect to={'/ongoing/' + id} />;
  }
  if (loading) {
    return <FullLoadingIndicator />;
  }

  function addSuggestion() {
    if (suggestions.findIndex((item) => item.name === '') >= 0) return;
    const newSuggestion = Object.assign({}, blankSuggestion);
    newSuggestion.meetingId = id;
    const newSuggestions = [newSuggestion, ...suggestions];
    setSuggestions(newSuggestions);
  }

  return (
    <div
      className="Container__background-image"
      style={{
        backgroundImage: `url(${BackgroundPattern})`,
      }}
    >
      <div className="Buffer--50px" />
      <Container className="Container__foreground">
        <Row>
          <Col
            lg={12}
            md={12}
            sm={12}
            className="Container__side"
            style={{ paddingLeft: 30, paddingRight: 30 }}
          >
            <Row>
              <Col lg={1} md={12} sm={12} />
              <Col lg={4} md={12} sm={12}>
                <div className="Buffer--50px" />
                <p className="Text__header">Hi {name}!</p>
                <p className="Text__subheader">
                  You have a meeting <b>{meeting?.name}</b> scheduled on{' '}
                  {getFormattedDateTime(meeting?.startedAt)}.
                </p>
                <div className="d-grid gap-2">
                  <Button onClick={() => history.push('/ongoing/' + id)}>
                    Go to Meeting
                  </Button>
                  <AddToCalendar meeting={meeting} />
                </div>
                <div className="Buffer--50px" />
              </Col>
              <Col lg={1} md={12} sm={12} />
              <Col lg={5} md={12} sm={12}>
                <div className="Buffer--50px" />
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
                  {meeting?.description}
                </p>
                <div className="Buffer--50px" />
              </Col>
            </Row>
          </Col>
        </Row>
        <div className="Buffer--50px" />
        <Row>
          <Col lg={1} md={12} sm={12} />
          <Col
            lg={5}
            md={12}
            sm={12}
            style={{ paddingLeft: 30, paddingRight: 30 }}
          >
            <p className="Text__subheader">
              Here are the items you will be presenting:
            </p>
            <Row>{UploadItems()}</Row>
            <div className="Buffer--50px" />
          </Col>
          <Col
            lg={5}
            md={12}
            sm={12}
            style={{ paddingLeft: 30, paddingRight: 30 }}
          >
            <p className="Text__subheader">Got a suggestion?</p>
            <div className="d-grid gap-2">
              <Button onClick={addSuggestion}>Add a Suggestion</Button>
            </div>
            <div className="Buffer--10px" />
            <SuggestionItems />
            <div className="Buffer--50px" />
          </Col>
        </Row>
      </Container>
      <div className="Buffer--50px" />
    </div>
  );
}
