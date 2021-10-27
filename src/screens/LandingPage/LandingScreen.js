import { Container, Image, Button, Row, Col, Card } from 'react-bootstrap';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa';
import LandingImage from '../../assets/landing_image.png';
import BackgroundImage from '../../assets/background_pattern.jpg';
import PatternImage from '../../assets/pattern.png';
import { Redirect } from 'react-router';
import AppFooter from '../../components/AppFooter';
import { useContext, useEffect } from 'react';
import { logEvent } from '@firebase/analytics';
import { googleAnalytics } from '../../services/firebase';
import { UserContext } from '../../context/UserContext';

import ImageAddMeeting from '../../assets/Landing/add_meeting.jpg';
import ImageAddAgenda from '../../assets/Landing/add_agenda.jpg';
import ImageAddParticipant from '../../assets/Landing/add_participant.png';
import ImageEmailInvite from '../../assets/Landing/email_invites.png';
import ImageAttendance from '../../assets/Landing/attendance.png';
import ImageAlarm from '../../assets/Landing/alarm.png';
import ImageStats from '../../assets/Landing/stats.jpg';
import ImageMassEmail from '../../assets/Landing/mass_email.png';
import ImageUploadFile from '../../assets/Landing/upload_file.png';
import ImageSuggestion from '../../assets/Landing/suggestion.png';
import ImageAccessFile from '../../assets/Landing/view_materials.png';
import ImageEndTime from '../../assets/Landing/end_time.png';

export default function LandingScreen() {
  const user = useContext(UserContext);

  useEffect(() => {
    logEvent(googleAnalytics, 'visit_landing_page');
  }, []);

  if (user) return <Redirect to="/home" />;

  return (
    <div>
      <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
        <Row style={{ marginLeft: 0, marginRight: 0 }}>
          <Col
            sm={12}
            md={12}
            lg={6}
            style={{ paddingLeft: 0, paddingRight: 0 }}
          >
            <Image src={PatternImage} className="Image__landing-pattern" />
            <div className="Container__center--vertical">
              <div className="Buffer--100px" />
              <div className="Container__padding--horizontal">
                <p className="Text__header">Get the Ball Rolling</p>
                <p className="Text__subheader">
                  Plan, track {'&'} analyse your meetings on Meetballs{' '}
                </p>
                <p>• Keep track of attendance</p>
                <p>• Pace your meetings with intelligent agenda</p>
                <p>• Invite participants to join</p>
                <p>• Analyse meeting statistics</p>
                <div className="Buffer--20px" />
                <Button
                  className="social-link-btn"
                  variant="outline-facebook"
                  href="https://www.facebook.com/MeetBallsApp/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaFacebook size={23} style={{ marginRight: 10 }} />
                  Find Us On Facebook
                </Button>
                <div className="Buffer--20px" />
                <Button
                  className="social-link-btn"
                  variant="outline-primary"
                  href="https://www.instagram.com/meetballsapp/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaInstagram size={23} style={{ marginRight: 10 }} />
                  Find Us On Instagram
                </Button>
                <div className="Buffer--20px" />
                <Button
                  className="social-link-btn"
                  variant="outline-tiktok"
                  href="https://www.tiktok.com/@meetballsapp"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaTiktok size={23} style={{ marginRight: 10 }} />
                  Find Us On TikTok
                </Button>
              </div>
            </div>
          </Col>
          <Col
            sm={0}
            md={0}
            lg={6}
            className="d-none d-lg-block"
            style={{ paddingLeft: 0, paddingRight: 0 }}
          >
            <Image src={LandingImage} fluid />
          </Col>
        </Row>
        <div className="Buffer--100px" />
        <div
          style={{
            backgroundImage: `url(${BackgroundImage})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            paddingBottom: 30,
            paddingTop: 30,
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          <Container>
            <div
              style={{
                position: 'relative',
                paddingBottom: '56.25%',
                paddingLeft: 'auto',
                paddingRight: 'auto',
                textAlign: 'center',
              }}
            >
              <iframe
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  borderRadius: 5,
                  top: 0,
                  left: 0,
                }}
                src={'https://www.youtube.com/embed/c8qQhg3S80s'}
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Container>
        </div>
        <Container>
          <div className="Buffer--50px" />
          <Container>
            <Card style={{ padding: 20 }} bg="landing1">
              <p className="Text__header" style={{ color: 'white' }}>
                Plan Meetings
              </p>
              <Row>
                <Col
                  sm={12}
                  md={6}
                  lg={3}
                  className="Container__padding--vertical-medium"
                >
                  <Card style={{ height: '100%' }} bg="landing-content1">
                    <Card.Img src={ImageAddMeeting} />
                    <div className="Line--horizontal" />
                    <Card.Body>
                      <Card.Title>
                        Create a new meeting or clone an existing one.
                      </Card.Title>
                      <Card.Text>
                        Link a Zoom meeting to MeetBalls. Clone an existing
                        MeetBalls meeting to copy over participants and agenda
                        items to the new meeting.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col
                  sm={12}
                  md={6}
                  lg={3}
                  className="Container__padding--vertical-medium"
                >
                  <Card style={{ height: '100%' }} bg="landing-content1">
                    <Card.Img src={ImageAddParticipant} />
                    <div className="Line--horizontal" />
                    <Card.Body>
                      <Card.Title>Add participants to the meeting.</Card.Title>
                      <Card.Text>
                        Fill the participants list to make use of the various
                        features that MeetBalls has, including attendance taking
                        and sending of email invitations.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col
                  sm={12}
                  md={6}
                  lg={3}
                  className="Container__padding--vertical-medium"
                >
                  <Card style={{ height: '100%' }} bg="landing-content1">
                    <Card.Img src={ImageAddAgenda} />
                    <div className="Line--horizontal" />
                    <Card.Body>
                      <Card.Title>Plan the agenda for the meeting.</Card.Title>
                      <Card.Text>
                        Add agenda items to the agenda to view them during the
                        meeting. Attach files to agenda items and link
                        participants to agenda items.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col
                  sm={12}
                  md={6}
                  lg={3}
                  className="Container__padding--vertical-medium"
                >
                  <Card style={{ height: '100%' }} bg="landing-content1">
                    <Card.Img src={ImageEmailInvite} />
                    <div className="Line--horizontal" />
                    <Card.Body>
                      <Card.Title>
                        Send out invites to all participants.
                      </Card.Title>
                      <Card.Text>
                        Inviting pariticipants to the meeting is just 2 clicks
                        away. Participants will receive personalized email with
                        their very own link to access the meeting.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card>
            <div className="Buffer--20px" />
            <Card style={{ padding: 20 }} bg="landing2">
              <Row>
                <p className="Text__header" style={{ color: 'white' }}>
                  Join Meetings
                </p>
                <Col
                  sm={12}
                  md={6}
                  lg={3}
                  className="Container__padding--vertical-medium"
                >
                  <Card style={{ height: '100%' }} bg="landing-content2">
                    <Card.Img src={ImageUploadFile} />
                    <div className="Line--horizontal" />
                    <Card.Body>
                      <Card.Title>
                        Upload files for your presentations.
                      </Card.Title>
                      <Card.Text>
                        View the items you are presenting during the meeting and
                        attach relevant files or link via the invitation link
                        sent to your email.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col
                  sm={12}
                  md={6}
                  lg={3}
                  className="Container__padding--vertical-medium"
                >
                  <Card style={{ height: '100%' }} bg="landing-content2">
                    <Card.Img src={ImageSuggestion} />
                    <div className="Line--horizontal" />
                    <Card.Body>
                      <Card.Title>
                        Suggests topics for meeting agenda.
                      </Card.Title>
                      <Card.Text>
                        Have something to discuss or present during the meeting?
                        Leave a suggestion and the meeting host will be able to
                        see it.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col
                  sm={12}
                  md={6}
                  lg={3}
                  className="Container__padding--vertical-medium"
                >
                  <Card style={{ height: '100%' }} bg="landing-content2">
                    <Card.Img src={ImageAccessFile} />
                    <div className="Line--horizontal" />
                    <Card.Body>
                      <Card.Title>
                        Access files for each presentation.
                      </Card.Title>
                      <Card.Text>
                        Before or during the meeting, you can gain access to the
                        files the presenter has uploaded from the agenda list.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col
                  sm={12}
                  md={6}
                  lg={3}
                  className="Container__padding--vertical-medium"
                >
                  <Card style={{ height: '100%' }} bg="landing-content2">
                    <Card.Img src={ImageEndTime} />
                    <div className="Line--horizontal" />
                    <Card.Body>
                      <Card.Title>
                        Get an estimate of when the meeting will end.
                      </Card.Title>
                      <Card.Text>
                        Your time is precious. MeetBalls provides an estimated
                        end time of the meeting based on the items remaining in
                        the agenda.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card>
            <div className="Buffer--20px" />
            <Card style={{ padding: 20 }} bg="landing3">
              <Row>
                <p className="Text__header" style={{ color: 'white' }}>
                  Track Meetings
                </p>
                <Col
                  sm={12}
                  md={6}
                  lg={3}
                  className="Container__padding--vertical-medium"
                >
                  <Card style={{ height: '100%' }} bg="landing-content3">
                    <Card.Img src={ImageAttendance} />
                    <div className="Line--horizontal" />
                    <Card.Body>
                      <Card.Title>Take attendance automatically.</Card.Title>
                      <Card.Text>
                        Thanks to integration with Zoom, MeetBalls is able to
                        automatically update the attendance list when the
                        participant enters the Zoom meeting.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col
                  sm={12}
                  md={6}
                  lg={3}
                  className="Container__padding--vertical-medium"
                >
                  <Card style={{ height: '100%' }} bg="landing-content3">
                    <Card.Img src={ImageAlarm} />
                    <div className="Line--horizontal" />
                    <Card.Body>
                      <Card.Title>
                        Be alerted when you exceed the time limit.
                      </Card.Title>
                      <Card.Text>
                        Stay on track of your schedule with MeetBalls. When time
                        is up for an item, the bell will go off to alert you to
                        move on to the next item.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col
                  sm={12}
                  md={6}
                  lg={3}
                  className="Container__padding--vertical-medium"
                >
                  <Card style={{ height: '100%' }} bg="landing-content3">
                    <Card.Img src={ImageStats} />
                    <div className="Line--horizontal" />
                    <Card.Body>
                      <Card.Title>
                        Analyse and learn from past meeting.
                      </Card.Title>
                      <Card.Text>
                        View meeting statistics, attendance and duration of each
                        agenda item from past meetings.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col
                  sm={12}
                  md={6}
                  lg={3}
                  className="Container__padding--vertical-medium"
                >
                  <Card style={{ height: '100%' }} bg="landing-content3">
                    <Card.Img src={ImageMassEmail} />
                    <div className="Line--horizontal" />
                    <Card.Body>
                      <Card.Title>
                        Mass email to participants after the meeting.
                      </Card.Title>
                      <Card.Text>
                        Need to send out meeting minutes? Include all
                        participants in your email with just a click of a button
                        from any completed meeting.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Container>

          <div className="Buffer--50px" />
        </Container>
      </Container>
      <AppFooter />
    </div>
  );
}
