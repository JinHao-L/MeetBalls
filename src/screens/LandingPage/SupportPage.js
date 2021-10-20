import { Image, Row, Col } from 'react-bootstrap';
import Banner from '../../assets/banner_privacy.jpg';
import AppFooter from '../../components/AppFooter';

export default function SupportPage() {
  return (
    <>
      <div className="Banner">
        <Image src={Banner} className="Image__banner" />
        <div className="Container__center--vertical Banner__content">
          <p className="Text__header" style={{ color: 'white' }}>
            Support
          </p>
        </div>
      </div>
      <Row
        className="Container__padding--vertical Container__padding--horizontal"
        style={{
          marginLeft: 0,
          marginRight: 0,
          minHeight: 'calc(100vh - 56px - 121px - 300px)',
        }}
      >
        <Col sm={12} md={12} lg={{ span: 6, offset: 3 }}>
          <div className="Buffer--20px" />
          <p className="Text__header">Got any questions?</p>
          <p className="Text__paragraph">
            MeetBalls is committed to providing you with the finest experience.
          </p>
          <p className="Text__paragraph">
            For any enqueries or feedback regarding MeetBalls, please email us
            at{' '}
            <b>
              <a
                href="mailto:zoommeetballs@gmail.com"
                className="Text--no-decoration"
              >
                zoommeetballs@gmail.com
              </a>
            </b>{' '}
            and we will try to get back to you within 3 working days.
          </p>
        </Col>
      </Row>
      <AppFooter />
    </>
  );
}
