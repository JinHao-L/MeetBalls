// import { useState } from 'react';
import { toast } from 'react-toastify';
import ParticipantItem from './ParticipantItem';
import ImportParticipantButton from './ImportParticipantsButton'
import parseCsvToObjects from '../../utils/parseCsvToObjects';
import { createParticipants } from '../../services/participants'

export default function ParticipantItemList({ meeting, setMeeting }) {
  // const [loading, setLoading] = useState(false);

  const handleFile = (file) => uploadParticipants(file, meeting.id);

  const items = [];
  items.push(
    <ImportParticipantButton key="btn" handleFile={handleFile}/>
  );
  for (let i = 0; i < meeting.participants.length; i++) {
    items.push(
      <ParticipantItem
        key={'participant' + i}
        meeting={meeting}
        setMeeting={setMeeting}
        position={i}
      />,
    );
  }
  return items;
}

const PARTICIPANTS_HEADER_ERROR = 'Invalid header row! Columns should be labeled "Name" and "Email" (case-specific)!';

function uploadParticipants(file, meetingId) {
  if (!file) {
    console.log('No file uploaded');
    return;
  } else if (file.type !== 'text/csv') {
    throw new Error('Invalid file type!');
  }

  const callback = (res) => createParticipants(meetingId, res);
  parseCsvToObjects(file, ['Name', 'Email'], callback, PARTICIPANTS_HEADER_ERROR);
}


