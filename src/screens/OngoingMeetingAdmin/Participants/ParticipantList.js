import { Row } from 'react-bootstrap';
import { useMemo } from 'react';

import AwaitItem from './AwaitItem';
import PresentItem from './PresentItem';

export default function ParticipantList({
  meeting,
  setMeeting,
  position,
  shouldShowButton,
}) {
  const participants = useMemo(() => {
    return meeting.participants;
  }, [meeting]);
  const ended = useMemo(
    () => position >= meeting.agendaItems.length,
    [position, meeting],
  );
  return (
    <>
      <Row>
        {participants.map((participant, i) => {
          if (participant.timeJoined != null) {
            return (
              <PresentItem
                meeting={meeting}
                setMeeting={setMeeting}
                position={i}
                showButton={!ended && shouldShowButton}
                key={'Participant' + i}
              />
            );
          } else {
            return (
              <AwaitItem
                meeting={meeting}
                setMeeting={setMeeting}
                position={i}
                showButton={!ended && shouldShowButton}
                key={'Participant' + i}
              />
            );
          }
        })}
      </Row>
      <div className="Buffer--100px" />
    </>
  );
}
