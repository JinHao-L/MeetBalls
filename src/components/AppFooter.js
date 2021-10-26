import { Container, Row, Col, Nav } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { Facebook, Instagram } from 'react-bootstrap-icons';
import { FaTiktok } from 'react-icons/fa';

export default function AppFooter() {
  const history = useHistory();

  return (
    <>
      <div className="Line--horizontal" />
      <Container className="Container__footer">
        <Row>
          <Col sm={12} md={12} lg={12} className="Container__row--center">
            <a
              target="_blank"
              rel="noreferrer"
              href="https://www.facebook.com/MeetBallsApp/"
              className="Container__row--center"
            >
              <Facebook size={24} style={{ color: '8F6B58' }} />
            </a>
            <div className="Buffer--10px" />
            <a
              target="_blank"
              rel="noreferrer"
              href="https://www.instagram.com/meetballsapp/"
              className="Container__row--center"
            >
              <Instagram size={24} style={{ color: '8F6B58' }} />
            </a>
            <div className="Buffer--10px" />
            <a
              target="_blank"
              rel="noreferrer"
              href="https://www.tiktok.com/@meetballsapp"
              className="Container__row--center"
            >
              <FaTiktok size={24} style={{ color: '8F6B58' }} />
            </a>
            <div className="Buffer--20px" />
            <div className="Line--vertical" />
            <div className="Buffer--20px" />
            <Nav variant="footer">
              <Nav.Link onClick={() => history.push('/documentation')}>
                Documentations
              </Nav.Link>
              <div className="Buffer--20px" />
              <Nav.Link onClick={() => history.push('/support')}>
                Support
              </Nav.Link>
              <div className="Buffer--20px" />
              <Nav.Link onClick={() => history.push('/privacy-policy')}>
                Privacy Policy
              </Nav.Link>
              <div className="Buffer--20px" />
              <Nav.Link onClick={() => history.push('/terms')}>
                Terms {'&'} Conditions
              </Nav.Link>
            </Nav>
          </Col>
          <Col>
            <div className="Buffer--20px" />
            <p style={{ color: '#8F6B58' }} className="Text__small">
              &copy; Copyright {new Date().getFullYear()}, MeetBalls
            </p>
          </Col>
        </Row>
      </Container>
    </>
  );
}
