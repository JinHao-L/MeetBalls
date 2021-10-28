import { Col, Card } from 'react-bootstrap';
import { getFormattedDuration } from '../../common/CommonFunctions';
import {
  MaterialsSection,
  SpeakerSection,
} from '../../components/AgendaItemComponents';
import { useRef, useEffect } from 'react';

export default function AgendaList({ time, agenda, position }) {
  const currentItemRef = useRef();

  console.log(currentItemRef.current);

  useEffect(() => {
    currentItemRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [position]);

  const items = [];
  if (position >= agenda.length) {
    for (let i = 0; i < agenda.length; i++) {
      items.push(
        <ActiveItem
          item={agenda[i]}
          key={'Item ' + i}
          isPassed={i < position}
          isEnded={true}
        />,
      );
    }
  } else {
    for (let i = 0; i < agenda.length; i++) {
      if (agenda[i].startTime === null) {
        items.push(<NotStartedItem item={agenda[i]} key={'Item ' + i} />);
      } else if (i === position) {
        items.push(
          <CurrentItem
            item={agenda[i]}
            time={time}
            key="Item Current"
            reference={currentItemRef}
          />,
        );
      } else {
        items.push(
          <ActiveItem
            item={agenda[i]}
            key={'Item ' + i}
            isPassed={i < position}
            isEnded={false}
          />,
        );
      }
    }
  }
  return (
    <>
      {items}
      <div className="Buffer--100px" />
    </>
  );
}

function NotStartedItem({ item }) {
  return (
    <Col className="Container__padding--vertical-small">
      <Card>
        <Card.Body>
          <Card.Title>{item.name}</Card.Title>
          <SpeakerSection item={item} />
          <div className="Buffer--10px" />
          <Card.Text>{item.description}</Card.Text>
          <MaterialsSection item={item} />
        </Card.Body>
        <Card.Footer>
          <Card.Text>
            Estimated Duration: {getFormattedDuration(item.expectedDuration)}
          </Card.Text>
        </Card.Footer>
      </Card>
    </Col>
  );
}

function CurrentItem({ item, time, reference }) {
  const currentDuration = time - item.startTime;
  const timeRemaining = item.actualDuration - currentDuration;
  const exceeded = currentDuration - item.expectedDuration;
  let timeRemainingText =
    'Time Remaining: ' +
    getFormattedDuration(timeRemaining - (timeRemaining % 1000));
  if (exceeded > 0) {
    const exceededTime = getFormattedDuration(exceeded - (exceeded % 60000));
    timeRemainingText += ` ( Exceeded by ${exceededTime})`;
  }
  return (
    <Col className="Container__padding--vertical-small" ref={reference}>
      <Card bg={timeRemaining > 0 ? 'primary' : 'danger'} text="light">
        <Card.Body>
          <Card.Title>{item.name}</Card.Title>
          <SpeakerSection item={item} />
          <Card.Text>{item.description}</Card.Text>
          <MaterialsSection
            item={item}
            variant={timeRemaining > 0 ? 'secondary' : 'outline-danger'}
          />
        </Card.Body>
        <Card.Footer>
          <Card.Text>{timeRemainingText}</Card.Text>
        </Card.Footer>
      </Card>
    </Col>
  );
}

function ActiveItem({ item, isPassed, isEnded }) {
  var opacity = 1;
  if (isPassed && !isEnded) opacity = 0.5;
  return (
    <Col className="Container__padding--vertical-small">
      <Card style={{ opacity: opacity }}>
        <Card.Body>
          <Card.Title>{item.name}</Card.Title>
          <SpeakerSection item={item} />
          <Card.Text>{item.description}</Card.Text>
          <MaterialsSection item={item} variant={'outline-primary'} />
        </Card.Body>
        <Card.Footer>
          <Card.Text>
            {isPassed ? null : 'Expected '}Duration:{' '}
            {getFormattedDuration(item.actualDuration)}
          </Card.Text>
        </Card.Footer>
      </Card>
    </Col>
  );
}
