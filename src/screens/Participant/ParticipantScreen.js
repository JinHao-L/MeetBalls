import { useState, useEffect } from 'react';
import { getFormattedDateTime } from '../../common/CommonFunctions';
import { blankMeeting } from '../../common/ObjectTemplates';
import { Container, Row, Col } from 'react-bootstrap';
import { Redirect, useLocation, useParams } from 'react-router';
import BackgroundPattern from '../../assets/background_pattern2.jpg';
import server from '../../services/server';
import { defaultHeaders } from '../../utils/axiosConfig';
import UploadItem from './UploadItem';
import RedirectionScreen, {
  MEETING_NOT_FOUND_ERR,
} from '../../components/RedirectionScreen';

const JOINER_KEY = 'joiner';
const NAME_KEY = 'name';

export default function ParticipantScreen() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState(blankMeeting);
  const [validId, setValidId] = useState(true);
  const [loading, setLoading] = useState(false);
  const [restrictDescription, setRestrictDescription] = useState(true);
  const [agendaItems, setAgendaItems] = useState([]);

  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const joinerId = params.get(JOINER_KEY);
  const name = params.get(NAME_KEY);

  useEffect(() => {
    if (!joinerId) {
      setValidId(false);
      setLoading(false);
      return;
    }
    return pullMeeting()
      .then(() => {
        setValidId(true);
      })
      .catch((_) => setValidId(false))
      .finally(() => setLoading(false));
  }, []);

  async function pullMeeting() {
    const response = await server.get(`/meeting/${id}`, defaultHeaders);
    if (response.status !== 200) return;
    const result = response.data;
    setMeeting(result);
    obtainRelevantAgendaItems(result);
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

  if (!loading && !validId)
    return <RedirectionScreen message={MEETING_NOT_FOUND_ERR} />;
  if (joinerId === meeting?.hostId) {
    return <Redirect to={'/meeting/' + id} />;
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
            lg={10}
            md={12}
            sm={12}
            style={{ paddingLeft: 30, paddingRight: 30 }}
          >
            <p className="Text__header">Hi {name}!</p>
            <p className="Text__subheader">
              You have a meeting <b>{meeting?.name}</b> scheduled on{' '}
              {getFormattedDateTime(meeting?.startedAt)}.
            </p>
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
          </Col>
        </Row>
        <div className="Buffer--20px" />
        <div className="Line--horizontal" />
        <div className="Buffer--20px" />
        <Row>
          <Col lg={1} md={12} sm={12} />
          <Col
            lg={10}
            md={12}
            sm={12}
            style={{ paddingLeft: 30, paddingRight: 30 }}
          >
            <p className="Text__subheader">
              Here are the items you will be presenting:
            </p>
            <Row>{UploadItems()}</Row>
          </Col>
        </Row>

        <div className="Buffer--50px" />
      </Container>
      <div className="Buffer--50px" />
    </div>
  );
}
