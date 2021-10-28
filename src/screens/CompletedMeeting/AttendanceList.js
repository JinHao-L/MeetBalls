import PropTypes from 'prop-types';
import { Button, Collapse } from 'react-bootstrap';
import { useState } from 'react';
import ParticipantItem, { participantProp } from './ParticipantItem'
import downloadFile from '../../utils/downloadFile';

export default function AttendanceList({ participants, name }) {
  const [showPresent, setShowPresent] = useState(true);
  const [showAbsent, setShowAbsent] = useState(true);
  const filteredParticipants = participants.filter((x) => !x.isDuplicate);
  const numTotal = filteredParticipants.length;

  const attendees = filteredParticipants
    .filter((person) => person.timeJoined)
    .map((person, idx) => <ParticipantItem person={person} key={idx} />);
  const numPresent = attendees.length;

  const absentees = filteredParticipants
    .filter((person) => !person.timeJoined)
    .map((person, idx) => <ParticipantItem person={person} key={idx} />);
  const numAbsent = absentees.length;

  const fileName = `${name} Attendance.csv`;

  function DownloadButton() {
    return (
      <Button
        className="d-grid gap-2 Text--no-decoration"
        onClick={() => downloadAsCsv(participants, fileName)}
        block="true"
      >
        Export to CSV
      </Button>
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
          <p className="Text__subheader">
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
          <p className="Text__subheader">
            Absent: {numAbsent}/{numTotal}
          </p>
          <div className="Buffer--10px" />
          <CollapseToggle show={showAbsent} setShow={setShowAbsent} />
        </div>
        <Collapse in={showAbsent}>
          <div>{absentees}</div>
        </Collapse>
      </div>
    </div>
  );
}

AttendanceList.propTypes = {
  participants: PropTypes.arrayOf(participantProp),
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
  const csvHeader = 'data:text/csv;charset=utf-8,Name,Email,Joined\n';
  const csvString = csvHeader + sortedList.map(toCsvString).join('\n');
  return encodeURI(csvString);
}

function downloadAsCsv(participants, fileName) {
  const csvString = exportToCsv(participants);
  downloadFile(csvString, fileName);
}

function CollapseToggle({ show, setShow }) {
  return (
    <div className="Text__hint Clickable" onClick={() => setShow(!show)}>
      {show ? 'Collapse' : 'Expand'}
    </div>
  );
}
