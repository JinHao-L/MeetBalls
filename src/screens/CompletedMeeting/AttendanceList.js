import PropTypes from 'prop-types';
import {
  getFormattedDateTime,
  getFormattedDate,
} from '../../common/CommonFunctions';
import { Button, Card, Col, Collapse } from 'react-bootstrap';
import { useState } from 'react';

export default function AttendanceList({ participants, date }) {
  const [showPresent, setShowPresent] = useState(true);
  const [showAbsent, setShowAbsent] = useState(true);

  const numTotal = participants.length;

  const attendees = participants
    .filter((person) => person.timeJoined)
    .map((person, idx) => <ParticipantItem person={person} key={idx} />);
  const numPresent = attendees.length;

  const absentees = participants
    .filter((person) => !person.timeJoined)
    .map((person, idx) => <ParticipantItem person={person} key={idx} />);
  const numAbsent = absentees.length;

  const dateStr = getFormattedDate(date);
  const fileName = `attendance_list_${dateStr}.csv`;

  function DownloadButton() {
    return (
      <a
        href={exportToCsv(participants)}
        style={{ textDecoration: 'none' }}
        className="d-grid gap-2"
        download={fileName}
      >
        <div className="d-grid gap-2">
          <Button block="true">Export to CSV</Button>
        </div>
      </a>
    );
  }

  return (
    <div>
      <div className="d-grid gap-2">
        <DownloadButton />
      </div>
      <div className="Buffer--20px" />
      <div>
        <div className="Container__row--space-between">
          <p className="Text__subheader" style={{ marginBottom: 10 }}>
            Present: {numPresent}/{numTotal}
          </p>
          <CollapseToggle show={showPresent} setShow={setShowPresent} />
        </div>
        <Collapse in={showPresent}>
          <div>{attendees}</div>
        </Collapse>
      </div>
      <div className="Buffer--20px" />
      <div>
        <div className="Container__row--space-between">
          <p className="Text__subheader" style={{ marginBottom: 10 }}>
            Absent: {numAbsent}/{numTotal}
          </p>
          <CollapseToggle show={showAbsent} setShow={setShowAbsent} />
        </div>
        <Collapse in={showAbsent}>
          <div>{absentees}</div>
        </Collapse>
      </div>
    </div>
  );
}

const participantProp = PropTypes.shape({
  userEmail: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  timeJoined: PropTypes.string,
  role: PropTypes.number,
});

AttendanceList.propTypes = {
  participants: PropTypes.arrayOf(participantProp),
};

function ParticipantItem({ person }) {
  const displayName = person.userName;
  const joinedTime = person.timeJoined;
  const presence = joinedTime
    ? `Joined: ${getFormattedDateTime(joinedTime)}`
    : 'Absent';

  return (
    <Col className="Container__padding--vertical-small">
      <Card>
        <Card.Body>
          <Card.Title>{displayName}</Card.Title>
          <Card.Text>{person.userEmail}</Card.Text>
          <Card.Text>{presence}</Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );
}

ParticipantItem.propTypes = {
  person: participantProp,
};

function sortByPresence(first, second) {
  if (first.timeJoined && !second.timeJoined) return -1;
  if (!first.timeJoined && second.timeJoined) return 1;
  return 0;
}

function toCsvString(person) {
  return [
    person.userName,
    person.userEmail,
    person.timeJoined ? person.timeJoined : 'absent',
  ].join(',');
}

function exportToCsv(participants) {
  if (!participants) return '#';
  const sortedList = participants.sort(sortByPresence);
  console.log(sortedList);
  const csvString =
    'data:text/csv;charset=utf-8,' + sortedList.map(toCsvString).join('\n');
  console.log(csvString);
  return encodeURI(csvString);
}

function CollapseToggle({ show, setShow }) {
  return (
    <a className="Text__toggle" onClick={() => setShow(!show)}>
      {show ? 'Collapse' : 'Expand'}
    </a>
  );
}
