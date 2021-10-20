import { Col, Row, Image, Button } from 'react-bootstrap';
import LoginImage from '../../assets/login.jpg';
import { zoomClientId, zoomRedirectUrl } from '../../common/CommonValues';

export default function ZoomLoginScreen() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: zoomClientId,
    redirect_uri: zoomRedirectUrl,
    state:
      process.env.REACT_APP_LOCAL_ENV === 'development'
        ? process.env.REACT_APP_REDIRECT_SECRET
        : '',
  });

  return (
    <Row style={{ marginLeft: 0, marginRight: 0 }}>
      <Col
        sm={12}
        md={12}
        lg={8}
        className="d-none d-lg-block"
        style={{ paddingLeft: 0, paddingRight: 0 }}
      >
        <Image src={LoginImage} className="Image__login" />
      </Col>
      <Col sm={12} md={12} lg={4} style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className=" Container__padding--vertical Container__login-screen">
          <p className="Text__header">Get the ball rolling</p>
          <p className="Text__subheader">with MeetBalls</p>
          <div className="Buffer--10px" />
          <Button
            variant="zoom"
            style={{ width: 200 }}
            href={`https://zoom.us/oauth/authorize?${params.toString()}`}
          >
            Login With Zoom
          </Button>
        </div>
      </Col>
    </Row>
  );
}
