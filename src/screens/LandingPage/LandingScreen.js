import { Container, Image, Button, Row, Col, Card } from 'react-bootstrap';
import { Facebook, Instagram } from 'react-bootstrap-icons';
import LandingImage from '../../assets/landing_image.png';
import BackgroundImage from '../../assets/background_pattern.jpg';
import PatternImage from '../../assets/pattern.png';
import AgendaImage from '../../assets/guide_agenda_list.jpg';
import MeetingImage from '../../assets/guide_ongoing_meeting.jpg';
import StatisticsImage from '../../assets/guide_report.jpg';
import { useHistory } from 'react-router';
import AppFooter from '../../components/AppFooter';
import { useEffect } from 'react';
import { logEvent } from '@firebase/analytics';
import { googleAnalytics } from '../../services/firebase';

export default function LandingScreen() {
  const history = useHistory();

  useEffect(() => {
    logEvent(googleAnalytics, 'visit_landing_page');
  }, []);

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
                <p>• Mass email participants</p>
                <p>• Analyse meeting statistics</p>
                <p>• Save audio transcripts from zoom (Coming Soon)</p>
                <div className="Buffer--20px" />
                <Button
                  variant="outline-facebook"
                  onClick={() => {
                    window.open('https://www.facebook.com/MeetBallsApp/');
                  }}
                >
                  <Facebook size={23} style={{ marginRight: 10 }} />
                  Find Us On Facebook
                </Button>
                <div className="Buffer--20px" />
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    window.open('https://www.instagram.com/meetballsapp/');
                  }}
                >
                  <Instagram size={23} style={{ marginRight: 10 }} />
                  Find Us On Instgram
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
          }}
        >
          <div className="Buffer--50px" />
          <p
            className="Text__header"
            style={{ textAlign: 'center', color: 'white' }}
          >
            Key Features
          </p>
          <div className="Buffer--20px" />
          <Container>
            <Row>
              <Col
                sm={12}
                md={6}
                lg={4}
                className="Container__padding--vertical-small"
              >
                <Card>
                  <Card.Img variant="top" src={AgendaImage} />
                  <div className="Line--horizontal" />
                  <Card.Body>
                    <Card.Title>Plan Your Meetings</Card.Title>
                    <Card.Text>
                      Add attendees and agenda before meeting, and send out mass
                      emails to all participants.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col
                sm={12}
                md={6}
                lg={4}
                className="Container__padding--vertical-small"
              >
                <Card>
                  <Card.Img variant="top" src={MeetingImage} />
                  <div className="Line--horizontal" />
                  <Card.Body>
                    <Card.Title>Stay Focused</Card.Title>
                    <Card.Text>
                      MeetBalls helps you to mark attendance, and track timing
                      for each agenda item during the meeting.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col
                sm={12}
                md={6}
                lg={4}
                className="Container__padding--vertical-small"
              >
                <Card>
                  <Card.Img variant="top" src={StatisticsImage} />
                  <div className="Line--horizontal" />
                  <Card.Body>
                    <Card.Title>Gain Insights</Card.Title>
                    <Card.Text>
                      After the meeting, view who was absent from the meeting,
                      as well as how long each item took.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
          <div className="Buffer--20px" />
          <div className="Container__row--center">
            <Button
              variant="secondary"
              onClick={() => history.push('/documentation')}
            >
              Learn More
            </Button>
          </div>
          <div className="Buffer--50px" />
        </div>
      </Container>
      <AppFooter />
    </div>
  );
}
