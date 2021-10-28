import { Row, Col, Button, Spinner } from 'react-bootstrap';

export default function ControlToggle({
  position,
  time,
  agenda,
  id,
  startMeeting,
  nextItem,
  loadingNextItem,
}) {
  if (position < 0) {
    return (
      <Button onClick={() => startMeeting(time, agenda, id)}>
        Start Meeting
      </Button>
    );
  } else if (position < agenda.length) {
    const isLastItem = position === agenda.length - 1;
    return (
      <Row>
        {/* <Col className="d-grid gap-2">
          <Button disabled={loadingNextItem}>
            Prev Item{' '}
            {loadingNextItem && (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            )}
          </Button>
        </Col> */}
        <Col className="d-grid gap-2">
          <Button
            onClick={() => nextItem(time, agenda, id)}
            disabled={loadingNextItem}
          >
            {isLastItem ? 'Finish Meeting' : 'Next Item'}{' '}
            {loadingNextItem && (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            )}
          </Button>
        </Col>
      </Row>
    );
  } else {
    return (
      <Button href={`/completed/${id}`} disabled={loadingNextItem}>
        Meeting Ended - View Report{' '}
        {loadingNextItem && (
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
        )}
      </Button>
    );
  }
}
