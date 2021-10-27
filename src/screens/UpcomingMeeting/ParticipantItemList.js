import { toast } from 'react-toastify';
import ParticipantItem from './ParticipantItem';
import ImportParticipantButton from './ImportParticipantsButton'
import parseCsvToObjects from '../../utils/parseCsvToObjects';
import { createParticipants } from '../../services/participants'
import { useEffect, useRef, useState } from 'react';
import { extractError } from '../../utils/extractError';
import unmount from '../../utils/unmount';

const PARTICIPANTS_HEADER_ERROR = 'Invalid header row! Columns should be labeled "Name" and "Email" (case-specific)!';

export default function ParticipantItemList({ meeting, setMeeting }) {
  const handleFile = (file) => uploadParticipants(file, meeting.id, setMeeting);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return unmount(mounted, 'ParticipantItemList');
  }, []);

  function uploadParticipants(file) {
    setLoading(true);
    if (!file) {
      console.log('No file uploaded');
      return;
    } else if (file.type !== 'text/csv') {
      throw new Error('Invalid file type!');
    }
  
    parseCsvToObjects(file, ['Name', 'Email'], updateDataBase, PARTICIPANTS_HEADER_ERROR);
  }
  
  async function updateDataBase(fileContents) {
    const participants = convertToParticipants(meeting.id, fileContents);
    try {
      const response = await createParticipants(participants);
      const newParticipants = response?.data;
      const newMeeting = Object.assign({}, meeting);

      newMeeting.participants.concat(newParticipants);
      setMeeting(newMeeting);
    } catch (e) {
      toast.error(extractError(e));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  const items = [];
  items.push(
    <ImportParticipantButton loading={loading} key="btn" handleFile={handleFile}/>
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

function convertToParticipants(meetingId, res) {
  const participants = res.map((p) => {
    return {
      meetingId: meetingId,
      userName: p['Name'],
      userEmail: p['Email']
    };
  });
  return participants;
}
